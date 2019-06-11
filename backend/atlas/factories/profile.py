import random
from datetime import date

import factory
import factory.fuzzy

from .. import models
from .user import UserFactory

DEPARTMENTS = [
    "Engineering",
    "Product",
    "Customer Support",
    "Customer Success",
    "People",
    "Sales",
    "Marketing",
    "Finance",
    "Legal",
    "Design",
]

DEPARTMENT_TITLES = {
    "Engineering": ["Software Engineer"],
    "Product": ["Product Manager"],
    "Customer Support": ["Customer Support Manager"],
    "Customer Success": ["Customer Success Manager"],
    "People": ["People Operations Manager", "HR Specialist", "Recruiter"],
    "Marketing": [
        "Product Marketing Manager",
        "Content Strategist",
        "Marketing Operations Manager",
        "Events Coordinator",
    ],
    "Sales": [
        "Account Executive",
        "Sales Engineer",
        "Sales Development Representative",
        "Sales Operations Manager",
    ],
    "Finance": ["Staff Accountant"],
    "Legal": ["Counsel"],
    "Design": ["Product Designer", "Illustrator"],
}


class ProfileFactory(factory.django.DjangoModelFactory):
    user = factory.SubFactory(UserFactory)
    title = factory.LazyAttribute(
        lambda o: random.choice(DEPARTMENT_TITLES[o.department])
    )
    department = factory.LazyAttribute(lambda o: random.choice(DEPARTMENTS))
    date_started = factory.fuzzy.FuzzyDate(start_date=date(2010, 1, 1))

    class Meta:
        model = models.Profile

    class Params:
        ceo = factory.Trait(title="Chief Executive Officer", department="G&A")
        cfo = factory.Trait(title="Chief Financial Officer", department="G&A")
        cpo = factory.Trait(title="Chief Product Officer", department="G&A")
        cto = factory.Trait(title="Chief Technology Officer", department="G&A")
        cmo = factory.Trait(title="Chief Marketing Officer", department="G&A")
        cro = factory.Trait(title="Chief Revenue Officer", department="G&A")
        marketing = factory.Trait(department="Marketing")
        engineering = factory.Trait(department="Engineering")
        sales = factory.Trait(department="Sales")
        finance = factory.Trait(department="Finance")
