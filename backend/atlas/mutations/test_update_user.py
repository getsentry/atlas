from datetime import date

from atlas.models import User


def test_user_can_update_handle(gql_client, default_user):
    executed = gql_client.execute(
        """
    mutation {
        updateUser(user:"%s" handle:"Zoolander") {
            ok
            errors
            user {id, profile { handle } }
        }
    }"""
        % (default_user.id,),
        user=default_user,
    )
    assert not executed.get("errors")
    resp = executed["data"]["updateUser"]
    assert not resp["errors"]
    assert resp["ok"] is True
    assert resp["user"] == {
        "id": str(default_user.id),
        "profile": {"handle": "Zoolander"},
    }

    user = User.objects.get(id=default_user.id)
    assert user.profile.handle == "Zoolander"


def test_user_cannot_update_start_date(gql_client, default_user):
    executed = gql_client.execute(
        """
    mutation {
        updateUser(user:"%s" dateStarted:"2017-01-01") {
            ok
            errors
        }
    }"""
        % (default_user.id,),
        user=default_user,
    )
    assert not executed.get("errors")
    resp = executed["data"]["updateUser"]
    assert resp["errors"]
    assert resp["ok"] is False

    user = User.objects.get(id=default_user.id)
    assert user.profile.date_started == date(2010, 4, 26)


def test_user_cannot_update_other_user(gql_client, default_user, default_superuser):
    executed = gql_client.execute(
        """
    mutation {
        updateUser(user:"%s" dateStarted:"2017-01-01") {
            ok
            errors
        }
    }"""
        % (default_superuser.id,),
        user=default_user,
    )
    assert not executed.get("errors")
    resp = executed["data"]["updateUser"]
    assert resp["errors"]
    assert resp["ok"] is False
