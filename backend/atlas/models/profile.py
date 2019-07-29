from uuid import uuid4

from django.conf import settings
from django.contrib.postgres.fields import ArrayField, JSONField
from django.db import models


class Profile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    # a handle is what a person "Goes by" - its like a username but irl
    pronouns = models.TextField(null=True)
    handle = models.TextField(null=True)
    date_of_birth = models.DateField(null=True)
    date_started = models.DateField(null=True)
    schedule = ArrayField(models.CharField(max_length=8, blank=True), size=7, null=True)
    title = models.TextField(null=True)
    bio = models.TextField(null=True)
    reports_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        on_delete=models.SET_NULL,
        related_name="reports",
    )
    office = models.ForeignKey(
        "atlas.Office", null=True, on_delete=models.SET_NULL, related_name="profiles"
    )
    department = models.TextField(null=True)
    primary_phone = models.TextField(null=True)
    linkedin = models.TextField(null=True)
    twitter = models.TextField(null=True)
    github = models.TextField(null=True)
    steam = models.TextField(null=True)
    xbox = models.TextField(null=True)
    playstation = models.TextField(null=True)
    nintendo = models.TextField(null=True)
    config = JSONField(default=dict)
    is_contractor = models.BooleanField(default=False)
    is_human = models.BooleanField(default=True)

    class Meta:
        db_table = "profile"
