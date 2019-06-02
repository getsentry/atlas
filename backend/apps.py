from django.apps import AppConfig


class AppConfig(AppConfig):
    name = "backend"
    verbose_name = "atlas-backend"

    def ready(self):
        pass
