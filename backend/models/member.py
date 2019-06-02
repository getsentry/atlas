from uuid import uuid4

from django.conf import settings
from django.db import models


class Member(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    organization = models.ForeignKey("backend.Organization", on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    joined_at = models.DateField(null=True)
    reports_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        on_delete=models.SET_NULL,
        related_name="reports",
    )

    class Meta:
        db_table = "member"
        unique_together = (("organization", "user"),)
