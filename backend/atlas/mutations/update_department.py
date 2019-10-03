from datetime import date
from enum import Enum

import graphene
from django.db import models

from atlas.models import Department
from atlas.schema import DepartmentInput, DepartmentNode


class UpdateDepartment(graphene.Mutation):
    class Arguments:
        department = graphene.UUID(required=True)
        data = DepartmentInput(required=True)

    ok = graphene.Boolean()
    errors = graphene.List(graphene.String)
    department = graphene.Field(DepartmentNode)

    def mutate(self, info, department: str, data: DepartmentInput):
        current_user = info.context.user
        if not current_user.is_authenticated:
            return UpdateDepartment(ok=False, errors=["Authentication required"])

        try:
            department = Department.objects.get(id=department)
        except Department.DoesNotExist:
            return UpdateDepartment(ok=False, errors=["Invalid resource"])

        # only superuser (human resources) can edit departments
        if not current_user.is_superuser:
            return UpdateDepartment(ok=False, errors=["Cannot edit this resource"])

        updates = {}
        flattened_data = data.copy()
        for field, value in flattened_data.items():
            if value == "":
                value = None

            cur_value = getattr(department, field)
            if isinstance(value, Enum):
                value = value.name

            if cur_value != value:
                updates[field] = value
                if isinstance(value, date):
                    value = value.isoformat()
                elif isinstance(value, models.Model):
                    value = value.pk
                # track update for two-way sync
                updates[field] = value

        if "parent" in updates:
            updates["parent"] = parent = Department.objects.get(pk=updates["parent"])
            updates["tree"] = (parent.tree or []) + [parent.pk]

        if updates:
            for key, value in updates.items():
                setattr(department, key, value)
            department.save(update_fields=updates.keys())

        return UpdateDepartment(ok=True, department=department)
