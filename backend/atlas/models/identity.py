from uuid import uuid4

from django.conf import settings
from django.contrib.postgres.fields import ArrayField, JSONField
from django.db import models


class Identity(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    provider = models.CharField(max_length=32)
    external_id = models.CharField(max_length=32)
    config = JSONField(default=dict)
    scopes = ArrayField(models.CharField(max_length=32), default=list)
    is_active = models.BooleanField(default=False)
    access_token = models.TextField(null=True)
    refresh_token = models.TextField(null=True)
    is_admin = models.BooleanField(default=False)

    class Meta:
        db_table = "identity"
        unique_together = (("provider", "external_id"),)
