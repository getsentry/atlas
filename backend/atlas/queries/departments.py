import graphene
from graphql.error import GraphQLError

from atlas.models import Profile
from atlas.schema import DepartmentNode


class Query(object):
    departments = graphene.List(
        DepartmentNode, name=graphene.String(), query=graphene.String()
    )

    def resolve_departments(self, info, name: str = None, query: str = None, **kwargs):
        current_user = info.context.user
        if not current_user.is_authenticated:
            raise GraphQLError("You must be authenticated")

        qs = (
            Profile.objects.values_list("department", flat=True)
            .filter(department__isnull=False, is_human=True, user__is_active=True)
            .exclude(department="")
            .distinct()
        )

        if name:
            qs = qs.filter(department=name)

        if query:
            qs = qs.filter(department__istartswith=query)

        qs = qs.order_by("department")

        return [{"name": r} for r in qs]
