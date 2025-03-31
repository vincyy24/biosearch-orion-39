
import traceback
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

from .models import Publication, DataType, FileUpload, DataCategory, CollaborationInvite
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
    """
    API view to list and create publications
    """
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
        publications = Publication.objects.all().values('id', 'doi', 'title', 'author', 'year', 'citations', 'is_public')
        return Response(list(publications))
    
    def post(self, request):
        """
        Create a new publication
        """
        # Get data from request
        title = request.data.get('title')
        authors = request.data.get('authors')
        journal = request.data.get('journal')
        year = request.data.get('year')
        doi = request.data.get('doi')
        abstract = request.data.get('abstract')
        
        # Validate required fields
        if not title or not authors or not journal or not year:
            return Response(
                {'error': 'Title, authors, journal, and year are required fields'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Create the publication
            publication = Publication.objects.create(
                title=title,
                author=", ".join([author['name'] for author in authors]) if isinstance(authors, list) else authors,
                journal=journal,
                year=year,
                doi=doi or "",
                abstract=abstract or "",
                is_public=True,  # Default to public
                user=request.user if request.user.is_authenticated else None
            )
            
            return Response({
                'id': publication.id,
                'title': publication.title,
                'doi': publication.doi,
                'message': 'Publication created successfully'
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

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
            if not user.is_active:
                return Response(
                    {'error': 'Account is not verified. Please check your email for verification link.'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
                
            login(request, user)
            
            is_admin = user.is_staff or user.is_superuser
            
            return Response({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'name': user.get_full_name() or user.username,
                'role': 'admin' if is_admin else 'user'
            })
        
        print(traceback.format_exc())
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
            # Create inactive user until email verification
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                is_active=False  # User inactive until email verification
            )
            
            if name:
                name_parts = name.split(' ', 1)
                user.first_name = name_parts[0]
                if len(name_parts) > 1:
                    user.last_name = name_parts[1]
                user.save()
            
            # Generate verification token
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            # Build verification URL
            verification_url = f"{settings.FRONTEND_URL}/verify-email?uid={uid}&token={token}"
            
            # Send verification email
            send_mail(
                'Verify your email address',
                f'Please click the following link to verify your email: {verification_url}',
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
            
            # Check for pending collaboration invitations
            check_pending_invitations(email)
            
            return Response({
                'message': 'User created successfully. Please check your email for verification.',
                'id': user.id,
                'username': user.username,
                'email': user.email
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            print(traceback.format_exc())
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class EmailVerificationView(APIView):
    """
    API view to handle email verification.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        uid = request.data.get('uid')
        token = request.data.get('token')
        
        if not uid or not token:
            return Response(
                {'error': 'UID and token are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Decode the user ID
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
            
            # Verify token
            if default_token_generator.check_token(user, token):
                # Activate user
                user.is_active = True
                user.save()
                
                # Log user in
                login(request, user)
                
                is_admin = user.is_staff or user.is_superuser
                
                return Response({
                    'message': 'Email verified successfully',
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'name': user.get_full_name() or user.username,
                    'role': 'admin' if is_admin else 'user'
                })
            else:
                return Response(
                    {'error': 'Invalid or expired verification token'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
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

class UpdateUsernameView(APIView):
    """
    API view to update username.
    """
    permission_classes = [IsAuthenticated]
    
    def put(self, request):
        user = request.user
        username = request.data.get('username')
        
        if not username:
            return Response(
                {'error': 'Username is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if User.objects.filter(username=username).exclude(id=user.id).exists():
            return Response(
                {'error': 'Username already exists'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user.username = username
            user.save()
            
            return Response({
                'message': 'Username updated successfully',
                'username': user.username
            })
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UpdatePasswordView(APIView):
    """
    API view to update password.
    """
    permission_classes = [IsAuthenticated]
    
    def put(self, request):
        user = request.user
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        
        if not current_password or not new_password:
            return Response(
                {'error': 'Current password and new password are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not user.check_password(current_password):
            return Response(
                {'error': 'Current password is incorrect'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user.set_password(new_password)
            user.save()
            
            # Log user in again with new password
            user = authenticate(username=user.username, password=new_password)
            login(request, user)
            
            return Response({'message': 'Password updated successfully'})
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class DashboardSummaryView(APIView):
    """
    API view to retrieve dashboard summary data.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Implementation to retrieve dashboard summary data
        return Response({
            'datasets_count': 42,
            'recent_datasets': [],
            'publications_count': 18,
            'recent_publications': [],
            'projects_count': 7,
            'recent_projects': []
        })

class UserActivityView(APIView):
    """
    API view to retrieve user activity data.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Implementation to retrieve user activity data
        return Response({
            'activities': []
        })

class RecentExperimentsView(APIView):
    """
    API view to retrieve recent experiments.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Implementation to retrieve recent experiments
        return Response({
            'experiments': []
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

class VoltammetryRawDataView(APIView):
    """
    API view to retrieve raw voltammetry data.
    """
    def get(self, request, experiment_id):
        # Implementation to retrieve raw voltammetry data
        return Response({
            'data': []
        })

class VoltammetryPlotView(APIView):
    """
    API view to generate voltammetry plots.
    """
    def get(self, request, experiment_id):
        # Implementation to generate voltammetry plots
        return Response({
            'plot_data': {}
        })

class ExportDataView(APIView):
    """
    API view to export data in various formats.
    """
    def get(self, request):
        # Implementation to export data
        return Response({
            'export_url': ''
        })

class AdvancedSearchView(APIView):
    """
    API view to handle advanced search queries.
    """
    def get(self, request):
        # Implementation to handle advanced search queries
        return Response({
            'results': []
        })

class UserSearchView(APIView):
    """
    API view to search for users.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        query = request.query_params.get('query', '')
        
        if not query or len(query) < 2:
            return Response({'error': 'Search query must be at least 2 characters'}, status=status.HTTP_400_BAD_REQUEST)
        
        users = User.objects.filter(
            models.Q(username__icontains=query) | 
            models.Q(first_name__icontains=query) | 
            models.Q(last_name__icontains=query) | 
            models.Q(email__icontains=query)
        ).exclude(id=request.user.id).values('id', 'username', 'email', 'first_name', 'last_name')
        
        results = []
        for user in users:
            full_name = f"{user['first_name']} {user['last_name']}".strip()
            results.append({
                'id': user['id'],
                'username': user['username'],
                'email': user['email'],
                'name': full_name if full_name else user['username']
            })
        
        return Response(results)

class UserPublicProfileView(APIView):
    """
    API view to retrieve public profile information for a user.
    """
    def get(self, request, username):
        try:
            user = User.objects.get(username=username)
            
            # Get public publications
            publications = Publication.objects.filter(
                user=user, is_public=True
            ).values('id', 'title', 'journal', 'year')[:5]
            
            # Get public datasets
            datasets = FileUpload.objects.filter(
                user=user, is_public=True
            ).values('id', 'file_name', 'description', 'upload_date')[:5]
            
            return Response({
                'id': user.id,
                'username': user.username,
                'name': user.get_full_name() or user.username,
                'publications': list(publications),
                'datasets': list(datasets),
                'joined_date': user.date_joined
            })
            
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

class UserSettingsView(APIView):
    """
    API view to handle user settings.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Get user settings from the database
        # In a real system, this would be stored in a UserSettings model
        # For now, we'll return some default settings
        
        settings = {
            'notifications': {
                'email': True,
                'research_updates': True,
                'collaboration_requests': True,
                'dataset_activity': True,
                'system_announcements': True,
            },
            'privacy': {
                'profile_visibility': 'public',
                'show_email': False,
                'show_orcid': True,
                'show_research': True,
                'show_publications': True,
            },
            'security': {
                'two_factor_enabled': False,
                'login_alerts': True,
            }
        }
        
        return Response(settings)
    
    def put(self, request):
        # Update user settings
        # In a real system, this would update a UserSettings model
        # For now, we'll just return the settings that would be saved
        
        # Validate the request data
        valid_notification_keys = ['email', 'research_updates', 'collaboration_requests', 'dataset_activity', 'system_announcements']
        valid_privacy_keys = ['profile_visibility', 'show_email', 'show_orcid', 'show_research', 'show_publications']
        valid_security_keys = ['two_factor_enabled', 'login_alerts']
        
        # Get the settings from the request
        settings = {}
        
        if 'notifications' in request.data:
            notifications = {}
            for key, value in request.data['notifications'].items():
                if key in valid_notification_keys:
                    notifications[key] = bool(value)
            settings['notifications'] = notifications
        
        if 'privacy' in request.data:
            privacy = {}
            for key, value in request.data['privacy'].items():
                if key in valid_privacy_keys:
                    if key == 'profile_visibility' and value in ['public', 'private', 'contacts']:
                        privacy[key] = value
                    elif key != 'profile_visibility':
                        privacy[key] = bool(value)
            settings['privacy'] = privacy
        
        if 'security' in request.data:
            security = {}
            for key, value in request.data['security'].items():
                if key in valid_security_keys:
                    security[key] = bool(value)
            settings['security'] = security
        
        # In a real system, save the settings to the database
        # ...
        
        return Response(settings)

class UserNotificationsView(APIView):
    """
    API view to handle user notifications.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Get notifications for the user
        # In a real system, this would query a Notification model
        # For now, we'll return some sample notifications
        
        # Get query parameters for filtering
        category = request.query_params.get('category', None)
        is_read = request.query_params.get('is_read', None)
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 10))
        
        # Generate sample notifications
        all_notifications = [
            {
                'id': 1,
                'title': 'New collaboration invitation',
                'message': 'You have been invited to collaborate on the project "Electrochemical Sensors for Glucose Detection"',
                'category': 'collaboration',
                'is_read': False,
                'created_at': '2023-11-15T10:30:00Z',
                'action_url': '/research/RP-12345ABC',
            },
            {
                'id': 2,
                'title': 'Publication cited',
                'message': 'Your publication "Novel Electrochemical Methods" has been cited in a new paper',
                'category': 'publication',
                'is_read': True,
                'created_at': '2023-11-14T15:45:00Z',
                'action_url': '/publications/10.1021/jacs.0c01234',
            },
            {
                'id': 3,
                'title': 'Dataset downloaded',
                'message': 'Your dataset "Cyclic Voltammetry Data" has been downloaded 10 times this week',
                'category': 'dataset',
                'is_read': False,
                'created_at': '2023-11-13T09:15:00Z',
                'action_url': '/datasets/DS-54321ZYX',
            },
            {
                'id': 4,
                'title': 'Research project update',
                'message': 'John Doe made changes to the research project "Advanced Materials for Fuel Cells"',
                'category': 'research',
                'is_read': True,
                'created_at': '2023-11-12T14:20:00Z',
                'action_url': '/research/RP-13579GHI',
            },
            {
                'id': 5,
                'title': 'System update',
                'message': 'New features have been added to the platform: Improved analytics and data visualization',
                'category': 'system',
                'is_read': False,
                'created_at': '2023-11-10T11:00:00Z',
                'action_url': '/whatsnew',
            },
            {
                'id': 6,
                'title': 'New comment on your research',
                'message': 'Jane Smith commented on your research project "Quantum Effects in Electrochemical Systems"',
                'category': 'research',
                'is_read': False,
                'created_at': '2023-11-09T16:30:00Z',
                'action_url': '/research/RP-24680JKL/comments',
            },
            {
                'id': 7,
                'title': 'Dataset shared with you',
                'message': 'Michael Johnson shared a dataset "Impedance Spectroscopy Database" with you',
                'category': 'dataset',
                'is_read': True,
                'created_at': '2023-11-08T13:45:00Z',
                'action_url': '/datasets/DS-09876WVU',
            },
            {
                'id': 8,
                'title': 'Collaboration request accepted',
                'message': 'Emily Davis accepted your invitation to collaborate on "Machine Learning for Voltammetry Analysis"',
                'category': 'collaboration',
                'is_read': True,
                'created_at': '2023-11-07T10:15:00Z',
                'action_url': '/research/RP-11223MNO',
            },
            {
                'id': 9,
                'title': 'Publication review completed',
                'message': 'Your publication "Interface Engineering for Electrochemical Devices" has completed peer review',
                'category': 'publication',
                'is_read': False,
                'created_at': '2023-11-06T09:30:00Z',
                'action_url': '/publications/10.1021/acsami.0c07890',
            },
            {
                'id': 10,
                'title': 'Account security alert',
                'message': 'Your account was accessed from a new device. If this wasn\'t you, please update your password',
                'category': 'system',
                'is_read': True,
                'created_at': '2023-11-05T20:00:00Z',
                'action_url': '/settings/security',
            },
        ]
        
        # Filter notifications
        filtered_notifications = all_notifications
        
        if category:
            filtered_notifications = [n for n in filtered_notifications if n['category'] == category]
        
        if is_read is not None:
            is_read_bool = is_read.lower() == 'true'
            filtered_notifications = [n for n in filtered_notifications if n['is_read'] == is_read_bool]
        
        # Paginate notifications
        total_count = len(filtered_notifications)
        total_pages = (total_count + page_size - 1) // page_size
        
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        
        paginated_notifications = filtered_notifications[start_idx:end_idx]
        
        return Response({
            'count': total_count,
            'pages': total_pages,
            'current_page': page,
            'notifications': paginated_notifications,
            'unread_count': len([n for n in all_notifications if not n['is_read']])
        })
    
    def put(self, request, notification_id=None):
        # Mark notification(s) as read
        if notification_id:
            # Mark a specific notification as read
            return Response({'message': f'Notification {notification_id} marked as read'})
        else:
            # Mark all notifications as read
            return Response({'message': 'All notifications marked as read'})

class NotificationSettingsView(APIView):
    """
    API view to handle notification settings.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Get notification settings for the user
        # In a real system, this would query a NotificationSettings model
        # For now, we'll return some default settings
        
        settings = {
            'email': True,
            'research_updates': True,
            'collaboration_requests': True,
            'dataset_activity': True,
            'system_announcements': True,
        }
        
        return Response(settings)
    
    def put(self, request):
        # Update notification settings
        # In a real system, this would update a NotificationSettings model
        # For now, we'll just return the settings that would be saved
        
        valid_keys = ['email', 'research_updates', 'collaboration_requests', 'dataset_activity', 'system_announcements']
        
        settings = {}
        for key, value in request.data.items():
            if key in valid_keys:
                settings[key] = bool(value)
        
        # In a real system, save the settings to the database
        # ...
        
        return Response(settings)

class InviteCollaboratorView(APIView):
    """
    API view to handle collaboration invitations.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, project_id):
        # Get invitation data
        email = request.data.get('email')
        orcid_id = request.data.get('orcid_id')
        role = request.data.get('role', 'viewer')
        
        if not email and not orcid_id:
            return Response(
                {'error': 'Either email or ORCID ID is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Check if the user exists
            user = None
            if email:
                try:
                    user = User.objects.get(email=email)
                except User.DoesNotExist:
                    # User doesn't exist, send email invitation
                    pass
            
            if orcid_id:
                # In a real system, look up the user by ORCID ID
                # For now, just simulate the behavior
                pass
            
            # Create invitation record
            invitation = CollaborationInvite.objects.create(
                project_id=project_id,
                inviter=request.user,
                invitee=user,
                email=email,
                orcid_id=orcid_id,
                role=role,
                status='pending'
            )
            
            if user:
                # Send notification to the user (implementation pending)
                # Also send an email notification
                send_collaboration_notification(user, request.user, project_id, role)
            else:
                # Send email invitation to the non-registered user
                send_collaboration_email(email or "user@example.com", request.user, project_id, role)
            
            return Response({
                'message': 'Invitation sent successfully',
                'invitation_id': invitation.id
            }, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def get(self, request, project_id):
        # Get all invitations for a project
        invitations = CollaborationInvite.objects.filter(project_id=project_id).values(
            'id', 'invitee__username', 'invitee__email', 'email', 'orcid_id', 'role', 'status', 'created_at'
        )
        
        return Response(list(invitations))

class DeleteAccountView(APIView):
    """
    API view to handle account deletion.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # Verify password before deletion
        password = request.data.get('password')
        
        if not password:
            return Response(
                {'error': 'Password is required to confirm account deletion'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not request.user.check_password(password):
            return Response(
                {'error': 'Incorrect password'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Perform account deletion
            user = request.user
            logout(request)
            user.delete()
            
            return Response({'message': 'Account deleted successfully'})
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class AnalyticsOverviewView(APIView):
    """
    API view to retrieve analytics overview data.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Implementation to retrieve analytics overview data
        return Response({
            'dataset_count': 45,
            'dataset_downloads': 312,
            'publication_count': 18,
            'publication_citations': 87,
            'collaboration_count': 9,
            'monthly_activity': [
                {'month': 'Jan', 'datasets': 3, 'publications': 1},
                {'month': 'Feb', 'datasets': 5, 'publications': 2},
                {'month': 'Mar', 'datasets': 4, 'publications': 1},
                {'month': 'Apr', 'datasets': 6, 'publications': 3},
                {'month': 'May', 'datasets': 8, 'publications': 2},
                {'month': 'Jun', 'datasets': 7, 'publications': 4}
            ]
        })

class ResearchAnalyticsView(APIView):
    """
    API view to retrieve research project analytics.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Implementation to retrieve research project analytics
        return Response({
            'projects': []
        })

class PublicationAnalyticsView(APIView):
    """
    API view to retrieve publication analytics.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Implementation to retrieve publication analytics
        return Response({
            'publications': []
        })

class DatasetAnalyticsView(APIView):
    """
    API view to retrieve dataset analytics.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Implementation to retrieve dataset analytics
        return Response({
            'datasets': []
        })

# Helper functions for collaboration invites
def send_collaboration_notification(user, inviter, project_id, role):
    """Send in-app notification for collaboration invite."""
    # Implementation for sending in-app notification
    print(f"Sending notification to {user.email} for project {project_id} with role {role}")

def send_collaboration_email(email, inviter, project_id, role):
    """Send email notification for collaboration invite."""
    # Implementation for sending email
    print(f"Sending email to {email} for project {project_id} with role {role}")

def check_pending_invitations(email):
    """Check for pending invitations for a newly registered user."""
    # Implementation to check and process pending invitations
    pending_invites = CollaborationInvite.objects.filter(email=email, invitee=None)
    
    if pending_invites.exists():
        # Process pending invitations
        print(f"Found {pending_invites.count()} pending invitations for {email}")
