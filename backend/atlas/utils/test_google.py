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
        "phones": [{"primary": True, "type": "home", "value": ""}],
        "relations": [],
    }
