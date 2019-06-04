import factory

from .. import models


class OfficeFactory(factory.django.DjangoModelFactory):
    name = factory.Faker("name")

    class Meta:
        model = models.Office
