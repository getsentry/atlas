import graphene

from . import me, offices, users


class RootQuery(me.Query, offices.Query, users.Query, graphene.ObjectType):
    pass
