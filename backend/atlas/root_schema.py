import graphene

import atlas.mutations
import atlas.queries

schema = graphene.Schema(
    query=atlas.queries.RootQuery, mutation=atlas.mutations.RootMutation
)
