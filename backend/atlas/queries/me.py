import graphene

from atlas.schema import UserNode


class Query(object):
    me = graphene.Field(UserNode)

    def resolve_me(self, info, **kwargs):
        if info.context.user.is_authenticated:
            return info.context.user
        return None
