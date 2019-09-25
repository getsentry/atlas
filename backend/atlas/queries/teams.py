import graphene
from graphql.error import GraphQLError

from atlas.models import Profile
from atlas.schema import TeamNode


class Query(object):
    teams = graphene.List(TeamNode, name=graphene.String(), query=graphene.String())

    def resolve_teams(self, info, name: str = None, query: str = None, **kwargs):
        current_user = info.context.user
        if not current_user.is_authenticated:
            raise GraphQLError("You must be authenticated")

        qs = (
            Profile.objects.values_list("team", flat=True)
            .filter(team__isnull=False, is_human=True, user__is_active=True)
            .exclude(team="")
            .distinct()
        )

        if name:
            qs = qs.filter(team=name)

        if query:
            qs = qs.filter(team__istartswith=query)

        qs = qs.order_by("team")

        return [{"name": r} for r in qs]
