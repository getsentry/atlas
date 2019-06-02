import graphene

from . import me, users


class RootQuery(me.Query, users.Query, graphene.ObjectType):
    pass
