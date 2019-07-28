from datetime import date
from typing import List

import graphene
from django.db import models, transaction

from atlas.constants import FIELD_MODEL_MAP, RESTRICTED_FIELDS, SUPERUSER_ONLY_FIELDS
from atlas.models import Office, Profile, User
from atlas.schema import UserInput
from atlas.tasks import update_profile


def is_chain_of_command(user, maybe_manager):
    cur_user = user
    while cur_user.profile.reports_to_id:
        if cur_user.profile.reports_to_id == maybe_manager.id:
            return True
        cur_user = cur_user.profile.reports_to
    return False


def process_item(current_user: User, data: UserInput) -> List[str]:
    try:
        user = User.objects.select_related("profile").get(id=data.pop("id"))
    except (User.DoesNotExist, KeyError):
        return ["Invalid user"]

    # three conditions where you can edit a user
    # - the user is you (you can edit some fields)
    # - the user is in your chain of command (you're their boss)
    # - you're a superuser (IT, HR)
    is_restricted = not current_user.is_superuser and not is_chain_of_command(
        user, current_user
    )
    if user.id != current_user.id and is_restricted:
        return ["Cannot edit this user"]

    invalid_fields = (
        [f for f in data.keys() if f in RESTRICTED_FIELDS] if is_restricted else []
    )
    invalid_fields.extend(
        [f for f in data.keys() if f in SUPERUSER_ONLY_FIELDS]
        if not current_user.is_superuser
        else []
    )
    if invalid_fields:
        return [f"Cannot update field: {f}" for f in invalid_fields]

    profile, _ = Profile.objects.get_or_create(user=user)
    user.profile = profile

    updates = {}
    model_updates = {User: {}, Profile: {}}

    flattened_data = data.copy()
    flattened_data.update(flattened_data.pop("social", {}))
    flattened_data.update(flattened_data.pop("gamer_tags", {}))
    for field, value in flattened_data.items():
        if value == "":
            value = None

        if is_restricted and field in RESTRICTED_FIELDS:
            continue

        if not current_user.is_superuser and field in SUPERUSER_ONLY_FIELDS:
            continue

        if field == "office" and value:
            value = Office.objects.get(id=value)
        elif field == "reports_to" and value:
            if value == user.id:
                return [f"Cannot set reports_to to self"]
            value = User.objects.get(id=value)

        model = FIELD_MODEL_MAP[field]
        if model is User:
            cur_attr = getattr(user, field)
        elif model is Profile:
            cur_attr = getattr(profile, field)
        else:
            raise NotImplementedError

        if cur_attr != value:
            model_updates[model][field] = value
            if isinstance(value, date):
                value = value.isoformat()

            # track update for two-way sync
            if isinstance(value, models.Model):
                value = value.pk
            updates[field] = value

    with transaction.atomic():
        for model, values in model_updates.items():
            if values:
                if model is User:
                    instance = user
                elif model is Profile:
                    instance = profile
                for key, value in values.items():
                    setattr(instance, key, value)
                instance.save(update_fields=values.keys())

    if updates:
        update_profile.delay(user_id=user.id, updates=updates)


class BatchResult(graphene.ObjectType):
    id = graphene.UUID()
    ok = graphene.Boolean()
    errors = graphene.List(graphene.String)


class UpdatePeople(graphene.Mutation):
    class Arguments:
        data = graphene.List(UserInput, required=True)

    ok = graphene.Boolean()
    errors = graphene.List(graphene.String)
    results = graphene.Field(BatchResult)

    def mutate(self, info, data: List[UserInput]):
        current_user = info.context.user
        if not current_user.is_authenticated:
            return UpdatePeople(ok=False, errors=["Authentication required"])

        results = []
        for item in data:
            errors = process_item(current_user, item)
            results.append(BatchResult(errors=errors, ok=not errors, id=item.id))
        return UpdatePeople(ok=True, results=results)
