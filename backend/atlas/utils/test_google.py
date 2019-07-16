from .google import generate_profile_updates


def test_update_profile(responses, default_identity, default_user):
    params = generate_profile_updates(
        default_identity, default_user, {"is_human": True}
    )
    assert params == {"customSchemas": {"System": {"Is_Human": "yes"}}}
