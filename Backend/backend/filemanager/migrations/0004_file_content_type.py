# Generated by Django 5.1.4 on 2025-01-01 09:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('filemanager', '0003_remove_file_uploaded_by_alter_file_is_public'),
    ]

    operations = [
        migrations.AddField(
            model_name='file',
            name='content_type',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]