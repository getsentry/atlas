from uuid import UUID

import graphene
import graphene_django_optimizer as gql_optimizer
from graphql.error import GraphQLError

from atlas.models import Change
from atlas.schema import ChangeNode


class Query(object):
    changes = graphene.List(
        ChangeNode,
        id=graphene.UUID(),
        object_type=graphene.String(),
        object_id=graphene.UUID(),
        offset=graphene.Int(),
        limit=graphene.Int(),
    )

    def resolve_changes(
        self,
        info,
        id: str = None,
        object_type: str = None,
        object_id: UUID = None,
        offset: int = 0,
        limit: int = 1000,
        **kwargs
    ):
        assert limit <= 1000
        assert offset >= 0

        current_user = info.context.user
        if not current_user.is_authenticated:
            raise GraphQLError("You must be authenticated")

        if not current_user.is_superuser:
            raise GraphQLError("You must be superuser")

        qs = Change.objects.all().distinct()

        if id:
            qs = qs.filter(id=id)

        if object_type:
            qs = qs.filter(object_type=object_type)

            if object_id:
                qs = qs.filter(object_id=object_id)

        qs = qs.order_by("-timestamp")

        return list(gql_optimizer.query(qs, info)[offset:limit])
