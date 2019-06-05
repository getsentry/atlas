from django.core.management.base import BaseCommand

from backend.utils import google


class Command(BaseCommand):
    help = "Synchronize users from Google"

    def add_arguments(self, parser):
        parser.add_argument("domain", type=str)

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

        google.sync_domain(identity, domain)
