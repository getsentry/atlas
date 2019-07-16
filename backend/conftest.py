from datetime import date
from uuid import UUID

import graphene.test
import pytest
from django.conf import settings
from django.contrib.auth.models import AnonymousUser

from atlas import factories
from atlas.root_schema import schema


def pytest_configure(config):
    settings.GOOGLE_CLIENT_ID = "google-client-id"
    settings.GOOGLE_CLIENT_SECRET = "google-client-secret"


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

    factories.ProfileFactory.create(
        user=user,
        title="Dummy",
        date_started=date(2010, 4, 26),
        date_of_birth=date(1990, 8, 12),
    )
    return user


@pytest.fixture
def default_identity(db, default_user):
    return factories.IdentityFactory.create(user=default_user)


@pytest.fixture
def default_superuser(db):
    user = factories.UserFactory(
        id=UUID("559c76aa-ad6a-46a8-b32b-91d965e3f462"),
        name="Captain Planet",
        email="captain.planet@example.com",
        is_superuser=True,
    )
    user.set_password("planet.captain")
    user.save()

    factories.ProfileFactory.create(
        user=user,
        title="Dummy",
        date_started=date(2010, 5, 26),
        date_of_birth=date(1990, 2, 13),
    )
    return user


@pytest.fixture
def default_superuser_identity(db, default_superuser):
    return factories.IdentityFactory.create(user=default_superuser, admin=True)
