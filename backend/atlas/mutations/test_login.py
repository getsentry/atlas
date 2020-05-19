import base64
import json

from atlas.models import User


def make_token_response(id_token):
    id_token = base64.urlsafe_b64encode(json.dumps(id_token).encode("utf-8")).decode(
        "utf-8"
    )
    id_token = id_token + "=" * (4 - len(id_token) % 4)

    return {
        "access_token": "a.really.cool.token",
        "expires_in": 3598,
        "refresh_token": "1//a-reallycoolrefreshtoken",
        "scope": "openid https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/admin.directory.user https://www.googleapis.com/auth/admin.directory.resource.calendar https://www.googleapis.com/auth/admin.directory.user.readonly https://www.googleapis.com/auth/calendar.events.readonly",
        "token_type": "Bearer",
        "id_token": f"unused.{id_token}.unused",
    }


def make_profile_response():
    return {
        "kind": "admin#directory#user",
        "id": "10769150350006150715113082367",
        "etag": '"redacted/redacted"',
        "primaryEmail": "jsmith@example.io",
        "name": {"givenName": "Jane", "familyName": "Smith", "fullName": "Jane Smith"},
        "isAdmin": True,
        "isDelegatedAdmin": False,
        "lastLoginTime": "2020-03-12T18:20:11.000Z",
        "creationTime": "2012-01-15T00:29:33.000Z",
        "agreedToTerms": True,
        "suspended": False,
        "archived": False,
        "changePasswordAtNextLogin": False,
        "ipWhitelisted": False,
        "emails": [
            {"address": "jsmith@example.com", "primary": True},
            {"address": "jane.smith@example.com"},
        ],
        "relations": [{"value": "jdoe@example.com", "type": "manager"}],
        "organizations": [
            {
                "title": "CTO",
                "primary": True,
                "customType": "FULL_TIME",
                "department": "G&A",
                "costCenter": "100",
            }
        ],
        "phones": [],
        "aliases": ["jane.smith@example.com"],
        "nonEditableAliases": [],
        "locations": [{"type": "desk", "area": "desk", "buildingId": "HQ"}],
        "customerId": "redacted",
        "orgUnitPath": "/executive/cto",
        "isMailboxSetup": True,
        "isEnrolledIn2Sv": True,
        "isEnforcedIn2Sv": True,
        "includeInGlobalAddressList": True,
        "thumbnailPhotoUrl": "https://www.google.com/s2/photos/private/photo-thing",
        "thumbnailPhotoEtag": '"redacted/redacted"',
        "recoveryEmail": "jsmith.personal@example.com",
        "recoveryPhone": "+15555555",
    }


def test_login_new_user_google_auth(gql_client, responses):
    responses.add(
        responses.POST,
        "https://www.googleapis.com/oauth2/v4/token",
        json=make_token_response(
            {
                "iss": "accounts.google.com",
                "at_hash": "HK6E_P6Dh8Y93mRNtsDB1Q",
                "email_verified": "true",
                "sub": "10769150350006150715113082367",
                "azp": "1234987819200.apps.googleusercontent.com",
                "email": "jsmith@example.com",
                "name": "Jane Smith",
                "aud": "1234987819200.apps.googleusercontent.com",
                "iat": 1353601026,
                "exp": 1353604926,
                "hd": "example.com",
            }
        ),
    )
    responses.add(
        responses.GET,
        "https://www.googleapis.com/admin/directory/v1/users/10769150350006150715113082367",
        json=make_profile_response(),
    )
    executed = gql_client.execute(
        """
    mutation {
        login(googleAuthCode:"abcdefg") {
            ok
            errors
            token
            user {id}
        }
    }"""
    )
    resp = executed["data"]["login"]
    assert resp["errors"] is None
    assert resp["ok"] is True
    user = User.objects.get(id=resp["user"]["id"])
    assert user.name == "Jane Smith"
    assert user.email == "jsmith@example.com"

    assert isinstance(resp["token"], str)


def test_successful_login_basic_creds(gql_client, default_user):
    executed = gql_client.execute(
        """
    mutation($email: String!) {
        login(email:$email, password:"phish.reel.big") {
            ok
            errors
            token
            user {id, email, name}
        }
    }""",
        variables={"email": default_user.email},
    )
    resp = executed["data"]["login"]
    assert resp["errors"] is None
    assert resp["ok"] is True
    assert resp["user"] == {
        "id": str(default_user.id),
        "email": default_user.email,
        "name": default_user.name,
    }

    assert isinstance(resp["token"], str)


def test_invalid_password(gql_client, default_user):
    executed = gql_client.execute(
        """
    mutation($email: String!) {
        login(email:$email, password:"pwrong") {
            ok
            errors
            token
            user {id, email, name}
        }
    }""",
        variables={"email": default_user.email},
    )
    resp = executed["data"]["login"]
    assert resp["errors"]
    assert resp["ok"] is False
    assert resp["user"] is None
    assert resp["token"] is None
