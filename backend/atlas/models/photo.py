from uuid import uuid4

from django.conf import settings
from django.db import models


class Photo(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    data = models.BinaryField()
    width = models.PositiveIntegerField()
    height = models.PositiveIntegerField()
    mime_type = models.CharField(max_length=128)

    class Meta:
        db_table = "photo"
