from graphene_django.types import DjangoObjectType

from atlas.models import Office

from .decimal import Decimal


class OfficeNode(DjangoObjectType):
    lat = Decimal(required=False)
    lng = Decimal(required=False)

    class Meta:
        model = Office
        name = "Office"
        only_fields = ("id", "name", "location", "lat", "lng")
