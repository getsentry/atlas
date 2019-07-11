from uuid import uuid4

from django.db import models


class OfficeManager(models.Manager):
    def get_by_natural_key(self, name):
        return self.get(name=name)


class Office(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    name = models.CharField(max_length=64, unique=True)
    location = models.TextField(null=True)
    lat = models.DecimalField(max_digits=9, decimal_places=6, null=True)
    lng = models.DecimalField(max_digits=9, decimal_places=6, null=True)

    objects = OfficeManager()

    class Meta:
        db_table = "office"

    def natural_key(self):
        return [self.name]
