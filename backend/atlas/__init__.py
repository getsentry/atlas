__all__ = ("celery_app",)

from .celery import app as celery_app

default_app_config = "atlas.apps.AppConfig"
