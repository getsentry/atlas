import factory

from .. import models


class TeamFactory(factory.django.DjangoModelFactory):
    name = factory.Faker("name")

    class Meta:
        model = models.Team
