from uuid import uuid4

from django.conf import settings
from django.db import models


class Identity(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    provider = models.CharField(max_length=32)
    external_id = models.CharField(max_length=32)

    class Meta:
        db_table = "identity"
        unique_together = (("provider", "external_id"),)
