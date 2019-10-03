from unittest.mock import patch

from atlas.models import Department, Profile


def test_user_cannot_delete(gql_client, default_user, design_department, ga_department):
    executed = gql_client.execute(
        """
    mutation {
        deleteDepartment(department:"%s" newDepartment:"%s") {
            ok
            errors
        }
    }"""
        % (design_department.id, ga_department.id),
        user=default_user,
    )
    assert not executed.get("errors")
    resp = executed["data"]["deleteDepartment"]
    assert resp["errors"]
    assert resp["ok"] is False

    assert Department.objects.filter(id=ga_department.id).exists()


@patch("atlas.tasks.update_profile.delay")
def test_superuser_can_delete(
    mock_task, gql_client, default_superuser, design_department, ga_department
):
    assert default_superuser.profile.department_id == ga_department.id

    executed = gql_client.execute(
        """
    mutation {
        deleteDepartment(department:"%s" newDepartment:"%s") {
            ok
            errors
        }
    }"""
        % (ga_department.id, design_department.id),
        user=default_superuser,
    )
    assert not executed.get("errors")
    resp = executed["data"]["deleteDepartment"]
    assert not resp["errors"]
    assert resp["ok"] is True

    profile = Profile.objects.get(user=default_superuser)
    assert profile.department_id == design_department.id

    assert not Department.objects.filter(id=ga_department.id).exists()

    mock_task.assert_called_once_with(
        user_id=default_superuser.id, updates={"department": str(design_department.id)}
    )
