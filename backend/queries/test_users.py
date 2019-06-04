import pytest

from backend.models import User


@pytest.fixture
def other_user():
    return User.objects.create(name="Fizz Buzz", email="fizz.buzz@example.com")


def test_users_shows_self_email(gql_client, default_user):
    executed = gql_client.execute("""{users {id, email}}""", user=default_user)
    assert executed["data"]["users"] == [
        {"id": str(default_user.id), "email": default_user.email}
    ]


def test_users_hide_self(gql_client, default_user):
    executed = gql_client.execute(
        """{users(includeSelf:false) {id, email}}""", user=default_user
    )
    assert executed["data"]["users"] == []


def test_users_hides_others_email(gql_client, default_user, other_user):
    executed = gql_client.execute(
        """{users(query:"Fizz", includeSelf:true) {id, email}}""", user=default_user
    )
    assert executed["data"]["users"] == [{"id": str(other_user.id), "email": None}]


def test_users_query_with_results(gql_client, default_user):
    executed = gql_client.execute(
        """{users(query:"Reel Big", includeSelf:true) {id}}""", user=default_user
    )
    assert executed["data"]["users"] == [{"id": str(default_user.id)}]


def test_users_query_no_results(gql_client, default_user):
    executed = gql_client.execute(
        """{users(query:"Phish", includeSelf:true) {id}}""", user=default_user
    )
    assert executed["data"]["users"] == []
