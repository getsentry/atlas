import graphene
import graphene_django_optimizer as gql_optimizer

from atlas.models import Change, Department, Office, User

from .department import DepartmentNode
from .office import OfficeNode
from .user import UserNode

TYPE_MAP = {"department": Department, "office": Office, "user": User}


class ChangeNode(gql_optimizer.OptimizedDjangoObjectType):
    object_department = graphene.Field(DepartmentNode)
    object_office = graphene.Field(OfficeNode)
    object_user = graphene.Field(UserNode)

    class Meta:
        model = Change
        name = "Change"
        fields = (
            "id",
            "object_type",
            "object_id",
            "user",
            "changes",
            "previous",
            "timestamp",
            "version",
        )

    def get_object(self):
        object_cache = getattr(self, "object_cache", {})
        result = object_cache.get(self.object_type, {}).get(self.object_id, -1)
        if result is -1:
            model = TYPE_MAP[self.object_type]
            try:
                result = model.objects.get(id=self.object_id)
            except model.DoesNotExist:
                result = None
            object_cache.setdefault(self.object_type, {})[self.object_id] = result
        return result

    def resolve_object_department(self, info):
        if self.object_type != "department":
            return None
        return ChangeNode.get_object(self)

    def resolve_object_office(self, info):
        if self.object_type != "office":
            return None
        return ChangeNode.get_object(self)

    def resolve_object_user(self, info):
        if self.object_type != "user":
            return None
        return ChangeNode.get_object(self)
