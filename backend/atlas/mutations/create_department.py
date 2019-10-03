import graphene

from atlas.models import Department
from atlas.schema import DepartmentInput, DepartmentNode


class CreateDepartment(graphene.Mutation):
    class Arguments:
        data = DepartmentInput(required=True)

    ok = graphene.Boolean()
    errors = graphene.List(graphene.String)
    department = graphene.Field(DepartmentNode)

    def mutate(self, info, data: DepartmentInput):
        current_user = info.context.user
        if not current_user.is_authenticated:
            return CreateDepartment(ok=False, errors=["Authentication required"])

        # only superuser (human resources) can edit departments
        if not current_user.is_superuser:
            return CreateDepartment(ok=False, errors=["Cannot edit this resource"])

        if data.get("parent"):
            data["parent"] = parent = Department.objects.get(pk=data["parent"])
            tree = (parent.tree or []) + [parent.pk]
        else:
            tree = None

        department = Department.objects.create(tree=tree, **data)

        return CreateDepartment(ok=True, department=department)
