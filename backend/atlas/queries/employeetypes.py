import graphene
from graphql.error import GraphQLError

from atlas.schema import EmployeeTypeEnum, EmployeeTypeNode


class Query(object):
    employee_types = graphene.List(
        EmployeeTypeNode, name=graphene.String(), query=graphene.String()
    )

    def resolve_employee_types(
        self, info, name: str = None, query: str = None, **kwargs
    ):
        current_user = info.context.user
        if not current_user.is_authenticated:
            raise GraphQLError("You must be authenticated")

        results = (
            EmployeeTypeEnum.FULL_TIME,
            EmployeeTypeEnum.CONTRACT,
            EmployeeTypeEnum.INTERN,
        )

        if name:
            results = [r for r in results if str(r) == name]

        if query:
            results = [r for r in results if str(r).startswith(name)]

        return [{"id": r.name} for r in results]
