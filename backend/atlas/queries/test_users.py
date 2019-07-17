from datetime import date

import pytest

from atlas.models import Profile, User


@pytest.fixture
def other_user(default_user):
    user = User.objects.create(name="Fizz Buzz", email="fizz.buzz@example.com")
    Profile.objects.create(
        user=user, reports_to=default_user, title="Dummy", date_started=date.today()
    )
    return user


def test_users_shows_reports(gql_client, default_user, other_user):
    executed = gql_client.execute(
        """{users(id:"%s") {id, email, reports { id }, numReports }}"""
        % (str(default_user.id)),
        user=default_user,
    )
    assert len(executed["data"]["users"]) == 1
    assert executed["data"]["users"] == [
        {
            "id": str(default_user.id),
            "email": default_user.email,
            "reports": [{"id": str(other_user.id)}],
            "numReports": 1,
        }
    ]


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


def test_users_shows_others_email(gql_client, default_user, other_user):
    executed = gql_client.execute(
        """{users(query:"Fizz", includeSelf:true) {id, email}}""", user=default_user
    )
    assert executed["data"]["users"] == [
        {"id": str(other_user.id), "email": other_user.email}
    ]


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


def test_users_by_start_date(gql_client, default_user, other_user):
    executed = gql_client.execute(
        """{users(orderBy:dateStarted) {id}}""", user=default_user
    )
    assert len(executed["data"]["users"]) == 2
    assert executed["data"]["users"] == [
        {"id": str(other_user.id)},
        {"id": str(default_user.id)},
    ]


def test_users_query_start_date(gql_client, default_user, other_user):
    executed = gql_client.execute(
        """{users(dateStartedBefore:"2010-04-27") {id}}""", user=default_user
    )
    assert not executed.get("errors")
    assert len(executed["data"]["users"]) == 1
    assert executed["data"]["users"] == [{"id": str(default_user.id)}]

    executed = gql_client.execute(
        """{users(dateStartedAfter:"2010-04-27") {id}}""", user=default_user
    )
    assert not executed.get("errors")
    assert len(executed["data"]["users"]) == 1
    assert executed["data"]["users"] == [{"id": str(other_user.id)}]


def test_users_by_birthday(gql_client, default_user, other_user):
    executed = gql_client.execute(
        """{users(orderBy:birthday) {id}}""", user=default_user
    )
    assert len(executed["data"]["users"]) == 1
    assert executed["data"]["users"] == [{"id": str(default_user.id)}]


def test_users_query_birthday(gql_client, default_user):
    executed = gql_client.execute(
        """{users(birthdayBefore:"2010-08-10") {id}}""", user=default_user
    )
    assert not executed.get("errors")
    assert len(executed["data"]["users"]) == 0

    executed = gql_client.execute(
        """{users(birthdayBefore:"2010-08-13") {id}}""", user=default_user
    )
    assert not executed.get("errors")
    assert len(executed["data"]["users"]) == 1
    assert executed["data"]["users"] == [{"id": str(default_user.id)}]

    executed = gql_client.execute(
        """{users(birthdayAfter:"2010-08-13") {id}}""", user=default_user
    )
    assert not executed.get("errors")
    assert len(executed["data"]["users"]) == 0

    executed = gql_client.execute(
        """{users(birthdayAfter:"2010-08-10") {id}}""", user=default_user
    )
    assert not executed.get("errors")
    assert len(executed["data"]["users"]) == 1
    assert executed["data"]["users"] == [{"id": str(default_user.id)}]


def test_users_query_anniversary(gql_client, default_user):
    executed = gql_client.execute(
        """{users(anniversaryBefore:"2012-04-25") {id}}""", user=default_user
    )
    assert not executed.get("errors")
    assert len(executed["data"]["users"]) == 0

    executed = gql_client.execute(
        """{users(anniversaryBefore:"2012-04-30") {id}}""", user=default_user
    )
    assert not executed.get("errors")
    assert len(executed["data"]["users"]) == 1
    assert executed["data"]["users"] == [{"id": str(default_user.id)}]

    executed = gql_client.execute(
        """{users(anniversaryAfter:"2012-04-30") {id}}""", user=default_user
    )
    assert not executed.get("errors")
    assert len(executed["data"]["users"]) == 0

    executed = gql_client.execute(
        """{users(anniversaryAfter:"2012-04-25") {id}}""", user=default_user
    )
    assert not executed.get("errors")
    assert len(executed["data"]["users"]) == 1
    assert executed["data"]["users"] == [{"id": str(default_user.id)}]
