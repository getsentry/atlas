from atlas.models import Change


def test_changes(gql_client, default_user, default_office):
    change = Change.objects.create(
        object_type="user",
        object_id=default_user.id,
        changes={"name": "Joe Dirt"},
        user=default_user,
    )

    executed = gql_client.execute("""{changes {id}}""", user=default_user)
    assert executed["data"]["changes"] == [{"id": str(change.id)}]
