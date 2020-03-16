import io
from datetime import date

from atlas.models import User

MUTATION = """
mutation importCsv ($file: Upload!, $apply: Boolean) {
    importCsv(file: $file, apply: $apply) {
        ok
        errors
        applied
        changes {
            user { id }
            title { previous, new }
            department { previous, new }
            office { previous, new }
            reportsTo { previous, new }
            employeeType { previous, new }
            isHuman { previous, new }
            dateStarted { previous, new }
        }
    }
}
"""


def map_key(inst):
    return "-".join(str(k) for k in inst.natural_key())


def test_requires_superuser(gql_client, default_user):
    executed = gql_client.execute(MUTATION, {"file": io.BytesIO()}, user=default_user)
    assert not executed.get("errors")
    resp = executed["data"]["importCsv"]
    assert resp["errors"]
    assert resp["ok"] is False


def test_no_updates(gql_client, default_superuser):
    csv_file = io.BytesIO(
        f"""id,name,email,department,title
{str(default_superuser.id)},{default_superuser.name},{default_superuser.email},{map_key(default_superuser.profile.department)},{default_superuser.profile.title}
""".strip().encode(
            "utf-8"
        )
    )
    executed = gql_client.execute(
        MUTATION,
        {"file": csv_file},
        user=default_superuser,
        # files={"file": csv_file},
    )
    assert not executed.get("errors")
    resp = executed["data"]["importCsv"]
    assert resp["errors"] is None
    assert resp["ok"] is True
    assert resp["changes"] == [], resp["changes"]


def test_handles_header_marker(gql_client, default_superuser):
    csv_file = io.BytesIO(
        f"""\ufeffid,name,email,department,title
{str(default_superuser.id)},{default_superuser.name},{default_superuser.email},{map_key(default_superuser.profile.department)},{default_superuser.profile.title}
""".strip().encode(
            "utf-8"
        )
    )
    executed = gql_client.execute(
        MUTATION,
        {"file": csv_file},
        user=default_superuser,
        # files={"file": csv_file},
    )
    assert not executed.get("errors")
    resp = executed["data"]["importCsv"]
    assert resp["errors"] is None
    assert resp["ok"] is True
    assert resp["changes"] == [], resp["changes"]


def test_basic_updates(gql_client, default_superuser):
    csv_file = io.BytesIO(
        f"""id,name,email,department,title
{str(default_superuser.id)},{default_superuser.name},{default_superuser.email},{map_key(default_superuser.profile.department)},Bruhah
""".strip().encode(
            "utf-8"
        )
    )
    executed = gql_client.execute(
        MUTATION, {"file": csv_file}, user=default_superuser, files={"file": csv_file}
    )
    assert not executed.get("errors")
    resp = executed["data"]["importCsv"]
    assert resp["errors"] is None
    assert resp["ok"] is True
    assert not resp["applied"]
    assert len(resp["changes"]) == 1
    change = resp["changes"][0]
    assert change["user"]["id"] == str(default_superuser.id)
    assert change["title"] == {"previous": "Super Dummy", "new": "Bruhah"}
    assert change["department"] is None

    csv_file.seek(0)
    executed = gql_client.execute(
        MUTATION,
        {"file": csv_file, "apply": True},
        user=default_superuser,
        files={"file": csv_file},
    )
    assert not executed.get("errors")
    resp = executed["data"]["importCsv"]
    assert resp["errors"] is None
    assert resp["ok"] is True
    assert resp["applied"]

    user = User.objects.get(id=default_superuser.id)
    assert user.profile.title == "Bruhah"


def test_updates_all_attributes(gql_client, default_superuser):
    csv_file = io.BytesIO(
        f"""id,name,email,employee_type,reports_to,department,title,office,is_human,date_started
{str(default_superuser.id)},{default_superuser.name},{default_superuser.email},CONTRACT,blah@example.com,500-Cool,Bruhah,HQ,false,1/1/20
""".strip().encode(
            "utf-8"
        )
    )
    executed = gql_client.execute(
        MUTATION, {"file": csv_file}, user=default_superuser, files={"file": csv_file}
    )
    assert not executed.get("errors")
    resp = executed["data"]["importCsv"]
    assert resp["errors"] is None
    assert resp["ok"] is True
    assert not resp["applied"]
    assert len(resp["changes"]) == 1
    change = resp["changes"][0]
    assert change["user"]["id"] == str(default_superuser.id)
    assert change["employeeType"]
    assert change["reportsTo"]
    assert change["office"]
    assert change["title"]
    assert change["department"]

    csv_file.seek(0)
    executed = gql_client.execute(
        MUTATION,
        {"file": csv_file, "apply": True},
        user=default_superuser,
        files={"file": csv_file},
    )
    assert not executed.get("errors")
    resp = executed["data"]["importCsv"]
    assert resp["errors"] is None
    assert resp["ok"] is True
    assert resp["applied"]

    user = User.objects.get(id=default_superuser.id)
    assert user.profile.title == "Bruhah"
    assert user.profile.employee_type == "CONTRACT"
    assert user.profile.department.cost_center == 500
    assert user.profile.department.name == "Cool"
    assert user.profile.office.external_id == "HQ"
    assert user.profile.office.name == "HQ"
    assert user.profile.reports_to.name == "blah"
    assert user.profile.reports_to.email == "blah@example.com"
    assert user.profile.is_human is False
    assert user.profile.date_started == date(2020, 1, 1)
