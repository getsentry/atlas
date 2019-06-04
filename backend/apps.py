from django.apps import AppConfig
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured


class AppConfig(AppConfig):
    name = "backend"
    verbose_name = "atlas-backend"

    def ready(self):
        if not settings.GOOGLE_CLIENT_ID:
            raise ImproperlyConfigured("You have not configured GOOGLE_CLIENT_ID.")
        if not settings.GOOGLE_CLIENT_SECRET:
            raise ImproperlyConfigured("You have not configured GOOGLE_CLIENT_SECRET.")
