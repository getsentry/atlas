from uuid import UUID

import graphene.test
import pytest
from django.contrib.auth.models import AnonymousUser

from backend import factories
from backend.root_schema import schema


class Context(object):
    user = AnonymousUser()


class GqlClient(graphene.test.Client):
    def execute(self, query, user=None):
        context = Context()
        if user:
            context.user = user
        return super().execute(query, context=context)


@pytest.fixture
def gql_client(db):
    return GqlClient(schema)


@pytest.fixture
def default_office(db):
    return factories.OfficeFactory.create(
        id=UUID("d2b00771-086f-4fc1-b24c-f5cc7bcd2c78"), name="SFO"
    )


@pytest.fixture
def default_user(db):
    user = factories.UserFactory(
        id=UUID("449c76aa-ad6a-46a8-b32b-91d965e3f462"),
        name="Reel Big Phish",
        email="reel.big.phish@example.com",
    )
    user.set_password("phish.reel.big")
    user.save()
    return user
