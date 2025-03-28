from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
import os
import pandas as pd
import io
from django.http import HttpResponse
from wsgiref.util import FileWrapper
from django.middleware.csrf import get_token

from .models import Publication, DataType, FileUpload, DataCategory
from apps.api import models

class CSRFTokenView(APIView):
    """
    API view to provide CSRF token
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        csrf_token = get_token(request)
        return Response({'csrf_token': csrf_token})

class PublicationList(APIView):
    def get(self, request):
        publication_id = request.data.get("publication_id")
    
        if publication_id:
            try:

                publication = Publication.objects.get(id=publication_id)
                return Response({
                'id': publication.id,
                'title': publication.title,
                'author': publication.author,
                'year': publication.year,
                'citations': publication.citations
            })
            except Publication.DoesNotExist:
                return Response({'error': 'Publication not found'}, status=status.HTTP_404_NOT_FOUND)
        publications = Publication.objects.all().values('id', 'title', 'author', 'year', 'citations')
        return Response(list(publications))

class DataTypesList(APIView):
    """
    API view to retrieve available data types from the database.
    """
    def get(self, request):
        data_types = DataType.objects.all().values('id', 'name')
        return Response(list(data_types))

class DataCategoriesList(APIView):
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
    Files will be associated with specific data types and users.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        file = request.FILES.get('file')
        data_type_id = request.data.get('dataType')
        description = request.data.get('description', '')
        access_level = request.data.get('accessLevel', 'private')  # Default to private
        category_id = request.data.get('category', None)
        method = request.data.get('method', '')
        electrode_type = request.data.get('electrodeType', '')
        instrument = request.data.get('instrument', '')
        
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
        
        upload_dir = os.path.join(settings.MEDIA_ROOT, 'uploads', data_type_id)
        os.makedirs(upload_dir, exist_ok=True)
        
        file_path = os.path.join(upload_dir, file.name)
        with open(file_path, 'wb+') as destination:
            for chunk in file.chunks():
                destination.write(chunk)
        
        file_upload = FileUpload.objects.create(
            file_name=file.name,
            file_path=file_path,
            file_size=file.size,
            data_type=data_type,
            description=description,
            user=request.user,
            is_public=(access_level == 'public'),
            category=category,
            method=method,
            electrode_type=electrode_type,
            instrument=instrument
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

class LoginView(APIView):
    """
    API view to handle user authentication.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response(
                {'error': 'Email and password are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(email=email)
            username = user.username  # Use username for authentication
        except User.DoesNotExist:
            return Response(
                {'error': 'Invalid email or password'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        user = authenticate(username=username, password=password)
        
        if user:
            login(request, user)
            
            is_admin = user.is_staff or user.is_superuser
            
            return Response({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'name': user.get_full_name() or user.username,
                'role': 'admin' if is_admin else 'user'
            })
        
        return Response(
            {'error': 'Invalid email or password'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )

class SignupView(APIView):
    """
    API view to handle user registration.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        name = request.data.get('name', '')
        
        if not username or not email or not password:
            return Response(
                {'error': 'Username, email, and password are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if User.objects.filter(username=username).exists():
            return Response(
                {'error': 'Username already exists'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if User.objects.filter(email=email).exists():
            return Response(
                {'error': 'Email already exists'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password
            )
            
            if name:
                name_parts = name.split(' ', 1)
                user.first_name = name_parts[0]
                if len(name_parts) > 1:
                    user.last_name = name_parts[1]
                user.save()
            
            return Response({
                'message': 'User created successfully',
                'id': user.id,
                'username': user.username,
                'email': user.email
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class LogoutView(APIView):
    """
    API view to handle user logout.
    """
    permission_classes = [AllowAny]  # Changed from IsAuthenticated to allow anonymous users
    
    def post(self, request):
        # Check if user is authenticated before attempting to log them out
        if request.user.is_authenticated:
            logout(request)
            return Response({'message': 'Logged out successfully'})
        else:
            # If user is already logged out, just return success
            return Response({'message': 'No active session found'})

class PasswordResetRequestView(APIView):
    """
    API view to handle password reset requests.
    Sends email with reset token to user's email.
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
            
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            reset_url = f"{settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}"
            
            send_mail(
                'Password Reset Request',
                f'Click the following link to reset your password: {reset_url}',
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
            
            return Response({'message': 'Password reset email sent'})
            
        except User.DoesNotExist:
            return Response({'message': 'If the email exists in our system, a password reset link has been sent'})
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class PasswordResetConfirmView(APIView):
    """
    API view to handle password reset confirmation.
    Verifies token and updates user's password.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        uid = request.data.get('uid')
        token = request.data.get('token')
        password = request.data.get('password')
        
        if not uid or not token or not password:
            return Response(
                {'error': 'UID, token, and password are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
            
            if default_token_generator.check_token(user, token):
                user.set_password(password)
                user.save()
                return Response({'message': 'Password reset successful'})
            else:
                return Response(
                    {'error': 'Invalid or expired token'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except User.DoesNotExist:
            return Response(
                {'error': 'Invalid user'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UserProfileView(APIView):
    """
    API view to retrieve and update user profile information.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        is_admin = user.is_staff or user.is_superuser
        
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'name': user.get_full_name() or user.username,
            'role': 'admin' if is_admin else 'user'
        })
    
    def put(self, request):
        user = request.user
        
        name = request.data.get('name')
        
        if name:
            name_parts = name.split(' ', 1)
            user.first_name = name_parts[0]
            if len(name_parts) > 1:
                user.last_name = name_parts[1]
            user.save()
        
        is_admin = user.is_staff or user.is_superuser
        
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'name': user.get_full_name() or user.username,
            'role': 'admin' if is_admin else 'user'
        })

class SearchView(APIView):
    """
    API view to handle search queries.
    """
    def get(self, request):
        query = request.query_params.get('query', '')
        
        if not query:
            return Response({'error': 'Search query is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        is_authenticated = request.user.is_authenticated
        
        publications = Publication.objects.filter(
            title__icontains=query
        ).values('id', 'title', 'author', 'year', 'citations')
        
        data_type = request.query_params.get('data_type', None)
        category = request.query_params.get('category', None)
        year_from = request.query_params.get('year_from', None)
        year_to = request.query_params.get('year_to', None)
        
        if year_from and year_from.isdigit():
            publications = publications.filter(year__gte=int(year_from))
        
        if year_to and year_to.isdigit():
            publications = publications.filter(year__lte=int(year_to))
        
        file_uploads_query = FileUpload.objects.filter(
            file_name__icontains=query
        )
        
        if data_type:
            file_uploads_query = file_uploads_query.filter(data_type__id=data_type)
            
        if category:
            file_uploads_query = file_uploads_query.filter(category__name=category)
            
        if not is_authenticated:
            file_uploads_query = file_uploads_query.filter(is_public=True)
        elif not request.user.is_staff:
            file_uploads_query = file_uploads_query.filter(
                models.Q(is_public=True) | models.Q(user=request.user)
            )
        
        file_uploads = file_uploads_query.values(
            'id', 
            'file_name', 
            'data_type__name', 
            'description', 
            'upload_date',
            'is_public',
            'user__username',
            'category__name',
            'method',
            'electrode_type',
            'instrument',
            'downloads_count'
        )
        
        datasets = []
        for item in file_uploads:
            datasets.append({
                'id': item['id'],
                'title': item['file_name'],
                'description': item['description'],
                'category': item['data_type__name'],
                'dataCategory': item['category__name'],
                'access': 'public' if item['is_public'] else 'private',
                'author': item['user__username'],
                'date': item['upload_date'],
                'downloads': item['downloads_count'],
                'method': item['method'],
                'electrode': item['electrode_type'],
                'instrument': item['instrument'],
            })
        
        results = {
            'publications': list(publications),
            'datasets': datasets,
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
            file_upload = FileUpload.objects.get(id=dataset)
            
            is_public = file_upload.is_public
            is_owner = request.user.is_authenticated and request.user == file_upload.user
            is_staff = request.user.is_authenticated and request.user.is_staff
            
            if not (is_public or is_owner or is_staff):
                return Response(
                    {'error': 'Access denied: This dataset is private'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
                
            if not os.path.exists(file_upload.file_path):
                return Response(
                    {'error': 'File not found'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
                
            file_upload.downloads_count += 1
            file_upload.save()
                
            _, file_ext = os.path.splitext(file_upload.file_path)
            
            if file_ext.lower() in ['.csv', '.xlsx', '.xls']:
                with open(file_upload.file_path, 'rb') as file:
                    response = HttpResponse(
                        FileWrapper(file),
                        content_type='application/octet-stream'
                    )
                    response['Content-Disposition'] = f'attachment; filename="{file_upload.file_name}"'
                    return response
            
            try:
                if file_ext.lower() == '.csv':
                    df = pd.read_csv(file_upload.file_path)
                else:
                    df = pd.read_csv(file_upload.file_path, sep=None, engine='python')
                
                if file_format == 'csv':
                    response = HttpResponse(content_type='text/csv')
                    response['Content-Disposition'] = f'attachment; filename="{file_upload.file_name}.csv"'
                    df.to_csv(path_or_buf=response, index=False)
                    return response
                    
                elif file_format == 'excel':
                    response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
                    response['Content-Disposition'] = f'attachment; filename="{file_upload.file_name}.xlsx"'
                    with io.BytesIO() as output:
                        with pd.ExcelWriter(output, engine='openpyxl') as writer:
                            df.to_excel(writer, index=False)
                        response.write(output.getvalue())
                    return response
            
            except Exception as e:
                return Response(
                    {'error': f'Failed to convert file: {str(e)}'}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
                
        except FileUpload.DoesNotExist:
            return self._generate_sample_data(dataset, file_format)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _generate_sample_data(self, dataset_id, file_format):
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

class VoltammetryDataView(APIView):
    """
    API view to handle voltammetry data.
    """
    def get(self, request, experiment_id=None):
        from apps.dashboard.models import VoltammetryData
        
        if experiment_id:
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
            experiments = VoltammetryData.objects.all().values(
                'experiment_id', 'title', 'experiment_type', 'date_created'
            )
            return Response(list(experiments))

class RecentDatasetsView(APIView):
    """
    API view to get recent public datasets for the homepage.
    """
    def get(self, request):
        recent_datasets = FileUpload.objects.filter(
            is_public=True
        ).order_by('-upload_date')[:5]
        
        datasets = []
        for dataset in recent_datasets:
            datasets.append({
                'id': dataset.id,
                'title': dataset.file_name,
                'description': dataset.description,
                'category': dataset.data_type.name if dataset.data_type else "Unknown",
                'access': 'public',
                'author': dataset.user.username,
                'date': dataset.upload_date.isoformat(),
                'downloads': dataset.downloads_count,
                'method': dataset.method,
                'electrode': dataset.electrode_type,
                'instrument': dataset.instrument,
            })
        return Response(datasets)
