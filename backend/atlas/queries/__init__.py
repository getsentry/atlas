import graphene

from . import changes, departments, employeetypes, me, offices, teams, users


class RootQuery(
    me.Query,
    changes.Query,
    departments.Query,
    employeetypes.Query,
    offices.Query,
    teams.Query,
    users.Query,
    graphene.ObjectType,
):
    pass
