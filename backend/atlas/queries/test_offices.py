def test_offices(gql_client, default_user, default_office):
    executed = gql_client.execute("""{offices {id, name}}""", user=default_user)
    assert executed["data"]["offices"] == [
        {"id": str(default_office.id), "name": default_office.name}
    ]


def test_offices_query_with_results(gql_client, default_user, default_office):
    executed = gql_client.execute("""{offices(query:"SF") {id}}""", user=default_user)
    assert executed["data"]["offices"] == [{"id": str(default_office.id)}]


def test_offices_query_no_results(gql_client, default_user, default_office):
    executed = gql_client.execute(
        """{offices(query:"Phish") {id}}""", user=default_user
    )
    assert executed["data"]["offices"] == []
