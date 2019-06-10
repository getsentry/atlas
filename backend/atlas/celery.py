import os

from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "atlas.settings")

app = Celery("atlas")

app.config_from_object("django.conf:settings", namespace="CELERY")
