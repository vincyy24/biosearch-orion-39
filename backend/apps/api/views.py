from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db import connection
from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
import os
import json
import pandas as pd
import io
from django.http import HttpResponse
from wsgiref.util import FileWrapper

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

class LoginView(APIView):
    """
    API view to handle user authentication.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        username = request.data.get('email')
        password = request.data.get('password')
        
        if not username or not password:
            return Response(
                {'error': 'Email and password are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user exists with provided email
        try:
            user = User.objects.get(email=username)
            username = user.username  # Use username for authentication
        except User.DoesNotExist:
            return Response(
                {'error': 'Invalid email or password'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Authenticate user
        user = authenticate(username=username, password=password)
        
        if user:
            login(request, user)
            
            # Determine user role
            is_admin = user.is_staff or user.is_superuser
            
            return Response({
                'id': user.id,
                'email': user.email,
                'name': user.get_full_name() or user.username,
                'role': 'admin' if is_admin else 'user'
            })
        
        return Response(
            {'error': 'Invalid email or password'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

class SignupView(APIView):
    """
    API view to handle user registration.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        name = request.data.get('name')
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not name or not email or not password:
            return Response(
                {'error': 'Name, email and password are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if email already exists
        if User.objects.filter(email=email).exists():
            return Response(
                {'error': 'Email already exists'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create user
        try:
            # Generate username from email
            username = email.split('@')[0]
            base_username = username
            counter = 1
            
            # Ensure username is unique
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
            
            # Split name into first_name and last_name
            name_parts = name.split(' ', 1)
            first_name = name_parts[0]
            last_name = name_parts[1] if len(name_parts) > 1 else ''
            
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name
            )
            
            # Log user in
            login(request, user)
            
            return Response({
                'id': user.id,
                'email': user.email,
                'name': user.get_full_name() or user.username,
                'role': 'user'
            })
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class LogoutView(APIView):
    """
    API view to handle user logout.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        logout(request)
        return Response({'message': 'Logged out successfully'})

class PasswordResetRequestView(APIView):
    """
    API view to handle password reset requests.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        
        if not email:
            return Response(
                {'error': 'Email is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Don't reveal that the user doesn't exist for security
            return Response({'message': 'Password reset email sent if the account exists'})
        
        # Generate password reset token
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        # Password reset link - this should be the frontend URL
        # In a real app, this would come from your settings
        reset_link = f"http://localhost:5173/reset-password?uid={uid}&token={token}"
        
        # Send email with reset link
        # In development, this will print to console if email backend is not configured
        try:
            send_mail(
                'Password Reset Request',
                f'Please click the link to reset your password: {reset_link}',
                'noreply@biomediresearch.com',
                [email],
                fail_silently=False,
            )
        except Exception as e:
            print(f"Email would be sent to {email} with reset link: {reset_link}")
            # Don't return an error to prevent email enumeration
        
        return Response({'message': 'Password reset email sent if the account exists'})

class PasswordResetConfirmView(APIView):
    """
    API view to handle password reset confirmation.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        uid = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('password')
        
        if not uid or not token or not new_password:
            return Response(
                {'error': 'UID, token and new password are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Decode user ID
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
            
            # Check if token is valid
            if not default_token_generator.check_token(user, token):
                return Response(
                    {'error': 'Invalid or expired token'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Set new password
            user.set_password(new_password)
            user.save()
            
            return Response({'message': 'Password reset successful'})
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response(
                {'error': 'Invalid user ID or token'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

class UserProfileView(APIView):
    """
    API view to get and update user profile information.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        return Response({
            'id': user.id,
            'email': user.email,
            'name': user.get_full_name() or user.username,
            'role': 'admin' if user.is_staff else 'user'
        })
    
    def patch(self, request):
        user = request.user
        name = request.data.get('name')
        
        if name:
            # Split name into first_name and last_name
            name_parts = name.split(' ', 1)
            first_name = name_parts[0]
            last_name = name_parts[1] if len(name_parts) > 1 else ''
            
            user.first_name = first_name
            user.last_name = last_name
            user.save()
        
        return Response({
            'id': user.id,
            'email': user.email,
            'name': user.get_full_name() or user.username,
            'role': 'admin' if user.is_staff else 'user'
        })

class SearchView(APIView):
    """
    API view to handle search queries.
    """
    def get(self, request):
        query = request.query_params.get('query', '')
        
        if not query:
            return Response({'error': 'Search query is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Search in publications
        publications = Publication.objects.filter(
            title__icontains=query
        ).values('id', 'title', 'author', 'year', 'citations')
        
        # In a real app, we would search in other models as well
        # Example of filterable search
        data_type = request.query_params.get('data_type', None)
        year_from = request.query_params.get('year_from', None)
        year_to = request.query_params.get('year_to', None)
        
        # Apply filters to publications
        if year_from and year_from.isdigit():
            publications = publications.filter(year__gte=int(year_from))
        
        if year_to and year_to.isdigit():
            publications = publications.filter(year__lte=int(year_to))
        
        # Example of mock results for other types
        # In production, these would come from actual database queries
        results = {
            'publications': list(publications),
            'datasets': [
                {
                    'id': 'dataset-1',
                    'title': f'Dataset containing "{query}"',
                    'description': 'Sample dataset description',
                    'year': 2023,
                    'type': 'dataset'
                }
            ],
            'tools': [
                {
                    'id': 'tool-1',
                    'title': f'Analysis tool for "{query}"',
                    'description': 'Sample tool description',
                    'year': 2022,
                    'type': 'tool'
                }
            ],
            'genes': [
                {
                    'id': 'gene-1',
                    'title': f'Gene related to "{query}"',
                    'description': 'Sample gene description',
                    'type': 'gene'
                }
            ]
        }
        
        return Response(results)

class DownloadView(APIView):
    """
    API view to handle file downloads.
    """
    def get(self, request):
        dataset = request.query_params.get('dataset')
        file_format = request.query_params.get('format', 'csv')
        
        if not dataset:
            return Response({'error': 'Dataset is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        if file_format not in ['csv', 'excel']:
            return Response({'error': 'Invalid format'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # In a real app, fetch actual data based on the dataset ID
            # For now, generate sample data
            data = self.generate_sample_data(dataset)
            
            # Create appropriate file format
            if file_format == 'csv':
                # Create CSV file
                response = HttpResponse(content_type='text/csv')
                response['Content-Disposition'] = f'attachment; filename="{dataset}.csv"'
                
                # Convert data to CSV
                df = pd.DataFrame(data)
                df.to_csv(path_or_buf=response, index=False)
                
                return response
                
            elif file_format == 'excel':
                # Create Excel file
                response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
                response['Content-Disposition'] = f'attachment; filename="{dataset}.xlsx"'
                
                # Convert data to Excel
                df = pd.DataFrame(data)
                with io.BytesIO() as output:
                    with pd.ExcelWriter(output, engine='openpyxl') as writer:
                        df.to_excel(writer, index=False)
                    response.write(output.getvalue())
                
                return response
                
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def generate_sample_data(self, dataset_id):
        """Generate sample data for demonstration purposes."""
        if 'voltammetry' in dataset_id.lower():
            # Generate voltammetry data
            import numpy as np
            # Sample cyclic voltammetry data
            potential = np.linspace(-0.5, 0.5, 100).tolist()
            current = np.sin(potential).tolist()
            time_us = np.linspace(0, 1000, 100).tolist()
            
            data = {
                'Potential (V)': potential,
                'Current (mA)': current,
                'Time (μs)': time_us
            }
            return data
        else:
            # Generate generic research data
            return {
                'Sample ID': [f'S{i:03d}' for i in range(1, 101)],
                'Value': [i * 1.5 for i in range(1, 101)],
                'Category': ['A' if i % 3 == 0 else 'B' if i % 3 == 1 else 'C' for i in range(1, 101)]
            }

class VoltammetryDataView(APIView):
    """
    API view to handle voltammetry data.
    """
    def get(self, request, experiment_id=None):
        from apps.dashboard.models import VoltammetryData
        
        if experiment_id:
            # Get specific experiment
            try:
                experiment = VoltammetryData.objects.get(experiment_id=experiment_id)
                return Response({
                    'id': experiment.experiment_id,
                    'title': experiment.title,
                    'description': experiment.description,
                    'experiment_type': experiment.experiment_type,
                    'scan_rate': experiment.scan_rate,
                    'electrode_material': experiment.electrode_material,
                    'electrolyte': experiment.electrolyte,
                    'temperature': experiment.temperature,
                    'data_points': experiment.data_points,
                    'peak_anodic_current': experiment.peak_anodic_current,
                    'peak_cathodic_current': experiment.peak_cathodic_current,
                    'peak_anodic_potential': experiment.peak_anodic_potential,
                    'peak_cathodic_potential': experiment.peak_cathodic_potential,
                })
            except VoltammetryData.DoesNotExist:
                return Response({'error': 'Experiment not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            # List all experiments
            experiments = VoltammetryData.objects.all().values(
                'experiment_id', 'title', 'experiment_type', 'date_created'
            )
            return Response(list(experiments))
