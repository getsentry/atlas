from typing import Optional
from uuid import UUID, uuid4

from django.contrib.postgres.fields import ArrayField
from django.db import models


class DepartmentManager(models.Manager):
    def get_by_natural_key(self, cost_center: Optional[str], name: str):
        try:
            UUID(name)
        except ValueError:
            name_is_id = False
        else:
            name_is_id = True

        if cost_center:
            return self.get(cost_center=cost_center)
        if name_is_id:
            return self.get(id=name)
        return self.get(name=name)

    def get_or_create_by_natural_key(self, cost_center: Optional[int], name: str):
        if cost_center:
            cost_center = int(cost_center)
        try:
            inst, created = self.get_by_natural_key(cost_center, name), False
        except self.model.DoesNotExist:
            inst, created = self.create(name=name, cost_center=cost_center), True

        if not created:
            fields = []
            # we only override the name if cost_center is empty or the name is empty
            if inst.name != name and (not cost_center or not inst.name):
                inst.name = name
                fields.append("name")

            if inst.cost_center != cost_center and cost_center:
                inst.cost_center = cost_center
                fields.append("cost_center")

            if fields:
                inst.save(update_fields=fields)
        return inst, created


class Department(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    # full materialized tree excluding self (all parents, in order)
    tree = ArrayField(models.UUIDField(), null=True, db_index=True)
    parent = models.ForeignKey("self", null=True, on_delete=models.CASCADE)
    name = models.CharField(max_length=64, unique=True)
    cost_center = models.PositiveIntegerField(null=True, unique=True)

    objects = DepartmentManager()

    class Meta:
        db_table = "department"
        unique_together = (("parent", "name"),)

    def natural_key(self):
        return [self.cost_center, self.name]
