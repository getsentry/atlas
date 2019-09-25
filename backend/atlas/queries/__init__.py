import graphene

from . import departments, employeetypes, me, offices, teams, users


class RootQuery(
    me.Query,
    departments.Query,
    employeetypes.Query,
    offices.Query,
    teams.Query,
    users.Query,
    graphene.ObjectType,
):
    pass
