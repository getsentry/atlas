import pytest
from django.conf import settings

from atlas.models import Change, Profile

from .google import generate_profile_updates, sync_user, update_profile


@pytest.fixture
def user_payload():
    return {
        "id": "100000000",
        "suspended": False,
        "isAdmin": False,
        "primaryEmail": "jane@example.com",
        "name": {"fullName": "Jane Doe"},
        "customSchemas": {
            "Profile": {
                "Date_of_Birth": "1900-08-12",
                "Date_of_Hire": "2010-04-26",
                "Handle": "Jane",
                "Pronouns": "SHE_HER",
                "Bio": "My bio!",
                "Referred_By": None,
            },
            "System": {"Is_Human": True, "Is_Directory_Hidden": False},
            "Social": {"GitHub": None, "LinkedIn": None, "Twitter": None},
            "GamerTags": {
                "Steam": None,
                "Xbox": None,
                "PlayStation": None,
                "Nintendo": None,
            },
            "Schedule": {
                "Sunday": "OFF",
                "Monday": "INOFFICE",
                "Tuesday": "INOFFICE",
                "Wednesday": "WFH",
                "Thursday": "INOFFICE",
                "Friday": "INOFFICE",
                "Saturday": "OFF",
            },
        },
        "organizations": [
            {
                "primary": True,
                "title": "Dummy",
                "customType": "FULL_TIME",
                "department": "Design",
                "cost_center": "200",
            }
        ],
        "locations": [{"area": "desk", "buildingId": "SFO", "type": "desk"}],
        "phones": [{"primary": True, "type": "home", "value": "+1 800-123-4567"}],
        "relations": [{"type": "manager", "value": "jim@example.com"}],
    }


def test_generate_profile_updates_is_human(responses, default_user):
    params = generate_profile_updates(default_user, {"is_human": True})
    assert params == {"customSchemas": {"System": {"Is_Human": True}}}


def test_generate_profile_updates_all_fields(responses, default_user):
    default_user.profile.has_onboarded = False
    default_user.profile.department = None
    default_user.profile.save()

    params = generate_profile_updates(default_user)
    assert params == {
        "customSchemas": {
            "Profile": {
                "Date_of_Birth": "1900-08-12",
                "Date_of_Hire": "2010-04-26",
                "Handle": None,
                "Pronouns": None,
                "Bio": None,
                "Referred_By": None,
            },
            "Social": {"GitHub": None, "LinkedIn": None, "Twitter": None},
            "GamerTags": {
                "Steam": None,
                "Xbox": None,
                "PlayStation": None,
                "Nintendo": None,
            },
            "System": {
                "Is_Human": True,
                "Has_Onboarded": False,
                "Is_Directory_Hidden": False,
            },
            "Schedule": {
                "Sunday": settings.DEFAULT_SCHEDULE[0],
                "Monday": settings.DEFAULT_SCHEDULE[1],
                "Tuesday": settings.DEFAULT_SCHEDULE[2],
                "Wednesday": settings.DEFAULT_SCHEDULE[3],
                "Thursday": settings.DEFAULT_SCHEDULE[4],
                "Friday": settings.DEFAULT_SCHEDULE[5],
                "Saturday": settings.DEFAULT_SCHEDULE[6],
            },
        },
        "organizations": [
            {
                "department": "",
                "primary": True,
                "title": "Dummy",
                "customType": "FULL_TIME",
                "costCenter": "",
            }
        ],
        "locations": [{"area": "desk", "buildingId": "", "type": "desk"}],
        "phones": [{"primary": True, "type": "home", "value": ""}],
        "relations": [{"type": "manager", "value": ""}],
    }


def test_generate_profile_updates_all_fields_with_all_fields(
    responses, default_superuser, default_user, default_office, ga_department
):
    default_user.profile.reports_to = default_superuser
    default_user.profile.referred_by = default_superuser
    default_user.profile.office = default_office
    default_user.profile.department = ga_department
    default_user.profile.twitter = "@getsentry"
    default_user.profile.employee_type = "FULL_TIME"
    default_user.profile.handle = "Jane"
    default_user.profile.bio = "My bio!"
    default_user.profile.pronouns = "SHE_HER"
    default_user.profile.has_onboarded = True
    default_user.profile.primary_phone = "+1 800-123-4567"
    default_user.profile.nintendo = "SW-1234-1234-1234"
    default_user.profile.schedule = [
        "OFF",
        "INOFFICE",
        "INOFFICE",
        "WFH",
        "INOFFICE",
        "INOFFICE",
        "OFF",
    ]
    default_user.profile.save()

    params = generate_profile_updates(default_user)
    assert params == {
        "customSchemas": {
            "Profile": {
                "Date_of_Birth": "1900-08-12",
                "Date_of_Hire": "2010-04-26",
                "Handle": "Jane",
                "Pronouns": "SHE_HER",
                "Bio": "My bio!",
                "Referred_By": default_superuser.email,
            },
            "System": {
                "Is_Human": True,
                "Has_Onboarded": True,
                "Is_Directory_Hidden": False,
            },
            "Social": {"GitHub": None, "LinkedIn": None, "Twitter": "@getsentry"},
            "GamerTags": {
                "Steam": None,
                "Xbox": None,
                "PlayStation": None,
                "Nintendo": "SW-1234-1234-1234",
            },
            "Schedule": {
                "Sunday": "OFF",
                "Monday": "INOFFICE",
                "Tuesday": "INOFFICE",
                "Wednesday": "WFH",
                "Thursday": "INOFFICE",
                "Friday": "INOFFICE",
                "Saturday": "OFF",
            },
        },
        "organizations": [
            {
                "department": ga_department.name,
                "primary": True,
                "title": "Dummy",
                "costCenter": "100",
                "customType": "FULL_TIME",
            }
        ],
        "locations": [{"area": "desk", "buildingId": "SFO", "type": "desk"}],
        "phones": [{"primary": True, "type": "home", "value": "+1 800-123-4567"}],
        "relations": [{"type": "manager", "value": default_superuser.email}],
    }


def test_sync_user_with_user_and_identity(
    responses, default_superuser, default_user, default_identity, default_office
):
    payload = {
        "id": default_identity.external_id,
        "suspended": False,
        "isAdmin": False,
        "primaryEmail": "jane@example.com",
        "name": {"fullName": "Jane Doe"},
        "customSchemas": {
            "Profile": {
                "Date_of_Birth": "1900-08-12",
                "Date_of_Hire": "2010-04-26",
                "Handle": "Jane",
                "Pronouns": "SHE_HER",
                "Bio": "My bio!",
                "Referred_By": None,
            },
            "System": {"Is_Human": True},
            "Social": {"GitHub": None, "LinkedIn": None, "Twitter": None},
            "GamerTags": {
                "Steam": None,
                "Xbox": None,
                "PlayStation": None,
                "Nintendo": "SW-1234-1234-1234",
            },
            "Schedule": {
                "Sunday": "OFF",
                "Monday": "INOFFICE",
                "Tuesday": "INOFFICE",
                "Wednesday": "WFH",
                "Thursday": "INOFFICE",
                "Friday": "INOFFICE",
                "Saturday": "OFF",
            },
        },
        "organizations": [
            {
                "department": "Design",
                "primary": True,
                "title": "Dummy",
                "costCenter": "200",
                "customType": "FULL_TIME",
            }
        ],
        "locations": [{"area": "desk", "buildingId": "SFO", "type": "desk"}],
        "phones": [{"primary": True, "type": "home", "value": "+1 800-123-4567"}],
        "relations": [{"type": "manager", "value": default_superuser.email}],
    }
    result = sync_user(data=payload, user=default_user, user_identity=default_identity)
    assert not result.created
    assert result.updated

    user = result.user
    assert user.name == "Jane Doe"
    assert user.is_active
    assert not user.is_superuser

    assert user.profile.is_human
    assert not user.profile.is_directory_hidden
    assert user.profile.employee_type == "FULL_TIME"
    assert user.profile.handle == "Jane"
    assert user.profile.pronouns == "SHE_HER"
    assert user.profile.bio == "My bio!"
    assert user.profile.nintendo == "SW-1234-1234-1234"

    assert user.profile.schedule == [
        "OFF",
        "INOFFICE",
        "INOFFICE",
        "WFH",
        "INOFFICE",
        "INOFFICE",
        "OFF",
    ]


def test_sync_user_new_account(responses, default_superuser):
    payload = {
        "id": "100000000",
        "suspended": False,
        "isAdmin": False,
        "primaryEmail": "jane@example.com",
        "name": {"fullName": "Jane Doe"},
        "customSchemas": {
            "Profile": {
                "Date_of_Birth": "1900-08-12",
                "Date_of_Hire": "2010-04-26",
                "Handle": "Jane",
                "Pronouns": "SHE_HER",
                "Bio": "My bio!",
                "Referred_By": None,
            },
            "System": {"Is_Human": True},
            "Social": {"GitHub": None, "LinkedIn": None, "Twitter": None},
            "GamerTags": {
                "Steam": None,
                "Xbox": None,
                "PlayStation": None,
                "Nintendo": None,
            },
            "Schedule": {
                "Sunday": "OFF",
                "Monday": "INOFFICE",
                "Tuesday": "INOFFICE",
                "Wednesday": "WFH",
                "Thursday": "INOFFICE",
                "Friday": "INOFFICE",
                "Saturday": "OFF",
            },
        },
        "organizations": [
            {"primary": True, "title": "Dummy", "customType": "FULL_TIME"}
        ],
        "locations": [{"area": "desk", "buildingId": "SFO", "type": "desk"}],
        "phones": [{"primary": True, "type": "home", "value": "+1 800-123-4567"}],
        "relations": [{"type": "manager", "value": "jim@example.com"}],
    }
    result = sync_user(data=payload)
    assert result.created
    assert result.updated

    user = result.user
    assert user.name == "Jane Doe"
    assert user.is_active
    assert not user.is_superuser

    assert user.profile.is_human
    assert not user.profile.is_directory_hidden
    assert user.profile.employee_type == "FULL_TIME"
    assert user.profile.handle == "Jane"
    assert user.profile.pronouns == "SHE_HER"
    assert user.profile.bio == "My bio!"

    assert user.profile.schedule == [
        "OFF",
        "INOFFICE",
        "INOFFICE",
        "WFH",
        "INOFFICE",
        "INOFFICE",
        "OFF",
    ]


def test_sync_user_new_account_without_custom_schemas(responses, default_superuser):
    payload = {
        "id": "100000000",
        "primaryEmail": "joe@example.com",
        "suspended": False,
        "isAdmin": False,
        "name": {"fullName": "Joe Doe"},
        "organizations": [{"department": "Design", "primary": True, "title": "Dummy"}],
        "locations": [{"area": "desk", "buildingId": "SFO", "type": "desk"}],
        "phones": [{"primary": True, "type": "home", "value": "+1 800-123-4567"}],
        "relations": [{"type": "manager", "value": "jane@example.com"}],
    }
    result = sync_user(data=payload)
    assert result.created
    assert result.updated

    user = result.user
    assert user.name == "Joe Doe"
    assert user.is_active
    assert not user.is_superuser

    assert user.profile.is_human
    assert not user.profile.is_directory_hidden
    assert user.profile.employee_type == "FULL_TIME"
    assert user.profile.handle is None
    assert user.profile.pronouns is None
    assert user.profile.bio is None
    assert user.profile.schedule is None


def test_sync_user_new_account_new_department(
    responses, default_superuser, user_payload
):
    user_payload["organizations"][0] = {
        "department": "Product Design",
        "primary": True,
        "title": "Dummy",
        "costCenter": "230",
        "customType": "FULL_TIME",
    }
    result = sync_user(data=user_payload)
    assert result.created
    assert result.updated

    user = result.user
    assert user.profile.department.name == "Product Design"
    assert user.profile.department.cost_center == 230


def test_sync_user_new_account_renamed_department_existing_cost_center(
    responses, default_superuser, user_payload, design_department
):
    assert design_department.cost_center

    user_payload["organizations"][0] = {
        "department": "Realest Design",
        "primary": True,
        "title": "Dummy",
        "costCenter": str(design_department.cost_center),
        "customType": "FULL_TIME",
    }
    result = sync_user(data=user_payload)
    assert result.created
    assert result.updated

    user = result.user
    assert user.profile.department.id == design_department.id
    assert user.profile.department.name == "Design"
    assert user.profile.department.cost_center == design_department.cost_center


def test_sync_user_new_account_updated_department_without_cost_center(
    responses, default_superuser, design_department, user_payload
):
    assert design_department.cost_center

    user_payload["organizations"][0] = {
        "department": "Design",
        "primary": True,
        "title": "Dummy",
        "customType": "FULL_TIME",
    }
    result = sync_user(data=user_payload)
    assert result.created
    assert result.updated

    user = result.user
    assert user.profile.department.id == design_department.id
    assert user.profile.department.name == "Design"
    assert user.profile.department.cost_center == design_department.cost_center


def test_sync_user_new_account_manager(responses, db):
    payload = {
        "id": "100000000",
        "suspended": False,
        "isAdmin": False,
        "primaryEmail": "jane@example.com",
        "name": {"fullName": "Jane Doe"},
        "customSchemas": {},
        "organizations": [
            {"primary": True, "title": "Dummy", "customType": "FULL_TIME"}
        ],
        "locations": [{"area": "desk", "buildingId": "SFO", "type": "desk"}],
        "phones": [{"primary": True, "type": "home", "value": "+1 800-123-4567"}],
        "relations": [{"type": "manager", "value": "jim@example.com"}],
    }
    result = sync_user(data=payload)
    assert result.created
    assert result.updated

    user = result.user
    assert user.name == "Jane Doe"

    manager = user.profile.reports_to
    assert manager.name == "jim"
    assert manager.email == "jim@example.com"
    assert not Profile.objects.filter(user_id=manager.id).exists()


def test_sync_user_refuses_old_version_update(responses, default_user, user_payload):
    last_change = Change.record("user", default_user.id, {})

    user_payload["customSchemas"]["System"]["Version"] = last_change.version - 1

    user_payload["name"] = {"fullName": "Joe Doe"}
    result = sync_user(data=user_payload)
    assert not result.created
    assert not result.updated

    user = result.user
    assert user.id == default_user.id
    assert user.name != "Joe Doe"


def test_sync_user_accepts_same_version_update(responses, default_user, user_payload):
    last_change = Change.record("user", default_user.id, {})

    user_payload["customSchemas"]["System"]["Version"] = last_change.version

    user_payload["name"] = {"fullName": "Joe Doe"}
    result = sync_user(data=user_payload)
    assert result.updated
    assert not result.created

    user = result.user
    assert user.id == default_user.id
    assert user.name == "Joe Doe"


def test_update_profile_nintendo_gamertag(
    responses,
    default_user,
    default_identity,
    default_superuser_identity,
    default_superuser,
    user_payload,
):
    responses.add(
        responses.PATCH,
        f"https://www.googleapis.com/admin/directory/v1/users/{default_identity.external_id}",
        json=user_payload,
    )

    user_payload["customSchemas"]["GamerTags"]["Nintendo"] = "SW-1234-1234-1234"

    update_profile(
        default_superuser_identity, default_user, data={"nintendo": "SW-1234-1234-1234"}
    )

    assert (
        responses.calls[0].request.body
        == b'{"customSchemas": {"GamerTags": {"Nintendo": "SW-1234-1234-1234"}}}'
    )
