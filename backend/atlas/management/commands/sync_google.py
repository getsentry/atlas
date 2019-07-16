from django.conf import settings
from django.core.management.base import BaseCommand

from atlas.utils import google


class Command(BaseCommand):
    help = "Synchronize users from Google"

    def add_arguments(self, parser):
        parser.add_argument(
            "domain", type=str, default=settings.GOOGLE_DOMAIN, nargs="?"
        )

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

        result = google.sync_domain(identity, domain)
        self.stdout.write(
            self.style.MIGRATE_HEADING(
                "{} users synchronized ({} created; {} updated)".format(
                    result.total_users, result.created_users, result.updated_users
                )
            )
        )
