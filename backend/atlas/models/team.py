from uuid import uuid4

from django.db import models


class TeamManager(models.Manager):
    def get_by_natural_key(self, name):
        return self.get(name=name)

    def get_or_create_by_natural_key(self, name):
        return self.get_or_create(name=name)


class Team(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    name = models.CharField(max_length=64, unique=True)
    description = models.TextField(null=True)

    objects = TeamManager()

    class Meta:
        db_table = "team"

    def natural_key(self):
        return [self.name]
