import io
from csv import DictReader
from datetime import date
from enum import Enum
from typing import Dict, List

import dateutil.parser
import graphene
from django.db import models, transaction
from graphene_file_upload.scalars import Upload

from atlas.constants import FIELD_MODEL_MAP
from atlas.models import Department, Office, Profile, User
from atlas.schema import EmployeeTypeEnum, UserNode
from atlas.tasks import update_profile

CSV_FIELDS = set(
    (
        "id",
        "name",
        "email",
        "date_started",
        "date_of_birth",
        "title",
        "reports_to",
        "department",
        "office",
        "employee_type",
        "is_human",
        "is_directory_hidden",
    )
)


class StringChange(graphene.ObjectType):
    previous = graphene.String(required=False)
    new = graphene.String(required=False)


class DateChange(graphene.ObjectType):
    previous = graphene.Date(required=False)
    new = graphene.Date(required=False)


class BooleanChange(graphene.ObjectType):
    previous = graphene.Boolean(required=False)
    new = graphene.Boolean(required=False)


class EmployeeTypeChange(graphene.ObjectType):
    previous = EmployeeTypeEnum(required=False)
    new = EmployeeTypeEnum(required=False)


class CsvChange(graphene.ObjectType):
    user = graphene.Field(UserNode)

    name = graphene.Field(StringChange, required=False)
    title = graphene.Field(StringChange, required=False)
    department = graphene.Field(StringChange, required=False)
    office = graphene.Field(StringChange, required=False)
    reports_to = graphene.Field(StringChange, required=False)
    date_started = graphene.Field(DateChange, required=False)
    date_of_birth = graphene.Field(DateChange, required=False)
    employee_type = graphene.Field(EmployeeTypeChange, required=False)
    is_human = graphene.Field(BooleanChange, required=False)
    is_directory_hidden = graphene.Field(BooleanChange, required=False)


class ImportCsv(graphene.Mutation):
    class Arguments:
        file = Upload(required=True)
        ignore_empty_cells = graphene.Boolean(default_value=True)
        apply = graphene.Boolean(default_value=False)

    ok = graphene.Boolean()
    errors = graphene.List(graphene.String)
    changes = graphene.List(CsvChange)
    applied = graphene.Boolean()

    def mutate(self, info, file, apply=False, ignore_empty_cells=True):
        current_user = info.context.user
        if not current_user.is_authenticated:
            return ImportCsv(ok=False, errors=["Authentication required"])

        if not current_user.is_superuser:
            return ImportCsv(ok=False, errors=["Superuser required"])

        changes = []
        contents = file.read().decode("utf-8").strip("\ufeff")

        reader = DictReader(io.StringIO(contents))
        for row in reader:
            user = User.objects.get(id=row["id"])
            # TODO(dcramer): the string parsing here should map identically to what we'd get out of
            # G Suite (when its raw strings) so they can share functions
            user_change = {}
            profile = user.get_profile()

            for key, value in row.items():
                # email isnt updatable
                if key in ("id", "email"):
                    continue
                elif key not in CSV_FIELDS:
                    return ImportCsv(ok=False, errors=[f"Unknown attribute: {key}"])

                if ignore_empty_cells and not value:
                    continue

                model = FIELD_MODEL_MAP[key]
                if model is Profile:
                    current_value = getattr(profile, key)
                elif model is User:
                    current_value = getattr(user, key)
                else:
                    raise NotImplementedError
                # TODO(dcramer): validate employee_type
                if hasattr(current_value, "natural_key"):
                    current_value = "-".join(
                        str(k) for k in current_value.natural_key() if k
                    )
                elif key.startswith("date_") and value:
                    value = dateutil.parser.parse(value).date()
                    if key == "date_of_birth":
                        value = value.replace(year=1900)
                elif key.startswith("is_") and value:
                    value = value.lower()
                    if value in ("true", "1", "yes"):
                        value = True
                    elif value in ("false", "0", "no"):
                        value = False
                elif key == "employee_type":
                    current_value = EmployeeTypeEnum[current_value]
                    value = EmployeeTypeEnum[value]

                if current_value != value and (value or current_value):
                    user_change[key] = {"previous": current_value or None, "new": value}

            if user_change:
                changes.append({"user": user, **user_change})

        if apply:
            if changes:
                apply_changes(changes)
            applied = True
        else:
            applied = False

        return ImportCsv(ok=True, changes=changes, applied=applied)


def apply_changes(changes: List[Dict]):
    # TODO(dcramer): combine this with update_user behavior
    for change in changes:
        updates = {}
        model_updates = {User: {}, Profile: {}}

        with transaction.atomic():
            user = change["user"]
            profile = user.profile
            for field, field_change in change.items():
                if field != "user":
                    value = field_change["new"]
                    if field == "department" and value:
                        value, _ = Department.objects.get_or_create_by_natural_key(
                            *value.split("-")
                        )
                    if field == "office" and value:
                        value, _ = Office.objects.get_or_create_by_natural_key(
                            *value.split("-")
                        )
                    if field == "reports_to" and value:
                        value, _ = User.objects.get_or_create_by_natural_key(
                            *value.split("-")
                        )
                    if isinstance(value, Enum):
                        value = value.name

                    model_updates[FIELD_MODEL_MAP[field]][field] = value
                    if isinstance(value, date):
                        value = value.isoformat()
                    elif isinstance(value, models.Model):
                        value = value.pk
                    updates[field] = value

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
