# Generated by Django 2.2.2 on 2019-07-17 21:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [("atlas", "0006_auto_20190717_0052")]

    operations = [
        migrations.AddField(
            model_name="office",
            name="external_id",
            field=models.CharField(max_length=64, null=True, unique=True),
        )
    ]
