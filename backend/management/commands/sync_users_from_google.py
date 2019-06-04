import requests
from django.core.management.base import BaseCommand
from django.db import transaction

from backend.models import Identity, Office, Profile, User

# GET https://www.googleapis.com/admin/directory/v1/users
# ?domain=primary domain name&pageToken=token for next results page
# &maxResults=max number of results per page
# &orderBy=email, givenName, or familyName
# &sortOrder=ascending or descending
# &query=email, givenName, or familyName:the query's value*


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

    def handle(self, *args, **options):
        self.office_cache = {}
        self.user_cache = {}

        identity = (
            Identity.objects.filter(user__is_active=True).select_related("user").get()
        )

        self.stdout.write(
            self.style.MIGRATE_HEADING(
                "Synchronizing users for [{}] with identity [{}]".format(
                    options["domain"], identity.user.email
                )
            )
        )

        has_more = True
        page_token = None
        while has_more:
            results = requests.get(
                "https://www.googleapis.com/admin/directory/v1/users",
                params={"domain": options["domain"], "pageToken": page_token},
                headers={
                    "Authorization": "Bearer {}".format(identity.config["access_token"])
                },
            )
            data = results.json()
            for row in data["users"]:
                # TODO(dcramer): we should couple these to identity..
                with transaction.atomic():
                    user = self.get_user(
                        email=row["primaryEmail"], name=row["name"]["fullName"]
                    )
                    profile, _ = Profile.objects.get_or_create(user=user)

                    user_fields = {}
                    profile_fields = {}

                    # if the account is not active, suspend them
                    if row["suspended"]:
                        user_fields["is_active"] = False

                    if row["name"]["fullName"] != user.name:
                        user_fields["name"] = row["name"]["fullName"]

                    # 'organizations': [{'title': 'Chief Executive Officer', 'primary': True, 'customType': '', 'department': 'G&A', 'description': 'Executive'}]
                    if row.get("organizations") and row["organizations"][0]:
                        org = row["organizations"][0]
                        if org["title"] != profile.title:
                            profile_fields["title"] = org["title"]
                    else:
                        profile_fields["title"] = None

                    # 'relations': [{'value': 'david@sentry.io', 'type': 'manager'}]
                    if row.get("relations"):
                        profile_fields["reports_to"] = None
                        for relation in row["relations"]:
                            if relation["type"] == "manager":
                                reports_to = self.get_user(email=relation["value"])
                                if profile.reports_to_id != reports_to.id:
                                    profile_fields["reports_to"] = reports_to

                    # 'locations': [{'type': 'desk', 'area': 'desk', 'buildingId': 'SFO'}]
                    if row.get("locations"):
                        profile_fields["office"] = None
                        for location in row["locations"]:
                            if location["type"] == "desk":
                                office = self.get_office(location["buildingId"])
                                if profile.office_id != office.id:
                                    profile_fields["office"] = office

                    if user_fields:
                        self.stdout.write(
                            self.style.MIGRATE_LABEL(
                                "  Updated user [{}]".format(user.email)
                            )
                        )
                        User.objects.filter(id=user.id).update(**user_fields)
                    if profile_fields:
                        self.stdout.write(
                            self.style.MIGRATE_LABEL(
                                "  Updated profile [{}]".format(user.email)
                            )
                        )
                        Profile.objects.filter(id=profile.id).update(**profile_fields)
            page_token = data.get("nextPageToken")
            has_more = bool(page_token)
