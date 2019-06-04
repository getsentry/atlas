import factory

from .. import models
from .user import UserFactory


class ProfileFactory(factory.django.DjangoModelFactory):
    user = factory.SubFactory(UserFactory)
    title = factory.Faker("name")

    class Meta:
        model = models.Profile
