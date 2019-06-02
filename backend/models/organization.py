from uuid import uuid4

from django.db import models


class Organization(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    name = models.TextField()

    class Meta:
        db_table = "organization"
