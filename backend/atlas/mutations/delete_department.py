import graphene
from django.db import transaction

from atlas.models import Department, Profile
from atlas.tasks import update_profile


class DeleteDepartment(graphene.Mutation):
    class Arguments:
        department = graphene.UUID(required=True)
        new_department = graphene.UUID(required=True)

    ok = graphene.Boolean()
    errors = graphene.List(graphene.String)

    def mutate(self, info, department: str, new_department: str):
        current_user = info.context.user
        if not current_user.is_authenticated:
            return DeleteDepartment(ok=False, errors=["Authentication required"])

        if department == new_department:
            return DeleteDepartment(
                ok=False, errors=["Must select a unique new department"]
            )

        try:
            department = Department.objects.get(id=department)
        except Department.DoesNotExist:
            return DeleteDepartment(ok=False, errors=["Invalid resource"])

        try:
            new_department = Department.objects.get(id=new_department)
        except Department.DoesNotExist:
            return DeleteDepartment(ok=False, errors=["Invalid resource"])

        # only superuser (human resources) can edit departments
        if not current_user.is_superuser:
            return DeleteDepartment(ok=False, errors=["Cannot edit this resource"])

        # XXX(dcramer): this is potentially a very long transaction
        with transaction.atomic():
            department_id = department.id
            affected_users = []
            for user_id in Profile.objects.filter(department=department_id).values_list(
                "user", flat=True
            ):
                affected_users.append(user_id)
                Profile.objects.filter(user=user_id).update(department=new_department)

            department.delete()

            for user_id in affected_users:
                update_profile.delay(
                    user_id=user_id, updates={"department": str(new_department.id)}
                )

        return DeleteDepartment(ok=True)
