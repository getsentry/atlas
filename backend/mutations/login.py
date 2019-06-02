import base64
import json
from typing import Optional

import graphene
import requests
from django.contrib.auth import authenticate
from django.db import IntegrityError, transaction

from backend.models import Identity, User
from backend.schema import UserNode
from backend.utils.auth import generate_token


def urlsafe_b64decode(b64string):
    padded = b64string + b"=" * (4 - len(b64string) % 4)
    return base64.urlsafe_b64decode(padded)


def get_user_from_google_token(id_token: str = None) -> Optional[User]:
    resp = requests.get(
        "https://www.googleapis.com/oauth2/v3/tokeninfo?id_token={}".format(id_token)
    )
    if resp.status_code != 200:
        raise Exception

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
            return identity.user
        try:
            with transaction.atomic():
                user = User.objects.create(email=payload["email"], name=payload["name"])
                identity = Identity.objects.create(
                    user=user, provider="google", external_id=external_id
                )
                return user
        except IntegrityError:
            pass
    return user


class Login(graphene.Mutation):
    """
    Mutation to login a user
    """

    class Arguments:
        email = graphene.String(required=False)
        password = graphene.String(required=False)
        google_token = graphene.String(required=False)

    ok = graphene.Boolean()
    errors = graphene.List(graphene.String)
    token = graphene.String()
    user = graphene.Field(UserNode)

    def mutate(
        self, info, email: str = None, password: str = None, google_token: str = None
    ):
        if google_token:
            user = get_user_from_google_token(google_token)
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
