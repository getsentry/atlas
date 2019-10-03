from atlas.models import Department


def test_user_cannot_create(gql_client, default_user):
    executed = gql_client.execute(
        """
    mutation {
        createDepartment(data:{name:"Not Design"}) {
            ok
            errors
            department { id }
        }
    }""",
        user=default_user,
    )
    assert not executed.get("errors")
    resp = executed["data"]["createDepartment"]
    assert resp["errors"]
    assert resp["ok"] is False


def test_superuser_can_create_without_parent(gql_client, default_superuser):
    executed = gql_client.execute(
        """
    mutation {
        createDepartment(data:{name:"Not Design"}) {
            ok
            errors
            department { id }
        }
    }""",
        user=default_superuser,
    )
    assert not executed.get("errors")
    resp = executed["data"]["createDepartment"]
    assert not resp["errors"]
    assert resp["ok"] is True

    department = Department.objects.get(id=resp["department"]["id"])
    assert department.name == "Not Design"
    assert not department.tree
    assert not department.parent


def test_superuser_can_create_with_parent(
    gql_client, default_superuser, design_department
):
    executed = gql_client.execute(
        """
    mutation {
        createDepartment(data:{name:"Creative" parent:"%s"}) {
            ok
            errors
            department { id }
        }
    }"""
        % (design_department.id,),
        user=default_superuser,
    )
    assert not executed.get("errors")
    resp = executed["data"]["createDepartment"]
    assert not resp["errors"]
    assert resp["ok"] is True

    department = Department.objects.get(id=resp["department"]["id"])
    assert department.name == "Creative"
    assert department.tree == [design_department.id]
    assert department.parent_id == design_department.id
