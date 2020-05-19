from atlas.models import Change


def test_changes(gql_client, default_superuser, default_office):
    change = Change.objects.create(
        object_type="user",
        object_id=default_superuser.id,
        changes={"name": "Joe Dirt"},
        user=default_superuser,
        version=1,
    )

    executed = gql_client.execute("""{changes {id}}""", user=default_superuser)
    assert executed["data"]["changes"] == [{"id": str(change.id)}]
