from uuid import uuid4

from django.conf import settings
from django.db import models


class Profile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    dob = models.DateField(null=True)
    joined_at = models.DateField(null=True)
    title = models.TextField(null=True)
    reports_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        on_delete=models.SET_NULL,
        related_name="reports",
    )
    office = models.ForeignKey("backend.Office", null=True, on_delete=models.SET_NULL)

    class Meta:
        db_table = "profile"
