from datetime import date

import requests
from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction

from backend.models import Identity, Office, Profile, User

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
            "refresh_token": identity.config["refresh_token"],
        },
    )
    data = req.json()
    identity.config.update({"access_token": data["access_token"]})
    identity.save(update_fields=["config"])
    return identity


def get_identity():
    identity = (
        Identity.objects.filter(user__is_active=True).select_related("user").first()
    )
    if not identity:
        raise Exception("Unable to find an identity to pull data with")
    # TODO(dcramer): we should only refresh this once its expired
    refresh_token(identity)
    return identity


class Command(BaseCommand):
    help = "Synchronize users from Google"

    def add_arguments(self, parser):
        parser.add_argument("domain", type=str)

        # {
        #     "kind": "admin#directory#user",
        #     "id": "115493104704714850404",
        #     "etag": '"GPUJN6YVAOElesyqxtgGs7jrFWY/uKQoZmz5xojueZU2M1DdyRlEBzo"',
        #     "primaryEmail": "vu@sentry.io",
        #     "name": {"givenName": "Vu", "familyName": "Ngo", "fullName": "Vu Ngo"},
        #     "isAdmin": False,
        #     "isDelegatedAdmin": False,
        #     "lastLoginTime": "2019-05-31T22:00:21.000Z",
        #     "f": "2017-11-27T16:47:11.000Z",
        #     "agreedToTerms": True,
        #     "suspended": False,
        #     "archived": False,
        #     "changePasswordAtNextLogin": False,
        #     "ipWhitelisted": False,
        #     "emails": [{"address": "vu@sentry.io", "primary": True}],
        #     "externalIds": [{"value": "", "type": "organization"}],
        #     "organizations": [
        #         {
        #             "title": "",
        #             "primary": True,
        #             "customType": "",
        #             "department": "",
        #             "description": "",
        #             "costCenter": "",
        #         }
        #     ],
        #     "customerId": "C035ekuzr",
        #     "orgUnitPath": "/sales",
        #     "isMailboxSetup": True,
        #     "isEnrolledIn2Sv": True,
        #     "isEnforcedIn2Sv": True,
        #     "includeInGlobalAddressList": True,
        # }

    def to_date(self, value):
        return date(*map(int, value.split("-")))

    def get_user(self, email, name=None):
        if email in self.user_cache:
            return self.user_cache[email]
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            self.stdout.write(
                self.style.MIGRATE_LABEL("  Created user [{}]".format(email))
            )
            user = User.objects.create_user(email=email, name=email.split("@", 1)[0])
        self.user_cache[email] = user
        return user

    def get_office(self, name):
        if name in self.office_cache:
            return self.office_cache[name]
        office, created = Office.objects.get_or_create(name=name)
        if created:
            self.stdout.write(
                self.style.MIGRATE_LABEL("  Created office [{}]".format(name))
            )
        self.office_cache[name] = office
        return office

    def process_user_row(self, row):  # NOQA
        user = self.get_user(email=row["primaryEmail"], name=row["name"]["fullName"])
        profile, _ = Profile.objects.get_or_create(user=user)

        user_fields = {}
        profile_fields = {}

        # if the account is not active, suspend them
        if row["suspended"] and user.is_active:
            user_fields["is_active"] = False

        if row["name"]["fullName"] != user.name:
            user_fields["name"] = row["name"]["fullName"]

        if row.get("thumbnailPhotoUrl") != profile.photo_url:
            profile_fields["photo_url"] = row["thumbnailPhotoUrl"]

        # 'organizations': [{'title': 'Chief Executive Officer', 'primary': True, 'customType': '', 'department': 'G&A', 'description': 'Executive'}]
        if row.get("organizations") and row["organizations"][0]:
            org = row["organizations"][0]
            if (org["title"] or None) != profile.title:
                profile_fields["title"] = org["title"] or None
        elif profile.title:
            profile_fields["title"] = None

        # 'relations': [{'value': 'david@sentry.io', 'type': 'manager'}]
        if row.get("relations"):
            reports_to = None
            for relation in row["relations"]:
                if relation["type"] == "manager" and relation["value"]:
                    reports_to = self.get_user(email=relation["value"])
                    if profile.reports_to_id != reports_to.id:
                        profile_fields["reports_to"] = reports_to
            if reports_to is None and profile.reports_to_id:
                profile_fields["reports_to"] = None

        # 'locations': [{'type': 'desk', 'area': 'desk', 'buildingId': 'SFO'}]
        if row.get("locations"):
            office = None
            for location in row["locations"]:
                if location["type"] == "desk" and location["buildingId"]:
                    office = self.get_office(location["buildingId"])
                    if profile.office_id != office.id:
                        profile_fields["office"] = office
            if office is None and profile.office_id:
                profile_fields["office"] = None

        # 'customSchemas': {'Profile': {'Date_of_Hire': '2015-10-01', 'Date_of_Birth': '1985-08-12'}
        if row.get("customSchemas") and "Profile" in row["customSchemas"]:
            custom_profile = row["customSchemas"]["Profile"]
            date_of_hire = self.to_date(custom_profile["Date_of_Hire"])
            if date_of_hire != profile.joined_at:
                profile_fields["joined_at"] = date_of_hire
            date_of_birth = self.to_date(custom_profile["Date_of_Birth"])
            if date_of_birth != profile.dob:
                profile_fields["dob"] = date_of_birth

        if user_fields:
            self.stdout.write(
                self.style.MIGRATE_LABEL("  Updated user [{}]".format(user.email))
            )
            User.objects.filter(id=user.id).update(**user_fields)
        if profile_fields:
            self.stdout.write(
                self.style.MIGRATE_LABEL("  Updated profile [{}]".format(user.email))
            )
            Profile.objects.filter(id=profile.id).update(**profile_fields)

    def handle(self, *args, **options):
        domain = options.get("domain")

        self.office_cache = {}
        self.user_cache = {}

        identity = get_identity()

        self.stdout.write(
            self.style.MIGRATE_HEADING(
                "Synchronizing users for [{}] with identity [{}]".format(
                    domain, identity.user.email
                )
            )
        )

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
                headers={
                    "Authorization": "Bearer {}".format(identity.config["access_token"])
                },
            )
            data = results.json()
            if data.get("error"):
                raise Exception(data["error"])

            for row in data.get("users") or ():
                # TODO(dcramer): we should couple these to identity..
                with transaction.atomic():
                    self.process_user_row(row)
            page_token = data.get("nextPageToken")
            has_more = bool(page_token)
