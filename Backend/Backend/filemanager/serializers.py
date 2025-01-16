from rest_framework import serializers
from .models import File

class FileSerializer(serializers.ModelSerializer):
    download_url = serializers.SerializerMethodField()
    share_url = serializers.SerializerMethodField()

    class Meta:
        model = File
        fields = ['id', 'original_filename', 'upload_date', 'download_url', 'share_url', 'content_type']
        read_only_fields = ['id', 'upload_date', 'share_link']

    def get_download_url(self, obj):
        request = self.context.get('request')
        if request and obj.file:
            return request.build_absolute_uri(f'/api/files/{obj.id}/download/')
        return None

    def get_share_url(self, obj):
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(f'/api/files/share/{obj.share_link}/')
        return None 