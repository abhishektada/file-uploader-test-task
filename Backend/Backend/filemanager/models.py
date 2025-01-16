import uuid
from django.db import models

class File(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    file = models.FileField(upload_to='uploads/')
    original_filename = models.CharField(max_length=255)
    upload_date = models.DateTimeField(auto_now_add=True)
    share_link = models.UUIDField(default=uuid.uuid4, editable=False)
    is_public = models.BooleanField(default=True)
    content_type = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return self.original_filename