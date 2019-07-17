from django.conf import settings
from django.core.management.base import BaseCommand

from atlas.utils import google


class Command(BaseCommand):
    help = "Synchronize users from Google"

    def add_arguments(self, parser):
        parser.add_argument("--domain", type=str, default=settings.GOOGLE_DOMAIN)
        parser.add_argument("--push", action="store_true", default=False)
        parser.add_argument("users", nargs="*", metavar="EMAIL")

    def handle(self, *args, **options):
        domain = options.get("domain")

        identity = google.get_admin_identity()
        self.stdout.write(
            self.style.MIGRATE_HEADING(
                "Synchronizing users for [{}] with identity [{}]".format(
                    domain, identity.user.email
                )
            )
        )

        if options["push"]:
            result = google.update_all_profiles(identity, users=options["users"])
        else:
            result = google.sync_domain(identity, domain, users=options["users"])
        self.stdout.write(
            self.style.MIGRATE_HEADING(
                "{} users synchronized ({} created; {} updated)".format(
                    result.total_users, result.created_users, result.updated_users
                )
            )
        )
