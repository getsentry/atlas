# Generated by Django 2.1.4 on 2019-06-04 19:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [("backend", "0005_identity_is_admin")]

    operations = [
        migrations.AddField(
            model_name="identity",
            name="access_token",
            field=models.TextField(null=True),
        ),
        migrations.AddField(
            model_name="identity",
            name="refresh_token",
            field=models.TextField(null=True),
        ),
    ]
