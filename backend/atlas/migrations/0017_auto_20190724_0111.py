# Generated by Django 2.2.2 on 2019-07-24 01:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [("atlas", "0016_auto_20190724_0104")]

    operations = [
        migrations.AddField(
            model_name="profile", name="nintendo", field=models.TextField(null=True)
        ),
        migrations.AddField(
            model_name="profile", name="playstation", field=models.TextField(null=True)
        ),
        migrations.AddField(
            model_name="profile", name="steam", field=models.TextField(null=True)
        ),
        migrations.AddField(
            model_name="profile", name="xbox", field=models.TextField(null=True)
        ),
    ]
