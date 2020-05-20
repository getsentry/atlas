from unittest.mock import patch

from atlas import factories
from atlas.models import Profile, Team


def test_user_cannot_delete(gql_client, default_user, default_team):
    executed = gql_client.execute(
        """
    mutation {
        deleteTeam(team:"%s") {
            ok
            errors
        }
    }"""
        % (default_team.id),
        user=default_user,
    )
    assert not executed.get("errors")
    resp = executed["data"]["deleteTeam"]
    assert resp["errors"]
    assert resp["ok"] is False

    assert Team.objects.filter(id=default_team.id).exists()


@patch("atlas.tasks.update_profile.delay")
def test_superuser_can_delete(mock_task, gql_client, default_superuser, default_team):
    assert default_superuser.profile.team_id == default_team.id

    executed = gql_client.execute(
        """
    mutation {
        deleteTeam(team:"%s") {
            ok
            errors
        }
    }"""
        % (default_team.id,),
        user=default_superuser,
    )
    assert not executed.get("errors")
    resp = executed["data"]["deleteTeam"]
    assert not resp["errors"]
    assert resp["ok"] is True

    profile = Profile.objects.get(user=default_superuser)
    assert profile.team_id is None

    assert not Team.objects.filter(id=default_team.id).exists()

    mock_task.assert_called_once_with(
        user_id=default_superuser.id, updates={"team": None}
    )


@patch("atlas.tasks.update_profile.delay")
def test_superuser_can_delete_and_transfer(
    mock_task, gql_client, default_superuser, default_team
):
    new_team = factories.TeamFactory.create(name="New Team")
    assert default_superuser.profile.team_id == default_team.id

    executed = gql_client.execute(
        """
    mutation {
        deleteTeam(team:"%s", newTeam:"%s") {
            ok
            errors
        }
    }"""
        % (default_team.id, new_team.id),
        user=default_superuser,
    )
    assert not executed.get("errors")
    resp = executed["data"]["deleteTeam"]
    assert not resp["errors"]
    assert resp["ok"] is True

    profile = Profile.objects.get(user=default_superuser)
    assert profile.team_id == new_team.id

    assert not Team.objects.filter(id=default_team.id).exists()

    mock_task.assert_called_once_with(
        user_id=default_superuser.id, updates={"team": str(new_team.id)}
    )
