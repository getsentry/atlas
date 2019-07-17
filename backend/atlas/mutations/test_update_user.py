from datetime import date
from unittest.mock import patch

from atlas.models import User


@patch("atlas.tasks.update_profile.delay")
def test_user_can_update_handle(mock_task, gql_client, default_user):
    executed = gql_client.execute(
        """
    mutation {
        updateUser(user:"%s" data:{handle:"Zoolander"}) {
            ok
            errors
            user {id, handle }
        }
    }"""
        % (default_user.id,),
        user=default_user,
    )
    assert not executed.get("errors")
    resp = executed["data"]["updateUser"]
    assert not resp["errors"]
    assert resp["ok"] is True
    assert resp["user"] == {"id": str(default_user.id), "handle": "Zoolander"}

    mock_task.assert_called_once_with(
        user_id=default_user.id, updates={"handle": "Zoolander"}
    )

    user = User.objects.get(id=default_user.id)
    assert user.profile.handle == "Zoolander"


def test_user_cannot_update_start_date(gql_client, default_user):
    executed = gql_client.execute(
        """
    mutation {
        updateUser(user:"%s" data:{dateStarted:"2017-01-01"}) {
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
        updateUser(user:"%s" data:{dateStarted:"2017-01-01"}) {
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


@patch("atlas.tasks.update_profile.delay")
def test_superuser_can_update_other_user(
    mock_task, gql_client, default_user, default_superuser
):
    executed = gql_client.execute(
        """
    mutation {
        updateUser(user:"%s" data:{dateStarted:"2017-01-01"}) {
            ok
            errors
        }
    }"""
        % (default_user.id,),
        user=default_superuser,
    )
    assert not executed.get("errors")
    resp = executed["data"]["updateUser"]
    assert not resp["errors"]
    assert resp["ok"] is True

    user = User.objects.get(id=default_user.id)
    assert user.profile.date_started == date(2017, 1, 1)

    mock_task.assert_called_once_with(
        user_id=default_user.id, updates={"date_started": "2017-01-01"}
    )


def test_superuser_can_set_empty_value_to_date_started(
    gql_client, default_user, default_superuser
):
    executed = gql_client.execute(
        """
    mutation {
        updateUser(user:"%s" data:{dateStarted:""}) {
            ok
            errors
        }
    }"""
        % (default_user.id,),
        user=default_superuser,
    )
    assert not executed.get("errors")
    resp = executed["data"]["updateUser"]
    assert not resp["errors"]
    assert resp["ok"] is True

    user = User.objects.get(id=default_user.id)
    assert user.profile.date_started is None


@patch("atlas.tasks.update_profile.delay")
def test_superuser_can_set_superuser(
    mock_task, gql_client, default_user, default_superuser
):
    executed = gql_client.execute(
        """
    mutation {
        updateUser(user:"%s" data:{isSuperuser:true}) {
            ok
            errors
        }
    }"""
        % (default_user.id,),
        user=default_superuser,
    )
    assert not executed.get("errors")
    resp = executed["data"]["updateUser"]
    assert not resp["errors"]
    assert resp["ok"] is True

    user = User.objects.get(id=default_user.id)
    assert user.is_superuser


@patch("atlas.tasks.update_profile.delay")
def test_non_superuser_cannot_set_superuser(
    mock_task, gql_client, default_user, default_superuser
):
    executed = gql_client.execute(
        """
    mutation {
        updateUser(user:"%s" data:{isSuperuser:false}) {
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

    user = User.objects.get(id=default_superuser.id)
    assert user.is_superuser
