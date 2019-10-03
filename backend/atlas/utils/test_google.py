from django.conf import settings

from .google import generate_profile_updates, sync_user


def test_generate_profile_updates_is_human(responses, default_user):
    params = generate_profile_updates(default_user, {"is_human": True})
    assert params == {"customSchemas": {"System": {"Is_Human": True}}}


def test_generate_profile_updates_all_fields(responses, default_user):
    params = generate_profile_updates(default_user)
    assert params == {
        "customSchemas": {
            "Profile": {
                "Date_of_Birth": "1990-08-12",
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
            "System": {"Is_Human": True, "Has_Onboarded": False},
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
                "department": default_user.profile.department_id,
                "primary": True,
                "title": "Dummy",
                "customType": "FULL_TIME",
            }
        ],
        "locations": [{"area": "desk", "buildingId": "", "type": "desk"}],
        "phones": [{"primary": True, "type": "home", "value": ""}],
        "relations": [{"type": "manager", "value": ""}],
    }


def test_generate_profile_updates_all_fields_with_all_fields(
    responses, default_superuser, default_user, default_office
):
    default_user.profile.reports_to = default_superuser
    default_user.profile.referred_by = default_superuser
    default_user.profile.office = default_office
    default_user.profile.twitter = "@getsentry"
    default_user.profile.employee_type = "FULL_TIME"
    default_user.profile.handle = "Jane"
    default_user.profile.bio = "My bio!"
    default_user.profile.pronouns = "SHE_HER"
    default_user.profile.has_onboarded = True
    default_user.profile.primary_phone = "+1 800-123-4567"
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
                "Date_of_Birth": "1990-08-12",
                "Date_of_Hire": "2010-04-26",
                "Handle": "Jane",
                "Pronouns": "SHE_HER",
                "Bio": "My bio!",
                "Referred_By": default_superuser.email,
            },
            "System": {"Is_Human": True, "Has_Onboarded": True},
            "Social": {"GitHub": None, "LinkedIn": None, "Twitter": "@getsentry"},
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
                "department": default_user.profile.department_id,
                "primary": True,
                "title": "Dummy",
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
                "Date_of_Birth": "1990-08-12",
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
            {
                "department": "Design",
                "primary": True,
                "title": "Dummy",
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


def test_sync_user_new_account(responses, default_superuser):
    payload = {
        "id": "100000000",
        "suspended": False,
        "isAdmin": False,
        "primaryEmail": "jane@example.com",
        "name": {"fullName": "Jane Doe"},
        "customSchemas": {
            "Profile": {
                "Date_of_Birth": "1990-08-12",
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
            {
                "department": "Design",
                "primary": True,
                "title": "Dummy",
                "customType": "FULL_TIME",
            }
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
    assert user.profile.employee_type == "FULL_TIME"
    assert user.profile.handle is None
    assert user.profile.pronouns is None
    assert user.profile.bio is None
    assert user.profile.schedule is None
