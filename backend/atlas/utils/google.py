from base64 import urlsafe_b64decode
from collections import namedtuple
from datetime import date
from decimal import Context
from typing import Any, List, Optional, Tuple
from uuid import uuid4

import requests
import sentry_sdk
from django.conf import settings
from django.db import models, transaction

from atlas.constants import FIELD_MODEL_MAP
from atlas.models import Identity, Office, Photo, Profile, User

# GET https://www.googleapis.com/admin/directory/v1/users
# ?domain=primary domain name&pageToken=token for next results page
# &maxResults=max number of results per page
# &orderBy=email, givenName, or familyName
# &sortOrder=ascending or descending
# &query=email, givenName, or familyName:the query's value*

DomainSyncResult = namedtuple(
    "DomainSyncResult",
    [
        "total_users",
        "created_users",
        "updated_users",
        "pruned_users",
        "total_buildings",
        "created_buildings",
        "updated_buildings",
        "pruned_buildings",
    ],
)
BatchSyncResult = namedtuple(
    "BatchSyncResult", ["total", "created", "updated", "pruned"]
)
BuildingSyncResult = namedtuple("BuildingSyncResult", ["office", "created", "updated"])
UserSyncResult = namedtuple("UserSyncResult", ["user", "created", "updated"])


def find(iterable, func):
    if not iterable:
        return None
    for n in iterable:
        if func(n):
            return n
    return None


def refresh_token(identity: Identity) -> Identity:
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


def get_admin_identity() -> Identity:
    scopes_required = [
        "https://www.googleapis.com/auth/admin.directory.user",
        "https://www.googleapis.com/auth/admin.directory.resource.calendar",
    ]

    identity = (
        Identity.objects.filter(
            user__is_active=True,
            is_active=True,
            access_token__isnull=False,
            is_admin=True,
            scopes__contains=scopes_required,
        )
        .select_related("user")
        .first()
    )
    if not identity:
        raise Exception("Unable to find an identity to pull data with")
    # TODO(dcramer): we should only refresh this once its expired
    refresh_token(identity)
    return identity


def to_date(value: str) -> date:
    return date(*map(int, value.split("-")))


def lookup_field(data: dict, field_path: str) -> Optional[Any]:
    cur_path = data
    for bit in field_path.split("/"):
        try:
            cur_path = cur_path[bit]
        except KeyError:
            return None
    return cur_path


def get_user(
    email: str, name: str = None, user_cache: dict = None
) -> Tuple[User, bool]:
    if user_cache is None:
        user_cache = {}
    if email in user_cache:
        return user_cache[email], False
    try:
        user = User.objects.get(email=email)
        created = False
    except User.DoesNotExist:
        user = User.objects.create_user(email=email, name=email.split("@", 1)[0])
        created = True
    user_cache[email] = user
    return user, created


def get_office(external_id: str, office_cache: dict = None) -> Office:
    if office_cache is None:
        office_cache = {}
    if external_id in office_cache:
        return office_cache[external_id]
    office, created = Office.objects.get_or_create(
        external_id=external_id, defaults={"name": external_id}
    )
    office_cache[external_id] = office
    return office


def generate_profile_updates(user: User, data: dict = None) -> dict:
    profile = user.profile

    if data is None:
        # update all fields
        data = {}
        for field, model in FIELD_MODEL_MAP.items():
            if model is User:
                data[field] = getattr(user, field)
            elif model is Profile:
                data[field] = getattr(profile, field)
            else:
                raise NotImplementedError
            if isinstance(data[field], models.Model):
                data[field] = data[field].pk

    params = {}

    if "office" in data:
        params["locations"] = [
            {
                "type": "desk",
                "area": "desk",
                "buildingId": Office.objects.get(id=data["office"]).external_id
                if data["office"]
                else "",
            }
        ]

    if "title" in data or "department" in data:
        params["organizations"] = [
            {
                "primary": True,
                "title": data.get("title") or profile.title,
                "department": data.get("department") or profile.department,
            }
        ]

    if "reports_to" in data:
        params["relations"] = [
            {
                "type": "manager",
                "value": User.objects.get(id=data["reports_to"]).email
                if data["reports_to"]
                else "",
            }
        ]

    if "primary_phone" in data:
        params["phones"] = [
            {"type": "home", "primary": True, "value": data.get("primary_phone") or ""}
        ]

    for key, field_path in settings.GOOGLE_FIELD_MAP:
        if key in data:
            if isinstance(data[key], date):
                value = data[key].isoformat()
            else:
                value = data[key]

            schema = params.setdefault("customSchemas", {})
            field_bits = field_path.split("/")
            for bit in field_bits[:-1]:
                schema = schema.setdefault(bit, {})
            schema[field_bits[-1]] = value

    if "schedule" in data:
        value = data["schedule"] or settings.DEFAULT_SCHEDULE
        schema = params.setdefault("customSchemas", {})
        schema[settings.GOOGLE_SCHEDULE_FIELD] = {
            "Sunday": value[0],
            "Monday": value[1],
            "Tuesday": value[2],
            "Wednesday": value[3],
            "Thursday": value[4],
            "Friday": value[5],
            "Saturday": value[6],
        }

    return params


def update_all_profiles(identity: Identity, users: List[str] = None) -> BatchSyncResult:
    total, created, updated = 0, 0, 0

    if users:
        user_list = User.objects.filter(email__in=users)
    else:
        user_list = User.objects.all()

    for user in user_list:
        total += 1
        updated += 1
        update_profile(identity, user)

    return BatchSyncResult(total=total, created=created, updated=updated, pruned=0)


def update_profile(identity: Identity, user: User, data: dict = None) -> UserSyncResult:
    params = generate_profile_updates(user, data)

    user_identity = Identity.objects.get(provider="google", user=user)
    response = requests.patch(
        f"https://www.googleapis.com/admin/directory/v1/users/{user_identity.external_id}",
        json=params,
        headers={"Authorization": "Bearer {}".format(identity.access_token)},
    )
    # NOTE(dcramer): we could sync_user here but this doesnt include custom attributes in the response
    data = response.json()
    response.raise_for_status()

    return user


def sync_user(  # NOQA
    data: dict,
    user: User = None,
    user_identity: Identity = None,
    user_cache: dict = None,
    office_cache: dict = None,
) -> UserSyncResult:
    if user_cache is None:
        user_cache = {}
    if office_cache is None:
        office_cache = {}

    if user_identity is None:
        try:
            user_identity = Identity.objects.get(
                provider="google", external_id=data["id"]
            )
        except Identity.DoesNotExist:
            pass

    if user_identity and not user:
        user = user_identity.user

    if user is None:
        user, created = get_user(
            email=data["primaryEmail"],
            name=data["name"]["fullName"],
            user_cache=user_cache,
        )
    else:
        created = False

    if user_identity is None:
        user_identity, _ = Identity.objects.get_or_create(
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

    if data["isAdmin"] != user_identity.is_admin:
        identity_fields["is_admin"] = data["isAdmin"]
    if data["suspended"] and user_identity.is_active:
        identity_fields["is_active"] = False
    elif (
        user_identity.access_token
        and not data["suspended"]
        and not user_identity.is_active
    ):
        identity_fields["is_active"] = True

    # 'organizations': [{'title': 'Chief Executive Officer', 'primary': True, 'customType': '', 'department': 'G&A', 'description': 'Executive'}]
    # TODO(dcramer): this probably needs to handle multiple orgs
    row = find(data.get("organizations"), lambda x: x["primary"])
    if row:
        if (row.get("title") or None) != profile.title:
            profile_fields["title"] = row.get("title") or None
        if (row.get("department") or None) != profile.department:
            profile_fields["department"] = row.get("department") or None
    else:
        if profile.title:
            profile_fields["title"] = None
        if profile.department:
            profile_fields["department"] = None

    # 'relations': [{'value': 'david@sentry.io', 'type': 'manager'}]
    row = find(data.get("relations"), lambda x: x["type"] == "manager" and x["value"])
    if row:
        reports_to, _ = get_user(email=row["value"], user_cache=user_cache)
        if profile.reports_to_id != reports_to.id:
            profile_fields["reports_to"] = reports_to
    elif profile.reports_to_id:
        profile_fields["reports_to"] = None

    # 'locations': [{'type': 'desk', 'area': 'desk', 'buildingId': 'SFO'}]
    row = find(
        data.get("locations"),
        lambda x: x["type"] == "desk"
        and x["buildingId"]
        and not x["buildingId"].startswith("$$"),
    )
    if row:
        office = get_office(row["buildingId"], office_cache=office_cache)
        if profile.office_id != office.id:
            profile_fields["office"] = office
    elif profile.office_id:
        profile_fields["office"] = None

    row = find(data.get("phones"), lambda x: x["primary"])
    if row:
        if profile.primary_phone != row["value"]:
            profile_fields["primary_phone"] = row["value"]
    elif profile.primary_phone:
        profile_fields["primary_phone"] = None

    # 'customSchemas': {'Profile': {'Date_of_Hire': '2015-10-01', 'Date_of_Birth': '1985-08-12'}
    if data.get("customSchemas"):
        schemas = data.get("customSchemas")
        for attribute_name, field_path in settings.GOOGLE_FIELD_MAP:
            value = lookup_field(schemas, field_path)
            if value and attribute_name.startswith("date_"):
                value = to_date(value)
            elif attribute_name.startswith("is_human") and value is None:
                value = True
            elif attribute_name == "employee_type" and value is None:
                value = "FULL_TIME"
            elif attribute_name.startswith("is_"):
                value = bool(value)
            if getattr(profile, attribute_name) != value:
                profile_fields[attribute_name] = value
        if settings.GOOGLE_SCHEDULE_FIELD in schemas:
            value = schemas[settings.GOOGLE_SCHEDULE_FIELD]
            profile_fields["schedule"] = [
                value.get("Sunday") or "",
                value.get("Monday") or "",
                value.get("Tuesday") or "",
                value.get("Wednesday") or "",
                value.get("Thursday") or "",
                value.get("Friday") or "",
                value.get("Saturday") or "",
            ]
        if data["customSchemas"] != profile.config:
            profile_fields["config"] = data["customSchemas"]
    else:
        profile_fields["employee_type"] = "FULL_TIME"
        if profile.config:
            profile_fields["config"] = {}
        for attribute_name, _ in settings.GOOGLE_FIELD_MAP:
            if attribute_name == "is_human":
                if not profile.is_human:
                    profile_fields[attribute_name] = True
            elif attribute_name.startswith("is_"):
                profile_fields[attribute_name] = False
            elif getattr(profile, attribute_name) is not None:
                profile_fields[attribute_name] = None

    with transaction.atomic():
        if user_fields:
            User.objects.filter(id=user.id).update(**user_fields)
            for k, v in user_fields.items():
                setattr(user, k, v)
        if profile_fields:
            Profile.objects.filter(id=profile.id).update(**profile_fields)
            for k, v in profile_fields.items():
                setattr(profile, k, v)
            user.profile = profile
        if identity_fields:
            Identity.objects.filter(id=user_identity.id).update(**identity_fields)
            for k, v in identity_fields.items():
                setattr(user_identity, k, v)

    return UserSyncResult(
        user=user,
        created=created,
        updated=bool(user_fields or profile_fields or identity_fields),
    )


def sync_user_photo(identity: Identity, user: User):
    # GET https://www.googleapis.com/admin/directory/v1/users/liz@example.com/photos/thumbnail
    user_identity = Identity.objects.get(provider="google", user=user)
    response = requests.get(
        f"https://www.googleapis.com/admin/directory/v1/users/{user_identity.external_id}/photos/thumbnail",
        headers={"Authorization": "Bearer {}".format(identity.access_token)},
    )
    if response.status_code == 404:
        Photo.objects.filter(user=user).delete()
        return False

    response.raise_for_status()
    data = response.json()

    values = {
        "data": urlsafe_b64decode(data["photoData"]),
        "width": data["width"],
        "height": data["height"],
        "mime_type": data["mimeType"],
    }

    photo, created = Photo.objects.get_or_create(user=user, defaults=values)
    if not created:
        updates = {}
        for key, value in values.items():
            cur_value = getattr(photo, key)
            if key == "data":
                cur_value = cur_value.tobytes()
            if cur_value != value:
                updates[key] = value
        if updates:
            Photo.objects.filter(id=photo.id).update(**updates)
            return True
    return False


def sync_building(  # NOQA
    data: dict,
    office: Office = None,
    identity: Identity = None,
    user_cache: dict = None,
    office_cache: dict = None,
) -> BuildingSyncResult:
    fields = {"name": data["buildingName"], "description": data["description"]}

    if data.get("coordinates") and data["coordinates"]["latitude"]:
        fields["lat"] = Context(prec=9).create_decimal_from_float(
            data["coordinates"]["latitude"]
        )
    else:
        fields["lat"] = None

    if data.get("coordinates") and data["coordinates"]["longitude"]:
        fields["lng"] = Context(prec=9).create_decimal_from_float(
            data["coordinates"]["longitude"]
        )
    else:
        fields["lng"] = None

    if data.get("address") and data["address"]["addressLines"]:
        fields["location"] = "\n".join(data["address"]["addressLines"])
    else:
        fields["location"] = None

    for loc_field, rem_field in (
        ("region_code", "regionCode"),
        ("postal_code", "postalCode"),
        ("locality", "locality"),
        ("administrative_area", "administrativeArea"),
    ):
        fields[loc_field] = (
            (data["address"].get(rem_field) or None) if data.get("address") else None
        )

    office, created = Office.objects.get_or_create(
        external_id=data["buildingId"], defaults=fields
    )

    updates = []
    for k, v in fields.items():
        if getattr(office, k) != v:
            setattr(office, k, v)
            updates.append(k)

    if updates:
        office.save(update_fields=updates)

    return BuildingSyncResult(office=office, created=created, updated=bool(updates))


def sync_domain(
    identity: Identity, domain: str, users: List[str] = None, offices: List[str] = None
) -> DomainSyncResult:
    office_cache = {}
    user_cache = {}

    building_result = sync_buildings(
        identity, domain, offices, office_cache=office_cache, user_cache=user_cache
    )

    user_result = sync_users(
        identity, domain, users, office_cache=office_cache, user_cache=user_cache
    )

    return DomainSyncResult(
        total_users=user_result.total,
        updated_users=user_result.updated,
        created_users=user_result.created,
        pruned_users=user_result.pruned,
        total_buildings=building_result.total,
        updated_buildings=building_result.updated,
        created_buildings=building_result.created,
        pruned_buildings=building_result.pruned,
    )


def sync_buildings(
    identity: Identity,
    domain: str,
    offices: List[str] = None,
    user_cache: dict = None,
    office_cache: dict = None,
) -> BatchSyncResult:
    total, created, updated = 0, 0, 0
    known = set()
    has_more = True
    page_token = None
    while has_more:
        results = requests.get(
            "https://www.googleapis.com/admin/directory/v1/customer/my_customer/resources/buildings",
            params={"pageToken": page_token},
            headers={"Authorization": "Bearer {}".format(identity.access_token)},
        )
        data = results.json()
        if data.get("error"):
            raise Exception(data["error"])

        for row in data.get("buildings") or ():
            known.add(row["buildingId"])
            if offices and row["buildingId"] not in offices:
                continue

            total += 1
            with sentry_sdk.Hub.current.span(
                op="google.sync-building", description=row["buildingId"]
            ), transaction.atomic():
                office, is_created, is_updated = sync_building(row)
                if is_created:
                    created += 1
                if is_updated:
                    updated += 1
                office_cache[office.external_id] = office
        page_token = data.get("nextPageToken")
        has_more = bool(page_token)

    # remove offices which are not found
    office_ids = Office.objects.exclude(external_id__in=known).values_list(
        "id", flat=True
    )
    Office.objects.filter(id__in=office_ids).delete()

    return BatchSyncResult(
        total=total, created=created, updated=updated, pruned=len(office_ids)
    )


def sync_users(
    identity: Identity,
    domain: str,
    users: List[str] = None,
    user_cache: dict = None,
    office_cache: dict = None,
) -> BatchSyncResult:
    total, created, updated = 0, 0, 0
    known = set()
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
            known.add(row["id"])
            if users and row["primaryEmail"] not in users:
                continue
            total += 1
            with sentry_sdk.Hub.current.span(
                op="google.sync-user", description=str(row["id"])
            ), transaction.atomic():
                user, is_created, is_updated = sync_user(
                    row, user_cache=user_cache, office_cache=office_cache
                )
                if sync_user_photo(identity, user):
                    is_updated = True
                if is_created:
                    created += 1
                if is_updated:
                    updated += 1
        page_token = data.get("nextPageToken")
        has_more = bool(page_token)

    # suspend accounts which are not found
    user_ids = list(
        User.objects.filter(identity__provider="google")
        .exclude(identity__external_id__in=known)
        .values_list("id", flat=True)
    )
    User.objects.filter(id__in=user_ids).update(is_active=False)

    return BatchSyncResult(
        total=total, created=created, updated=updated, pruned=len(user_ids)
    )
