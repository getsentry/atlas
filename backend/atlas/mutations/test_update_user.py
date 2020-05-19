from datetime import date
from unittest.mock import patch

from atlas import factories
from atlas.models import Change, User


@patch("atlas.tasks.update_profile.delay")
def test_user_sets_has_onboarded(mock_task, gql_client, default_user):
    default_user.profile.has_onboarded = False
    default_user.profile.save()

    executed = gql_client.execute(
        """
    mutation {
        updateUser(user:"%s" data:{}) {
            ok
            errors
            user { id }
        }
    }"""
        % (default_user.id,),
        user=default_user,
    )
    assert not executed.get("errors")
    resp = executed["data"]["updateUser"]
    assert not resp["errors"]
    assert resp["ok"] is True
    assert resp["user"] == {"id": str(default_user.id)}

    mock_task.assert_called_once_with(
        user_id=default_user.id, updates={"has_onboarded": True}, version=1
    )

    user = User.objects.get(id=default_user.id)
    assert user.profile.has_onboarded

    change = Change.objects.get(object_id=user.id, object_type="user")
    assert change.version == 1
    assert change.changes == {"has_onboarded": True}


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
        user_id=default_user.id, updates={"handle": "Zoolander"}, version=1
    )

    user = User.objects.get(id=default_user.id)
    assert user.profile.handle == "Zoolander"

    change = Change.objects.get(object_id=user.id, object_type="user")
    assert change.version == 1
    assert change.changes == {"handle": "Zoolander"}


@patch("atlas.tasks.update_profile.delay")
def test_user_can_update_schedule(mock_task, gql_client, default_user):
    executed = gql_client.execute(
        """
    mutation {
        updateUser(user:"%s" data:{schedule:{monday: OFF}}) {
            ok
            errors
            user {id, schedule { monday } }
        }
    }"""
        % (default_user.id,),
        user=default_user,
    )
    assert not executed.get("errors")
    resp = executed["data"]["updateUser"]
    assert not resp["errors"]
    assert resp["ok"] is True
    assert resp["user"] == {"id": str(default_user.id), "schedule": {"monday": "OFF"}}

    mock_task.assert_called_once_with(
        user_id=default_user.id,
        updates={
            "schedule": [
                "OFF",
                "OFF",
                "INOFFICE",
                "INOFFICE",
                "INOFFICE",
                "INOFFICE",
                "OFF",
            ]
        },
        version=1,
    )

    user = User.objects.get(id=default_user.id)
    assert user.profile.schedule == [
        "OFF",
        "OFF",
        "INOFFICE",
        "INOFFICE",
        "INOFFICE",
        "INOFFICE",
        "OFF",
    ]


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
        user_id=default_user.id, updates={"date_started": "2017-01-01"}, version=1
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


@patch("atlas.tasks.update_profile.delay")
def test_superuser_can_update_department(
    mock_task, gql_client, default_user, default_superuser, ga_department
):
    executed = gql_client.execute(
        """
    mutation {
        updateUser(user:"%s" data:{department:"%s"}) {
            ok
            errors
            user { id }
        }
    }"""
        % (default_user.id, ga_department.id),
        user=default_superuser,
    )
    assert not executed.get("errors")
    resp = executed["data"]["updateUser"]
    assert not resp["errors"]
    assert resp["ok"] is True
    assert resp["user"] == {"id": str(default_user.id)}

    mock_task.assert_called_once_with(
        user_id=default_user.id, updates={"department": ga_department.id}, version=1
    )

    user = User.objects.get(id=default_user.id)
    assert user.profile.department_id == ga_department.id


@patch("atlas.tasks.update_profile.delay")
def test_superuser_can_update_reports_to(
    mock_task, gql_client, default_user, default_superuser, ga_department
):
    new_person = factories.UserFactory()

    executed = gql_client.execute(
        """
    mutation($user: UUID!, $reportsTo: NullableUUID) {
        updateUser(user: $user, data: {reportsTo: $reportsTo}) {
            ok
            errors
            user { id }
        }
    }""",
        variables={"user": str(default_user.id), "reportsTo": str(new_person.id)},
        user=default_superuser,
    )
    assert not executed.get("errors")
    resp = executed["data"]["updateUser"]
    assert not resp["errors"]
    assert resp["ok"] is True
    assert resp["user"] == {"id": str(default_user.id)}

    mock_task.assert_called_once_with(
        user_id=default_user.id, updates={"reports_to": new_person.id}, version=1
    )

    user = User.objects.get(id=default_user.id)
    assert user.profile.reports_to_id == new_person.id


@patch("atlas.tasks.update_profile.delay")
def test_user_can_update_nintendo_gamertag(mock_task, gql_client, default_user):
    executed = gql_client.execute(
        """
    mutation($user: UUID!, $nintendo: String) {
        updateUser(user: $user, data: { gamerTags: { nintendo: $nintendo } }) {
            ok
            errors
            user { id, gamerTags { nintendo } }
        }
    }""",
        user=default_user,
        variables={"user": str(default_user.id), "nintendo": "SW-1234-1234-1234"},
    )
    assert not executed.get("errors")
    resp = executed["data"]["updateUser"]
    assert not resp["errors"]
    assert resp["ok"] is True
    assert resp["user"] == {
        "id": str(default_user.id),
        "gamerTags": {"nintendo": "SW-1234-1234-1234"},
    }

    mock_task.assert_called_once_with(
        user_id=default_user.id, updates={"nintendo": "SW-1234-1234-1234"}, version=1
    )

    user = User.objects.get(id=default_user.id)
    assert user.profile.nintendo == "SW-1234-1234-1234"
