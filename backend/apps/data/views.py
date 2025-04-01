from django.http import HttpResponse
from rest_framework import serializers
from rest_framework import status
from rest_framework.generics import ListAPIView, CreateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
import io
import pandas as pd

from .models import DataCategory, DataType, FileUpload
from .serializers import DataCategorySerializer, DataTypeSerializer, FileUploadSerializer

class DataTypeListView(ListAPIView):
    """
    API view to retrieve list of DataTypes.
    """
    queryset = DataType.objects.all()
    serializer_class = DataTypeSerializer


class DataCategoriesListView(ListAPIView):
    """
    API view to retrieve available data categories from the database.
    """
    queryset = DataCategory.objects.all()
    serializer_class = DataCategorySerializer

class FileUploadCreateView(CreateAPIView):
    """
    API view to handle file uploads from authenticated users.
    Files will be parsed and stored as text in the database.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = FileUploadSerializer

    def perform_create(self, serializer):
        # Custom file handling logic before saving
        file = self.request.FILES.get('file')
        if not file:
            raise serializers.ValidationError({'error': 'No file provided'})

        data_type_id = self.request.data.get('dataType')
        try:
            data_type = DataType.objects.get(id=data_type_id)
        except DataType.DoesNotExist:
            raise serializers.ValidationError({'error': 'Invalid data type'})

        category_id = self.request.data.get('category', None)
        category = None
        if category_id:
            try:
                category = DataCategory.objects.get(id=category_id)
            except DataCategory.DoesNotExist:
                raise serializers.ValidationError({'error': 'Invalid category'})

        # Read and store file content
        content = file.read().decode('utf-8')

        # Save file as a new upload record
        file_upload = serializer.save(
            file_name=file.name,
            content=content,  # Store as text
            file_size=file.size,
            uploaded_by=self.request.user,
            data_type=data_type,
            category=category
        )

        return Response({
            'message': 'File uploaded successfully',
            'id': file_upload.id,
            'file_name': file.name,
            'file_size': file.size,
            'data_type': data_type_id,
        }, status=status.HTTP_201_CREATED)


class DownloadView(ListAPIView):
    """
    API view to handle file downloads, converting stored text data to the requested format.
    """
    def get(self, request):
        dataset = request.query_params.get('dataset')
        file_format = request.query_params.get('format', 'csv')
        delimiter = request.query_params.get('delimiter', ',')  # For custom format
        
        if not dataset:
            return Response({'error': 'Dataset is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        if file_format not in ['csv', 'tsv', 'txt']:
            return Response({'error': 'Invalid format'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            file_upload = FileUpload.objects.get(id=dataset)
            
            is_public = file_upload.is_public
            is_owner = request.user.is_authenticated and request.user == file_upload.user
            is_staff = request.user.is_authenticated and request.user.is_staff
            
            if not (is_public or is_owner or is_staff):
                return Response(
                    {'error': 'Access denied: This dataset is private'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
                
            file_upload.downloads_count += 1
            file_upload.save()
            
            # Get the file content from the database
            content = file_upload.file_content
            
            if not content:
                return Response(
                    {'error': 'File content not found'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Process the content based on the original delimiter and requested format
            original_delimiter = file_upload.delimiter or ','
            
            try:
                # Parse the content as CSV
                df = pd.read_csv(io.StringIO(content), sep=original_delimiter)
                
                if file_format == 'csv':
                    output_delimiter = ','
                    content_type = 'text/csv'
                    file_ext = 'csv'
                elif file_format == 'tsv':
                    output_delimiter = '\t'
                    content_type = 'text/tab-separated-values'
                    file_ext = 'tsv'
                else:  # txt with custom delimiter
                    output_delimiter = delimiter
                    content_type = 'text/plain'
                    file_ext = 'txt'
                
                response = HttpResponse(content_type=content_type)
                response['Content-Disposition'] = f'attachment; filename="{file_upload.file_name}.{file_ext}"'
                
                if file_format == 'csv' or file_format == 'tsv' or file_format == 'txt':
                    df.to_csv(path_or_buf=response, sep=output_delimiter, index=False)
                
                return response
                
            except Exception as e:
                return Response(
                    {'error': f'Failed to convert file: {str(e)}'}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
                
        except FileUpload.DoesNotExist:
            return self._generate_sample_data(dataset, file_format, delimiter)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _generate_sample_data(self, dataset_id, file_format, delimiter):
        if 'voltammetry' in dataset_id.lower():
            import numpy as np
            potential = np.linspace(-0.5, 0.5, 100).tolist()
            current = np.sin(potential).tolist()
            time_us = np.linspace(0, 1000, 100).tolist()
            
            data = {
                'Potential (V)': potential,
                'Current (mA)': current,
                'Time (μs)': time_us
            }
        else:
            data = {
                'Sample ID': [f'S{i:03d}' for i in range(1, 101)],
                'Value': [i * 1.5 for i in range(1, 101)],
                'Category': ['A' if i % 3 == 0 else 'B' if i % 3 == 1 else 'C' for i in range(1, 101)]
            }
            
        if file_format == 'csv':
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="{dataset_id}.csv"'
            df = pd.DataFrame(data)
            df.to_csv(path_or_buf=response, index=False)
            return response
            
        elif file_format == 'excel':
            response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            response['Content-Disposition'] = f'attachment; filename="{dataset_id}.xlsx"'
            df = pd.DataFrame(data)
            with io.BytesIO() as output:
                with pd.ExcelWriter(output, engine='openpyxl') as writer:
                    df.to_excel(writer, index=False)
                response.write(output.getvalue())
            return response
