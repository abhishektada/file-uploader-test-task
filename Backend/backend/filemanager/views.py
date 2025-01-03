from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.http import FileResponse
from .models import File
from .serializers import FileSerializer
from rest_framework import serializers
import mimetypes
from rest_framework.pagination import PageNumberPagination

class FileViewSet(viewsets.ModelViewSet):
    pagination_class = PageNumberPagination
    page_size = 12
    
    def get_queryset(self):
        return File.objects.all().order_by('-upload_date')
    queryset = File.objects.all()
    serializer_class = FileSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        file_obj = self.request.FILES.get('file')
        if not file_obj:
            raise serializers.ValidationError({'file': 'No file was submitted'})
        
        # Use mimetypes to get the content type
        content_type = mimetypes.guess_type(file_obj.name)[0] or 'application/octet-stream'
        
        serializer.save(
            file=file_obj,
            original_filename=file_obj.name,
            content_type=content_type
        )

    @action(detail=True, methods=['post'])
    def toggle_public(self, request, pk=None):
        file = self.get_object()
        file.is_public = not file.is_public
        file.save()
        return Response({'status': 'success', 'is_public': file.is_public})

    @action(detail=False, methods=['get'])
    def share(self, request, share_link=None):
        file = get_object_or_404(File, share_link=share_link)
        
        # Check if file exists and is accessible
        if not file.file:
            return Response(
                {'error': 'File not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

        # Return file details if it's a regular GET request
        serializer = self.get_serializer(file)
        return Response(serializer.data)
