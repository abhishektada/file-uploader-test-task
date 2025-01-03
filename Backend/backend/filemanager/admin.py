from django.contrib import admin
from .models import File

@admin.register(File)
class FileAdmin(admin.ModelAdmin):
    list_display = ('original_filename', 'upload_date', 'is_public')
    list_filter = ('is_public', 'upload_date')
    search_fields = ('original_filename',)
