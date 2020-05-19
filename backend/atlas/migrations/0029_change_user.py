# Generated by Django 2.2.5 on 2020-05-19 20:03

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [("atlas", "0028_auto_20200519_1746")]

    operations = [
        migrations.AddField(
            model_name="change",
            name="user",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.DO_NOTHING,
                to=settings.AUTH_USER_MODEL,
            ),
        )
    ]