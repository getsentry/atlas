from atlas.models import Department


def test_user_cannot_update(gql_client, default_user, design_department):
    executed = gql_client.execute(
        """
    mutation {
        updateDepartment(department:"%s" data:{name:"Not Design"}) {
            ok
            errors
            department { id, name }
        }
    }"""
        % (design_department.id,),
        user=default_user,
    )
    assert not executed.get("errors")
    resp = executed["data"]["updateDepartment"]
    assert resp["errors"]
    assert resp["ok"] is False


def test_superuser_can_update_name(gql_client, default_superuser, design_department):
    executed = gql_client.execute(
        """
    mutation {
        updateDepartment(department:"%s" data:{name:"Not Design"}) {
            ok
            errors
            department { id, name }
        }
    }"""
        % (design_department.id,),
        user=default_superuser,
    )
    assert not executed.get("errors")
    resp = executed["data"]["updateDepartment"]
    assert not resp["errors"]
    assert resp["ok"] is True
    assert resp["department"] == {"id": str(design_department.id), "name": "Not Design"}

    department = Department.objects.get(id=design_department.id)
    assert department.name == "Not Design"


def test_superuser_can_update_parent(
    gql_client, default_superuser, design_department, ga_department
):
    executed = gql_client.execute(
        """
    mutation {
        updateDepartment(department:"%s" data:{parent:"%s"}) {
            ok
            errors
            department { id, parent { id } }
        }
    }"""
        % (design_department.id, ga_department.id),
        user=default_superuser,
    )
    assert not executed.get("errors")
    resp = executed["data"]["updateDepartment"]
    assert not resp["errors"]
    assert resp["ok"] is True
    assert resp["department"] == {
        "id": str(design_department.id),
        "parent": {"id": str(ga_department.id)},
    }

    department = Department.objects.get(id=design_department.id)
    assert department.parent_id == ga_department.id
    assert department.tree == [ga_department.id]


def test_superuser_can_update_cost_center(
    gql_client, default_superuser, design_department
):
    executed = gql_client.execute(
        """
    mutation {
        updateDepartment(department:"%s" data:{costCenter:500}) {
            ok
            errors
            department { id, costCenter }
        }
    }"""
        % (design_department.id,),
        user=default_superuser,
    )
    assert not executed.get("errors")
    resp = executed["data"]["updateDepartment"]
    assert not resp["errors"]
    assert resp["ok"] is True
    assert resp["department"] == {"id": str(design_department.id), "costCenter": 500}

    department = Department.objects.get(id=design_department.id)
    assert department.cost_center == 500
