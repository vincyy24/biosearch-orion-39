from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.http import HttpResponse
import pandas as pd
import io
from .models import DataCategory, DataType, FileUpload

# Create your views here.

class DataTypesListView(APIView):
    """
    API view to retrieve available data types from the database.
    """
    def get(self, request):
        data_types = DataType.objects.all().values('id', 'name')
        return Response(list(data_types))

class DataCategoriesListView(APIView):
    """
    API view to retrieve available data categories from the database.
    """
    def get(self, request):
        categories = DataCategory.objects.all().values('id', 'name', 'description')
        print("categories", list(categories))
        return Response(list(categories))

class FileUploadView(APIView):
    """
    API view to handle file uploads from authenticated users.
    Files will be parsed and stored as text in the database.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, project_id):
        file = request.FILES.get('file')
        data_type_id = request.data.get('dataType')
        description = request.data.get('description', '')
        access_level = request.data.get('accessLevel', 'private')
        category_id = request.data.get('category', None)
        method = request.data.get('method', '')
        electrode_type = request.data.get('electrodeType', '')
        instrument = request.data.get('instrument', '')
        delimiter = request.data.get('delimiter', ',')
        project_id = project_id
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
            
        try:
            data_type = DataType.objects.get(id=data_type_id)
        except DataType.DoesNotExist:
            return Response(
                {'error': 'Invalid data type'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        category = None
        if category_id:
            try:
                category = DataCategory.objects.get(id=category_id)
            except DataCategory.DoesNotExist:
                return Response(
                    {'error': 'Invalid category'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        try:
            # Read and parse the file content
            content = file.read().decode('utf-8')
            
            # Store the file metadata and content in the database
            file_upload = FileUpload.objects.create(
                file_name=file.name,
                file_content=content,  # Store as text
                file_size=file.size,
                data_type=data_type,
                description=description,
                user=request.user,
                is_public=(access_level == 'public'),
                category=category,
                method=method,
                electrode_type=electrode_type,
                instrument=instrument,
                delimiter=delimiter
            )
            
            return Response({
                'message': 'File uploaded successfully',
                'id': file_upload.id,
                'file_name': file.name,
                'file_size': file.size,
                'data_type': data_type_id,
                'description': description,
                'access_level': access_level,
                'category': category.name if category else None,
                'method': method,
                'electrode_type': electrode_type,
                'instrument': instrument
            }, status=status.HTTP_201_CREATED)
            
        except UnicodeDecodeError:
            return Response(
                {'error': 'File is not in a valid text format'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class DownloadView(APIView):
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
