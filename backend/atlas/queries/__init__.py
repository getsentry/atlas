import graphene

from . import departments, employeetypes, me, offices, users


class RootQuery(
    me.Query,
    departments.Query,
    employeetypes.Query,
    offices.Query,
    users.Query,
    graphene.ObjectType,
):
    pass
