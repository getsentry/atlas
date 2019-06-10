from django.conf import settings

if "django.contrib.staticfiles" in settings.INSTALLED_APPS:
    from django.contrib.staticfiles.management.commands.runserver import (
        Command as BaseCommand,
    )
else:
    from django.core.management.commands.runserver import Command as BaseCommand


class Command(BaseCommand):
    def execute(self, *args, **options):
        settings.DEBUG = True
