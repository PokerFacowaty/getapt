# Generated by Django 4.2.7 on 2023-12-03 23:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('apts', '0006_apartment_attributes'),
    ]

    operations = [
        migrations.AlterField(
            model_name='attribute',
            name='NAME',
            field=models.CharField(max_length=50),
        ),
    ]
