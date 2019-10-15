def test_departments(gql_client, default_user, design_department):
    executed = gql_client.execute("""{departments {id, name}}""", user=default_user)
    assert executed["data"]["departments"] == [
        {"id": str(design_department.id), "name": design_department.name}
    ]


def test_departments_query_with_results(gql_client, default_user, design_department):
    executed = gql_client.execute(
        """{departments(query:"Design") {id}}""", user=default_user
    )
    assert executed["data"]["departments"] == [{"id": str(design_department.id)}]


def test_departments_query_no_results(gql_client, default_user, design_department):
    executed = gql_client.execute(
        """{departments(query:"Phish") {id}}""", user=default_user
    )
    assert executed["data"]["departments"] == []


def test_departments_with_tree(
    gql_client, default_user, design_department, creative_department
):
    executed = gql_client.execute(
        """{departments {id, tree {id}}}""", user=default_user
    )
    assert executed["data"]["departments"] == [
        {"id": str(design_department.id), "tree": []},
        {
            "id": str(creative_department.id),
            "tree": [{"id": str(design_department.id)}],
        },
    ]
