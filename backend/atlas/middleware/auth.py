import logging

from django.contrib.auth.models import AnonymousUser
from django.utils.functional import SimpleLazyObject

from atlas.models import User
from atlas.utils.auth import parse_token, security_hash


def get_user(header):
    if not header.startswith("Token "):
        return AnonymousUser()

    token = header.split(" ", 1)[1]
    payload = parse_token(token)
    if not payload:
        return AnonymousUser()

    try:
        user = User.objects.get(id=payload["uid"])
    except (TypeError, KeyError, User.DoesNotExist):
        logging.error("auth.invalid-uid")
        return AnonymousUser()

    if security_hash(user) != payload["sh"]:
        logging.error("auth.invalid-security-hash")
        return AnonymousUser()

    return user


class JWSTokenAuthenticationMiddleware(object):
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        header = request.META.get("HTTP_AUTHORIZATION")
        if header:
            request.user = SimpleLazyObject(lambda: get_user(header))
        else:
            request.user = AnonymousUser()
        return self.get_response(request)
