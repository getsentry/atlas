# Generated by Django 2.2.2 on 2019-07-18 04:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [("atlas", "0014_auto_20190718_0353")]

    operations = [
        migrations.AddField(
            model_name="profile", name="pronouns", field=models.TextField(null=True)
        )
    ]
