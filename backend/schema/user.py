import graphene
from graphene_django.types import DjangoObjectType

from backend.models import User


class UserNode(DjangoObjectType):
    email = graphene.String(required=False)
    profile = graphene.Field("backend.schema.ProfileNode")

    class Meta:
        model = User
        name = "User"
        only_fields = ("id", "email", "name")

    def resolve_email(self, info):
        user = info.context.user
        if user.is_authenticated and user.id == self.id:
            return self.email
        return None
