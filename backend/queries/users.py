import graphene

from backend.models import User
from backend.schema import UserNode
from backend.utils.graphene import optimize_queryset


class Query(object):
    users = graphene.List(
        UserNode,
        id=graphene.UUID(),
        query=graphene.String(),
        include_self=graphene.Boolean(),
        offset=graphene.Int(),
        limit=graphene.Int(),
    )

    def resolve_users(
        self,
        info,
        id: str = None,
        query: str = None,
        include_self: bool = False,
        offset: int = 0,
        limit: int = 1000,
        **kwargs
    ):
        assert limit <= 1000
        assert offset >= 0

        user = info.context.user
        qs = User.objects.all()

        if id:
            qs = qs.filter(id=id)

        if query:
            qs = qs.filter(name__istartswith=query)

        if not include_self:
            qs = qs.exclude(id=user.id)

        qs = optimize_queryset(qs, info, "users")

        qs = qs[offset:limit]
        print(qs)

        return qs
