import graphene
import graphene_django_optimizer as gql_optimizer
from graphql.error import GraphQLError

from atlas.models import Office
from atlas.schema import OfficeNode


class Query(object):
    offices = graphene.List(
        OfficeNode,
        id=graphene.UUID(),
        external_id=graphene.String(),
        query=graphene.String(),
        offset=graphene.Int(),
        limit=graphene.Int(),
    )

    def resolve_offices(
        self,
        info,
        id: str = None,
        external_id: str = None,
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

        qs = Office.objects.all().distinct()

        if id:
            qs = qs.filter(id=id)

        if external_id:
            qs = qs.filter(external_id=external_id)

        if query:
            qs = qs.filter(name__istartswith=query)

        qs = qs.exclude(name__istartswith="$$")

        qs = qs.order_by("name")

        return gql_optimizer.query(qs, info)[offset:limit]
