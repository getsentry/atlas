from celery import shared_task
from django.conf import settings

from atlas.utils import google


@shared_task(name="atlas.tasks.sync_google")
def sync_google(domain=None):
    if domain is None:
        domain = settings.GOOGLE_DOMAIN

    identity = google.get_admin_identity()
    google.sync_domain(identity, domain)
