import graphene

import backend.mutations
import backend.queries

schema = graphene.Schema(
    query=backend.queries.RootQuery, mutation=backend.mutations.RootMutation
)
