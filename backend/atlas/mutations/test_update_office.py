from atlas.models import Office


def test_requires_superuser(gql_client, default_user, default_office):
    executed = gql_client.execute(
        """
    mutation {
        updateOffice(office:"%s" location:"132 Hawthorne St, San Francisco CA, 94103, USA") {
            ok
            errors
            office {id, location}
        }
    }"""
        % (default_office.id,),
        user=default_user,
    )
    assert not executed.get("errors")
    resp = executed["data"]["updateOffice"]
    assert resp["errors"]
    assert resp["ok"] is False


def test_update_location(gql_client, default_superuser, default_office):
    location = "132 Hawthorne St, San Francisco CA, 94103, USA"

    executed = gql_client.execute(
        """
    mutation {
        updateOffice(office:"%s" location:"%s") {
            ok
            errors
            office {id, location}
        }
    }"""
        % (default_office.id, location),
        user=default_superuser,
    )
    assert not executed.get("errors")
    resp = executed["data"]["updateOffice"]
    assert resp["errors"] is None
    assert resp["ok"] is True
    assert resp["office"] == {"id": str(default_office.id), "location": location}

    office = Office.objects.get(id=default_office.id)
    assert office.location == location
