import base64
import json
from typing import Optional

import graphene
import requests
from django.conf import settings
from django.contrib.auth import authenticate
from django.db import IntegrityError, transaction

from backend.models import Identity, Profile, User
from backend.schema import UserNode
from backend.utils.auth import generate_token


def urlsafe_b64decode(b64string):
    padded = b64string + "=" * (4 - len(b64string) % 4)
    return base64.urlsafe_b64decode(padded)


def get_user_from_google_auth_code(auth_code: str = None) -> Optional[User]:
    resp = requests.post(
        "https://www.googleapis.com/oauth2/v4/token",
        json={
            "grant_type": "authorization_code",
            "code": auth_code,
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
        },
    )
    data = resp.json()
    if resp.status_code != 200:
        if "error_description" in data:
            raise Exception(data["error_description"])
        elif "error" in data:
            raise Exception("Error exchanging token: {}".format(data["error"]))
        else:
            resp.raise_for_status()

    config = {
        "access_token": data["access_token"],
        "refresh_token": data["refresh_token"],
        "scope": data["scope"],
    }

    id_token = data["id_token"]
    _, payload, _ = map(urlsafe_b64decode, id_token.split(".", 2))
    payload = json.loads(payload)
    # https://developers.google.com/identity/protocols/OpenIDConnect#server-flow
    # data.user => {
    #      "iss":"accounts.google.com",
    #      "at_hash":"HK6E_P6Dh8Y93mRNtsDB1Q",
    #      "email_verified":"true",
    #      "sub":"10769150350006150715113082367",
    #      "azp":"1234987819200.apps.googleusercontent.com",
    #      "email":"jsmith@example.com",
    #      "aud":"1234987819200.apps.googleusercontent.com",
    #      "iat":1353601026,
    #      "exp":1353604926,
    #      "hd":"example.com"
    # }

    external_id = str(payload["sub"])
    for i in range(2):
        identity = (
            Identity.objects.filter(provider="google", external_id=external_id)
            .select_related("user")
            .first()
        )
        if identity:
            identity.config = config
            identity.save(update_fields=["config"])
            return identity.user

        try:
            with transaction.atomic():
                user = User.objects.create_user(
                    email=payload["email"], name=payload["name"]
                )
        except IntegrityError as exc:
            if "duplicate key" not in str(exc):
                raise
            user = User.objects.get(email=payload["email"])

        try:
            with transaction.atomic():
                Profile.objects.create(user=user)
                identity = Identity.objects.create(
                    user=user, provider="google", external_id=external_id, config=config
                )
                return user
        except IntegrityError as exc:
            if "duplicate key" not in str(exc):
                raise


class Login(graphene.Mutation):
    """
    Mutation to login a user
    """

    class Arguments:
        email = graphene.String(required=False)
        password = graphene.String(required=False)
        google_auth_code = graphene.String(required=False)

    ok = graphene.Boolean()
    errors = graphene.List(graphene.String)
    token = graphene.String()
    user = graphene.Field(UserNode)

    def mutate(
        self,
        info,
        email: str = None,
        password: str = None,
        google_auth_code: str = None,
    ):
        if google_auth_code:
            user = get_user_from_google_auth_code(google_auth_code)
        elif email and password:
            user = authenticate(email=email, password=password)
        else:
            user = None

        if not user:
            return Login(
                ok=False, errors=["Unable to login with provided credentials."]
            )
        # we stuff the user into the current request so they can serialize sensitive attributes
        info.context.user = user
        return Login(ok=True, user=user, token=generate_token(user))
