# Generated by Django 4.2.7 on 2023-11-27 16:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('apts', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='apartment',
            name='LINK',
            field=models.CharField(blank=True, max_length=256),
        ),
    ]