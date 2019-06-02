from graphene_django.types import DjangoObjectType

from backend.models import Office


class OfficeNode(DjangoObjectType):
    class Meta:
        model = Office
        name = "Office"
        only_fields = ("id", "name")
