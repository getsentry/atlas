import factory

from .. import models
from .user import UserFactory


class IdentityFactory(factory.django.DjangoModelFactory):
    user = factory.SubFactory(UserFactory)
    provider = "google"
    external_id = factory.Faker("random_int", min=1, max=100000000)
    is_active = True
    access_token = factory.Faker("sha1")
    refresh_token = factory.Faker("sha1")
    is_admin = False

    class Meta:
        model = models.Identity

    class Params:
        admin = factory.Trait(is_admin=True)
