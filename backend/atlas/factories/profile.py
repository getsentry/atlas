from datetime import date

import factory
import factory.fuzzy

from .. import models
from .user import UserFactory


class ProfileFactory(factory.django.DjangoModelFactory):
    user = factory.SubFactory(UserFactory)
    title = factory.Faker("name")
    date_started = factory.fuzzy.FuzzyDate(start_date=date(2010, 1, 1))

    class Meta:
        model = models.Profile
