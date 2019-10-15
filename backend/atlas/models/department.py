from uuid import uuid4

from django.contrib.postgres.fields import ArrayField
from django.db import models


class Department(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    # full materialized tree excluding self (all parents, in order)
    tree = ArrayField(models.UUIDField(), null=True, db_index=True)
    parent = models.ForeignKey("self", null=True, on_delete=models.CASCADE)
    name = models.CharField(max_length=64, unique=True)
    cost_center = models.PositiveIntegerField(null=True, unique=True)

    class Meta:
        db_table = "department"
        unique_together = (("parent", "name"),)
