from .google import generate_profile_updates


def test_generate_profile_updates_is_human(responses, default_identity, default_user):
    params = generate_profile_updates(
        default_identity, default_user, {"is_human": True}
    )
    assert params == {"customSchemas": {"System": {"Is_Human": True}}}


def test_generate_profile_updates_all_fields(responses, default_identity, default_user):
    params = generate_profile_updates(default_identity, default_user)
    assert params == {
        "customSchemas": {
            "Profile": {
                "Date_of_Birth": "1990-08-12",
                "Date_of_Hire": "2010-04-26",
                "Handle": None,
            },
            "System": {"Is_Human": True},
        },
        "organizations": [{"department": "Design", "primary": True, "title": "Dummy"}],
        "locations": [],
        "phones": [{"primary": True, "type": "home", "value": ""}],
        "relations": [],
    }


def test_generate_profile_updates_all_fields_with_all_fields(
    responses, default_identity, default_superuser, default_user, default_office
):
    default_user.profile.reports_to = default_superuser
    default_user.profile.office = default_office
    default_user.profile.primary_phone = "+1 800-123-4567"
    default_user.profile.save()

    params = generate_profile_updates(default_identity, default_user)
    assert params == {
        "customSchemas": {
            "Profile": {
                "Date_of_Birth": "1990-08-12",
                "Date_of_Hire": "2010-04-26",
                "Handle": None,
            },
            "System": {"Is_Human": True},
        },
        "organizations": [{"department": "Design", "primary": True, "title": "Dummy"}],
        "locations": [{"area": "desk", "buildingId": "SFO", "type": "desk"}],
        "phones": [{"primary": True, "type": "home", "value": "+1 800-123-4567"}],
        "relations": [{"type": "manager", "value": default_superuser.email}],
    }
