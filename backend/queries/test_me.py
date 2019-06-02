def test_me_logged_in(gql_client, default_user):
    executed = gql_client.execute("""{me {id, email, name}}""", user=default_user)
    assert executed["data"]["me"] == {
        "id": str(default_user.id),
        "email": default_user.email,
        "name": default_user.name,
    }


def test_me_logged_out(gql_client, default_user):
    executed = gql_client.execute("""{me {id, email, name}}""")
    assert executed["data"]["me"] is None
