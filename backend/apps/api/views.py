
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db import connection
from django.conf import settings
import os

from .models import Publication, DataType, FileUpload

class PublicationList(APIView):
    def get(self, request):
        # Fetch publications from the database instead of using hardcoded data
        publications = Publication.objects.all().values('id', 'title', 'author', 'year', 'citations')
        return Response(list(publications))

class DataTypesList(APIView):
    """
    API view to retrieve available data types from the database.
    """
    def get(self, request):
        # Get data types from the database table instead of using hardcoded values
        data_types = DataType.objects.all().values('id', 'name')
        return Response(list(data_types))

class FileUploadView(APIView):
    """
    API view to handle file uploads from authenticated users.
    Files will be associated with specific data types and users.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        file = request.FILES.get('file')
        data_type_id = request.data.get('dataType')
        description = request.data.get('description', '')
        
        if not file:
            return Response(
                {'error': 'No file provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        if not data_type_id:
            return Response(
                {'error': 'Data type is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Check if data type exists
        try:
            data_type = DataType.objects.get(id=data_type_id)
        except DataType.DoesNotExist:
            return Response(
                {'error': 'Invalid data type'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Define upload directory
        upload_dir = os.path.join(settings.MEDIA_ROOT, 'uploads', data_type_id)
        os.makedirs(upload_dir, exist_ok=True)
        
        # Save file to disk
        file_path = os.path.join(upload_dir, file.name)
        with open(file_path, 'wb+') as destination:
            for chunk in file.chunks():
                destination.write(chunk)
        
        # Save file metadata to database
        file_upload = FileUpload.objects.create(
            file_name=file.name,
            file_path=file_path,
            file_size=file.size,
            data_type=data_type,
            description=description,
            user=request.user
        )
        
        return Response({
            'message': 'File uploaded successfully',
            'file_name': file.name,
            'file_size': file.size,
            'data_type': data_type_id,
            'description': description
        }, status=status.HTTP_201_CREATED)
