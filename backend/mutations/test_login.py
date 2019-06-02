def test_successful_login(gql_client, default_user):
    executed = gql_client.execute(
        """
    mutation {
        login(email:"reel.big.phish@example.com", password:"phish.reel.big") {
            ok
            errors
            token
            user {id, email, name}
        }
    }"""
    )
    resp = executed["data"]["login"]
    assert resp["errors"] is None
    assert resp["ok"] is True
    assert resp["user"] == {
        "id": str(default_user.id),
        "email": default_user.email,
        "name": default_user.name,
    }

    assert isinstance(resp["token"], str)


def test_invalid_password(gql_client, default_user):
    executed = gql_client.execute(
        """
    mutation {
        login(email:"reel.big.phish@example.com", password:"pwrong") {
            ok
            errors
            token
            user {id, email, name}
        }
    }"""
    )
    resp = executed["data"]["login"]
    assert resp["errors"]
    assert resp["ok"] is False
    assert resp["user"] is None
    assert resp["token"] is None
