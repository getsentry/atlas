from datetime import date
from uuid import uuid4

import requests
from django.conf import settings
from django.db import transaction

from atlas.models import Identity, Office, Profile, User

# GET https://www.googleapis.com/admin/directory/v1/users
# ?domain=primary domain name&pageToken=token for next results page
# &maxResults=max number of results per page
# &orderBy=email, givenName, or familyName
# &sortOrder=ascending or descending
# &query=email, givenName, or familyName:the query's value*


def refresh_token(identity):
    req = requests.post(
        "https://accounts.google.com/o/oauth2/token",
        json={
            "grant_type": "refresh_token",
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "refresh_token": identity.refresh_token,
        },
    )
    data = req.json()
    if "error" in data:
        raise Exception(data["error"])
    identity.access_token = data["access_token"]
    identity.save(update_fields=["access_token"])
    return identity


def get_admin_identity():
    identity = (
        Identity.objects.filter(
            user__is_active=True,
            is_active=True,
            access_token__isnull=False,
            is_admin=True,
        )
        .select_related("user")
        .first()
    )
    if not identity:
        raise Exception("Unable to find an identity to pull data with")
    # TODO(dcramer): we should only refresh this once its expired
    refresh_token(identity)
    return identity


def to_date(value):
    return date(*map(int, value.split("-")))


def get_user(email, name=None, user_cache=None):
    if user_cache is None:
        user_cache = {}
    if email in user_cache:
        return user_cache[email]
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        user = User.objects.create_user(email=email, name=email.split("@", 1)[0])
    user_cache[email] = user
    return user


def get_office(name, office_cache=None):
    if office_cache is None:
        office_cache = {}
    if name in office_cache:
        return office_cache[name]
    office, created = Office.objects.get_or_create(name=name)
    office_cache[name] = office
    return office


def sync_user(  # NOQA
    data, user=None, identity=None, user_cache=None, office_cache=None
):
    if user_cache is None:
        user_cache = {}
    if office_cache is None:
        office_cache = {}

    if user is None:
        user = get_user(
            email=data["primaryEmail"],
            name=data["name"]["fullName"],
            user_cache=user_cache,
        )

    if identity is None:
        identity, _ = Identity.objects.get_or_create(
            provider="google", external_id=data["id"], defaults={"user": user}
        )

    profile, _ = Profile.objects.get_or_create(user=user)

    identity_fields = {}
    user_fields = {}
    profile_fields = {}

    if not user.password:
        user.set_password(uuid4().hex)
        user_fields["password"] = user.password

    # if the account is not active, suspend them
    if data["suspended"] and user.is_active:
        user_fields["is_active"] = False
    elif not data["suspended"] and not user.is_active:
        user_fields["is_active"] = True

    if data["name"]["fullName"] != user.name:
        user_fields["name"] = data["name"]["fullName"]

    if data["isAdmin"] != identity.is_admin:
        identity_fields["is_admin"] = data["isAdmin"]
    if data["suspended"] and identity.is_active:
        identity_fields["is_active"] = False
    elif identity.access_token and not data["suspended"] and not identity.is_active:
        identity_fields["is_active"] = True

    if data.get("thumbnailPhotoUrl") != profile.photo_url:
        profile_fields["photo_url"] = data["thumbnailPhotoUrl"]

    # 'organizations': [{'title': 'Chief Executive Officer', 'primary': True, 'customType': '', 'department': 'G&A', 'description': 'Executive'}]
    if data.get("organizations") and data["organizations"][0]:
        org = data["organizations"][0]
        if (org["title"] or None) != profile.title:
            profile_fields["title"] = org["title"] or None
        if (org["department"] or None) != profile.department:
            profile_fields["department"] = org["department"] or None
    else:
        if profile.title:
            profile_fields["title"] = None
        if profile.department:
            profile_fields["department"] = None

    # 'relations': [{'value': 'david@sentry.io', 'type': 'manager'}]
    if data.get("relations"):
        reports_to = None
        for relation in data["relations"]:
            if relation["type"] == "manager" and relation["value"]:
                reports_to = get_user(email=relation["value"], user_cache=user_cache)
                if profile.reports_to_id != reports_to.id:
                    profile_fields["reports_to"] = reports_to
        if reports_to is None and profile.reports_to_id:
            profile_fields["reports_to"] = None

    # 'locations': [{'type': 'desk', 'area': 'desk', 'buildingId': 'SFO'}]
    if data.get("locations"):
        office = None
        for location in data["locations"]:
            if location["type"] == "desk" and location["buildingId"]:
                office = get_office(location["buildingId"], office_cache=office_cache)
                if profile.office_id != office.id:
                    profile_fields["office"] = office
        if office is None and profile.office_id:
            profile_fields["office"] = None

    # 'customSchemas': {'Profile': {'Date_of_Hire': '2015-10-01', 'Date_of_Birth': '1985-08-12'}
    if data.get("customSchemas"):
        schemas = data.get("customSchemas")
        for attribute_name, field_path in settings.GOOGLE_FIELD_MAP:
            cur_path = schemas
            for bit in field_path.split("/"):
                cur_path = cur_path[bit]
            value = cur_path or None
            if value and attribute_name.startswith("date_"):
                value = to_date(value)
            if getattr(profile, attribute_name) != value:
                profile_fields[attribute_name] = value

        if data["customSchemas"] != profile.config:
            profile_fields["config"] = data["customSchemas"]
    else:
        if profile.config:
            profile_fields["config"] = {}
        for attribute_name, _ in settings.GOOGLE_FIELD_MAP:
            if getattr(profile, attribute_name):
                profile_fields[attribute_name] = None

    if user_fields:
        User.objects.filter(id=user.id).update(**user_fields)
    if profile_fields:
        Profile.objects.filter(id=profile.id).update(**profile_fields)
    if identity_fields:
        Identity.objects.filter(id=identity.id).update(**identity_fields)
    return user


def sync_domain(identity, domain):
    office_cache = {}
    user_cache = {}

    has_more = True
    page_token = None
    while has_more:
        results = requests.get(
            "https://www.googleapis.com/admin/directory/v1/users",
            params={
                "domain": domain or "customer",
                "pageToken": page_token,
                "projection": "full",
            },
            headers={"Authorization": "Bearer {}".format(identity.access_token)},
        )
        data = results.json()
        if data.get("error"):
            raise Exception(data["error"])

        for row in data.get("users") or ():
            with transaction.atomic():
                sync_user(row, user_cache=user_cache, office_cache=office_cache)
        page_token = data.get("nextPageToken")
        has_more = bool(page_token)
