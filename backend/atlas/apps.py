from django.apps import AppConfig


class AppConfig(AppConfig):
    name = "atlas"
    verbose_name = "atlas-backend"

    def ready(self):
        pass
