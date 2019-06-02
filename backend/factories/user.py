import factory

from .. import models


class UserFactory(factory.django.DjangoModelFactory):
    name = factory.Faker("name")
    email = factory.LazyAttribute(
        lambda x: "{0}@example.com".format(x.name.replace(" ", ".").lower()).lower()
    )
    password = "password"

    class Meta:
        model = models.User
