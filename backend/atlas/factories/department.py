import factory

from .. import models

# unused atm
DEPARTMENT_NAMES = [
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


class DepartmentFactory(factory.django.DjangoModelFactory):
    name = factory.Faker("name")

    class Meta:
        model = models.Department
