import graphene

from .nullable import Nullable


class DepartmentInput(graphene.InputObjectType):
    id = graphene.UUID(required=False)
    name = graphene.String(required=False)
    parent = Nullable(graphene.UUID, required=False)
    cost_center = Nullable(graphene.Int, required=False)
