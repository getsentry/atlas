from django.conf import settings
from django.contrib.staticfiles.management.commands.runserver import (
    Command as BaseCommand,
)


class Command(BaseCommand):
    def execute(self, *args, **options):
        settings.DEBUG = True
        return super().execute(*args, **options)
