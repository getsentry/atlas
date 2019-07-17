from datetime import date

import graphene
from django.db import transaction

from atlas.models import Profile, User
from atlas.schema import Nullable, PhoneNumberField, UserNode
from atlas.tasks import update_profile


def is_chain_of_command(user, maybe_manager):
    cur_user = user
    while cur_user.profile.reports_to_id:
        if cur_user.profile.reports_to_id == maybe_manager.id:
            return True
        cur_user = cur_user.profile.reports_to
    return False


FIELD_MODEL_MAP = {
    "name": User,
    "handle": Profile,
    "date_of_birth": Profile,
    "date_started": Profile,
    "department": Profile,
    "title": Profile,
    "reports_to": Profile,
    "primary_phone": Profile,
    "is_human": Profile,
}

RESTRICTED_FIELDS = frozenset(
    ["name", "date_of_birth", "date_started", "title", "department", "reports_to"]
)

SUPERUSER_ONLY_FIELDS = frozenset(["is_human"])


class UserInput(graphene.InputObjectType):
    name = graphene.String(required=False)
    handle = graphene.String(required=False)
    date_of_birth = Nullable(graphene.Date, required=False)
    date_started = Nullable(graphene.Date, required=False)
    title = graphene.String(required=False)
    department = graphene.String(required=False)
    reports_to = graphene.String(required=False)
    primary_phone = Nullable(PhoneNumberField, required=False)
    is_human = graphene.Boolean(required=False)


class UpdateUser(graphene.Mutation):
    class Arguments:
        user = graphene.UUID(required=True)
        data = UserInput(required=True)

    ok = graphene.Boolean()
    errors = graphene.List(graphene.String)
    user = graphene.Field(UserNode)

    def mutate(self, info, user: str, data: UserInput):
        current_user = info.context.user
        if not current_user.is_authenticated:
            return UpdateUser(ok=False, errors=["Authentication required"])

        try:
            user = User.objects.get(id=user)
        except User.DoesNotExist:
            return UpdateUser(ok=False, errors=["Invalid user"])

        # three conditions where you can edit a user
        # - the user is you (you can edit some fields)
        # - the user is in your chain of command (you're their boss)
        # - you're a superuser (IT, HR)
        is_restricted = not current_user.is_superuser and not is_chain_of_command(
            user, current_user
        )
        if user.id != current_user.id and is_restricted:
            return UpdateUser(ok=False, errors=["Cannot edit this user"])

        invalid_fields = (
            [f for f in data.keys() if f in RESTRICTED_FIELDS] if is_restricted else []
        )
        invalid_fields.extend(
            [f for f in data.keys() if f in SUPERUSER_ONLY_FIELDS]
            if not current_user.is_superuser
            else []
        )
        if invalid_fields:
            return UpdateUser(
                ok=False, errors=[f"Cannot update field: {f}" for f in invalid_fields]
            )

        profile, _ = Profile.objects.get_or_create(user=user)
        user.profile = profile

        updates = {}
        model_updates = {User: {}, Profile: {}}
        for field, value in data.items():
            if value == "":
                value = None

            if is_restricted and field in RESTRICTED_FIELDS:
                continue

            if not current_user.is_superuser and field in SUPERUSER_ONLY_FIELDS:
                continue

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

        return UpdateUser(ok=True, user=user)
