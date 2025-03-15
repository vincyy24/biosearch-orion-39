
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db import connection

class PublicationList(APIView):
    def get(self, request):
        # Mock data - replace with database query later
        publications = [
            {"id": 1, "title": "Advancements in Genomic Research", "author": "Dr. Jane Smith", "year": 2023, "citations": 45},
            {"id": 2, "title": "Clinical Applications of CRISPR", "author": "Dr. John Doe", "year": 2022, "citations": 78},
            {"id": 3, "title": "New Frontiers in Cancer Treatment", "author": "Dr. Sarah Johnson", "year": 2023, "citations": 32},
            {"id": 4, "title": "Biomarkers for Early Disease Detection", "author": "Dr. Michael Chen", "year": 2021, "citations": 102},
            {"id": 5, "title": "Machine Learning in Drug Discovery", "author": "Dr. Emily Brown", "year": 2022, "citations": 64}
        ]
        return Response(publications)

class DataTypesList(APIView):
    """
    API view to dynamically retrieve available data types from the database.
    This allows the frontend to show filter options based on actual database tables.
    """
    def get(self, request):
        # Get a list of database tables dynamically
        # In a real application, you might want to filter this list
        # to include only certain tables or model-backed tables
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT name FROM sqlite_master 
                WHERE type='table' 
                AND name NOT LIKE 'sqlite_%'
                AND name NOT LIKE 'auth_%'
                AND name NOT LIKE 'django_%'
            """)
            tables = cursor.fetchall()
        
        # Process table names to create a user-friendly format
        data_types = []
        for table in tables:
            table_name = table[0]
            
            # Skip migration tables and other Django internal tables
            if table_name == 'django_migrations' or table_name == 'django_content_type':
                continue
                
            # Convert snake_case to Title Case and format for display
            display_name = ' '.join(word.capitalize() for word in table_name.split('_'))
            
            data_types.append({
                'id': table_name,
                'name': display_name
            })
            
        # Add a few mock data types for demonstration
        if not data_types:
            data_types = [
                {'id': 'protein', 'name': 'Protein'},
                {'id': 'genome', 'name': 'Genome'},
                {'id': 'pathway', 'name': 'Pathway'},
                {'id': 'dataset', 'name': 'Dataset'},
                {'id': 'voltammetry', 'name': 'Voltammetry Data'}
            ]
            
        return Response(data_types)

class FileUploadView(APIView):
    """
    API view to handle file uploads from authenticated users.
    Files will be associated with specific data types and users.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # In a real application, you would:
        # 1. Validate the uploaded file type and size
        # 2. Process the file according to its data type
        # 3. Store the file metadata in the database
        # 4. Store the file itself in a file storage system
        
        file = request.FILES.get('file')
        data_type = request.data.get('dataType')
        description = request.data.get('description', '')
        
        if not file:
            return Response(
                {'error': 'No file provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        if not data_type:
            return Response(
                {'error': 'Data type is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Process the file (mock processing for now)
        # In a real application, you would save the file and its metadata
        
        return Response({
            'message': 'File uploaded successfully',
            'file_name': file.name,
            'file_size': file.size,
            'data_type': data_type,
            'description': description
        }, status=status.HTTP_201_CREATED)
