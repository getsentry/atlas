import graphene
from graphql.error import GraphQLError

from backend.models import Office
from backend.schema import OfficeNode
from backend.utils.graphene import optimize_queryset


class Query(object):
    offices = graphene.List(
        OfficeNode,
        id=graphene.UUID(),
        query=graphene.String(),
        offset=graphene.Int(),
        limit=graphene.Int(),
    )

    def resolve_offices(
        self,
        info,
        id: str = None,
        query: str = None,
        offset: int = 0,
        limit: int = 1000,
        **kwargs
    ):
        assert limit <= 1000
        assert offset >= 0

        current_user = info.context.user
        if not current_user.is_authenticated:
            raise GraphQLError("You must be authenticated")

        qs = Office.objects.all()

        if id:
            qs = qs.filter(id=id)

        if query:
            qs = qs.filter(name__istartswith=query)

        qs = optimize_queryset(qs, info, "offices")

        qs = qs.order_by("name")[offset:limit]

        return qs
