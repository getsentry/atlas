import graphene_django_optimizer as gql_optimizer

from atlas.models import Change


class ChangeNode(gql_optimizer.OptimizedDjangoObjectType):
    class Meta:
        model = Change
        name = "Change"
        fields = (
            "id",
            "object_type",
            "object_id",
            "user",
            "changes",
            "timestamp",
            "version",
        )
