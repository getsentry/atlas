from atlas.models import User


def test_user_can_update_handle(gql_client, default_user):
    executed = gql_client.execute(
        """
    mutation {
        updateUser(user:"%s" handle:"Zoolander") {
            ok
            errors
            user {id, profile { handle } }
        }
    }"""
        % (default_user.id,),
        user=default_user,
    )
    assert not executed.get("errors")
    resp = executed["data"]["updateUser"]
    assert not resp["errors"]
    assert resp["ok"] is True
    assert resp["user"] == {
        "id": str(default_user.id),
        "profile": {"handle": "Zoolander"},
    }

    user = User.objects.get(id=default_user.id)
    assert user.profile.handle == "Zoolander"
