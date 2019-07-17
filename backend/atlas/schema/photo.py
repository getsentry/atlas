import graphene
from graphene_django.types import DjangoObjectType

from atlas.models import Photo

from .binary import BinaryField


class PhotoNode(DjangoObjectType):
    data = BinaryField(required=False)
    width = graphene.Int(required=False)
    height = graphene.Int(required=False)
    mime_type = graphene.String(required=True)

    class Meta:
        model = Photo
        name = "Photo"
        fields = ("width", "height", "mime_type")
