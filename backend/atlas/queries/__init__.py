import graphene

from . import departments, me, offices, users


class RootQuery(
    me.Query, departments.Query, offices.Query, users.Query, graphene.ObjectType
):
    pass
