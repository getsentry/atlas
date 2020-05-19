from celery import shared_task
from django.conf import settings

from atlas.models import User
from atlas.utils import google


@shared_task(name="atlas.tasks.sync_google")
def sync_google(domain=None):
    if domain is None:
        domain = settings.GOOGLE_DOMAIN

    identity = google.get_admin_identity()
    google.sync_domain(identity, domain)


@shared_task(name="atlas.tasks.update_profile")
def update_profile(user_id, updates, version=None):
    if not settings.GOOGLE_PUSH_UPDATES:
        return
    user = User.objects.get(id=user_id)
    identity = google.get_admin_identity()
    google.update_profile(identity, user, updates, version=version)
