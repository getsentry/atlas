import graphene

from . import changes, departments, employeetypes, me, offices, users


class RootQuery(
    me.Query,
    changes.Query,
    departments.Query,
    employeetypes.Query,
    offices.Query,
    users.Query,
    graphene.ObjectType,
):
    pass
