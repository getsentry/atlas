from graphene_django.types import DjangoObjectType

from atlas.models import Office


class OfficeNode(DjangoObjectType):
    class Meta:
        model = Office
        name = "Office"
        only_fields = ("id", "name")
