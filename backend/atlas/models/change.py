from uuid import UUID, uuid4

from django.conf import settings
from django.contrib.postgres.fields import JSONField
from django.core.serializers.json import DjangoJSONEncoder
from django.db import models


class CustomJSONEncoder(DjangoJSONEncoder):
    def default(self, o):
        if isinstance(o, models.Model):
            return o.pk
        elif isinstance(o, UUID):
            return str(o)
        return super().default(o)


class Change(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    object_type = models.CharField(
        choices=(("user", "user"), ("office", "office"), ("department", "department")),
        max_length=32,
    )
    object_id = models.UUIDField()

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.DO_NOTHING, null=True
    )
    previous = JSONField(null=True, encoder=CustomJSONEncoder)
    changes = JSONField(encoder=CustomJSONEncoder)
    version = models.PositiveIntegerField()

    class Meta:
        unique_together = (("object_type", "object_id", "version"),)

    @classmethod
    def record(cls, instance, changes, user=None, previous=None):
        if previous is None:
            previous = {}
            for key, value in changes.items():
                previous[key] = getattr(instance, key)

        object_type = instance._meta.model_name.lower()
        object_id = instance.pk

        # TODO(dcramer): version here isnt atomic, but it has a constraint so it'll error out
        return cls.objects.create(
            object_type=object_type,
            object_id=object_id,
            changes=changes,
            previous=previous,
            user=user,
            version=(
                (
                    cls.objects.filter(
                        object_type=object_type, object_id=object_id
                    ).aggregate(v=models.Max("version"))["v"]
                    or 0
                )
                + 1
            ),
        )

    @classmethod
    def get_current_version(cls, object_type, object_id):
        return int(
            cls.objects.filter(object_type=object_type, object_id=object_id).aggregate(
                v=models.Max("version")
            )["v"]
            or 0
        )
