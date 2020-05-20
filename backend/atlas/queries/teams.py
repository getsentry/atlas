import graphene
import graphene_django_optimizer as gql_optimizer
from graphql.error import GraphQLError

from atlas.models import Team
from atlas.schema import TeamNode


class Query(object):
    teams = graphene.List(
        TeamNode,
        id=graphene.UUID(),
        query=graphene.String(),
        people_only=graphene.Boolean(default_value=False),
        offset=graphene.Int(),
        limit=graphene.Int(),
    )

    def resolve_teams(
        self,
        info,
        id: str = None,
        query: str = None,
        people_only: bool = False,
        offset: int = 0,
        limit: int = 1000,
        **kwargs
    ):
        assert limit <= 1000
        assert offset >= 0

        current_user = info.context.user
        if not current_user.is_authenticated:
            raise GraphQLError("You must be authenticated")

        qs = Team.objects.all().distinct()

        if id:
            qs = qs.filter(id=id)

        if people_only:
            qs = qs.filter(
                profiles__is_human=True,
                profiles__user__is_active=True,
                profiles__is_directory_hidden=False,
            ).exclude(profiles=None)

        if query:
            qs = qs.filter(name__istartswith=query)

        qs = qs.order_by("name")

        return gql_optimizer.query(qs, info)[offset:limit]
