def test_teams(gql_client, default_user, default_team):
    executed = gql_client.execute("""{teams {id, name}}""", user=default_user)
    assert executed["data"]["teams"] == [
        {"id": str(default_team.id), "name": default_team.name}
    ]


def test_teams_query_with_results(gql_client, default_user, default_team):
    executed = gql_client.execute(
        """{teams(query:"Workflow") {id}}""", user=default_user
    )
    assert executed["data"]["teams"] == [{"id": str(default_team.id)}]


def test_teams_query_no_results(gql_client, default_user, default_team):
    executed = gql_client.execute("""{teams(query:"Phish") {id}}""", user=default_user)
    assert executed["data"]["teams"] == []
