# Generated by Django 5.1.4 on 2025-01-01 06:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('filemanager', '0002_rename_uploaded_at_file_upload_date_file_is_public_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='file',
            name='uploaded_by',
        ),
        migrations.AlterField(
            model_name='file',
            name='is_public',
            field=models.BooleanField(default=True),
        ),
    ]
