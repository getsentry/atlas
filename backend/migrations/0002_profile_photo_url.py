# Generated by Django 2.1.4 on 2019-06-04 02:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [("backend", "0001_initial")]

    operations = [
        migrations.AddField(
            model_name="profile", name="photo_url", field=models.URLField(null=True)
        )
    ]