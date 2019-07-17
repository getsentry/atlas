from uuid import uuid4

from django.conf import settings
from django.contrib.postgres.fields import JSONField
from django.db import models


class Profile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    # a handle is what a person "Goes by" - its like a username but irl
    handle = models.TextField(null=True)
    date_of_birth = models.DateField(null=True)
    date_started = models.DateField(null=True)
    title = models.TextField(null=True)
    reports_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        on_delete=models.SET_NULL,
        related_name="reports",
    )
    office = models.ForeignKey(
        "atlas.Office", null=True, on_delete=models.SET_NULL, related_name="profiles"
    )
    department = models.TextField(null=True)
    primary_phone = models.TextField(null=True)
    config = JSONField(default=dict)
    is_human = models.BooleanField(default=True)

    class Meta:
        db_table = "profile"
