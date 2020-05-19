from uuid import UUID, uuid4

from django.conf import settings
from django.contrib.postgres.fields import JSONField
from django.db import models


class Change(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    object_type = models.CharField(
        choices=(("user", "user"), ("office", "office")), max_length=32
    )
    object_id = models.UUIDField()

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.DO_NOTHING, null=True
    )
    changes = JSONField()
    version = models.PositiveIntegerField()

    class Meta:
        unique_together = (("object_type", "object_id", "version"),)

    @classmethod
    def record(cls, object_type, object_id, changes, user=None):
        s_changes = {}
        for key, value in changes.items():
            if isinstance(value, models.Model):
                s_changes[key] = value.pk
            elif isinstance(value, UUID):
                s_changes[key] = str(value)
            else:
                s_changes[key] = value

        # TODO(dcramer): version here isnt atomic, but it has a constraint so it'll error out
        return cls.objects.create(
            object_type=object_type,
            object_id=object_id,
            changes=s_changes,
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
