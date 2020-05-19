from datetime import date
from enum import Enum

import graphene
from django.conf import settings
from django.db import models, transaction

from atlas.constants import FIELD_MODEL_MAP, RESTRICTED_FIELDS, SUPERUSER_ONLY_FIELDS
from atlas.models import Change, Department, Office, Profile, User
from atlas.schema import UserInput, UserNode
from atlas.tasks import update_profile


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
            user = User.objects.select_related("profile").get(id=user)
        except User.DoesNotExist:
            return UpdateUser(ok=False, errors=["Invalid user"])

        is_current_user = user.id == current_user.id

        # only superuser (human resources) can edit restricted fields
        is_restricted = not current_user.is_superuser
        if not is_current_user and is_restricted:
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

        profile = user.get_profile()

        updates = {}
        model_updates = {User: {}, Profile: {}}

        # for any update_user from self we signal it as onboarding successful
        # XXX(dcramer): this could cause some problems, but should work for our use case
        if is_current_user and not profile.has_onboarded:
            model_updates[Profile]["has_onboarded"] = True
            updates["has_onboarded"] = True

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
            elif field == "department" and value:
                value = Department.objects.get(id=value)
            elif field in ("reports_to", "referred_by") and value:
                if value == user.id:
                    return UpdateUser(ok=False, errors=[f"Cannot set {field} to self"])
                value = User.objects.get(id=value)
            elif field == "schedule" and value:
                cur_sched = profile.schedule or settings.DEFAULT_SCHEDULE
                value = [
                    value.get("sunday", cur_sched[0]) or "",
                    value.get("monday", cur_sched[1]) or "",
                    value.get("tuesday", cur_sched[2]) or "",
                    value.get("wednesday", cur_sched[3]) or "",
                    value.get("thursday", cur_sched[4]) or "",
                    value.get("friday", cur_sched[5]) or "",
                    value.get("saturday", cur_sched[6]) or "",
                ]

            model = FIELD_MODEL_MAP[field]
            if model is User:
                cur_value = getattr(user, field)
            elif model is Profile:
                cur_value = getattr(profile, field)
            else:
                raise NotImplementedError

            if field == "schedule":
                value = [v.name if isinstance(v, Enum) else v for v in value]

            if isinstance(value, Enum):
                value = value.name
            if cur_value != value:
                model_updates[model][field] = value
                if isinstance(value, date):
                    value = value.isoformat()
                elif isinstance(value, models.Model):
                    value = value.pk
                # track update for two-way sync
                updates[field] = value

        with transaction.atomic():
            change = Change.record("user", user.id, updates)
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
            update_profile.delay(
                user_id=user.id, updates=updates, version=change.version
            )

        return UpdateUser(ok=True, user=user)
