# Generated by Django 2.1.4 on 2019-06-04 04:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [("backend", "0002_profile_photo_url")]

    operations = [
        migrations.AddField(
            model_name="identity",
            name="is_active",
            field=models.BooleanField(default=False),
        )
    ]
