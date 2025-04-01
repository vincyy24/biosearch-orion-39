from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.db import models
from django.http import JsonResponse
from django.utils import timezone
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from django.views.decorators.http import require_http_methods
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from datetime import timedelta
import json
import uuid

from apps.data.models import FileUpload
from apps.publication.models import Publication
from apps.users.models import OrcidProfile


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


# ORCID API endpoints
ORCID_API_URL = "https://pub.orcid.org/v3.0"
ORCID_AUTH_URL = "https://orcid.org/oauth/authorize"
ORCID_TOKEN_URL = "https://orcid.org/oauth/token"

@login_required
@require_http_methods(["POST"])
def initiate_orcid_verification(request):
    """Initiate the ORCID verification process for a user"""
    try:
        data = json.loads(request.body)
        orcid_id = data.get('orcid_id')
        
        if not orcid_id:
            return JsonResponse({"error": "ORCID ID is required"}, status=400)
        
        # Validate ORCID ID format (0000-0000-0000-0000)
        if not validate_orcid_format(orcid_id):
            return JsonResponse({"error": "Invalid ORCID ID format"}, status=400)
        
        # Check if this ORCID ID is already verified by another user
        if OrcidProfile.objects.filter(orcid_id=orcid_id, is_verified=True).exists():
            return JsonResponse({"error": "This ORCID ID is already verified by another user"}, status=400)
        
        # Get or create ORCID profile for the user
        orcid_profile, created = OrcidProfile.objects.get_or_create(
            user=request.user,
            defaults={'orcid_id': orcid_id}
        )
        
        if not created and orcid_profile.orcid_id != orcid_id:
            orcid_profile.orcid_id = orcid_id
            orcid_profile.is_verified = False
            
        # Generate verification token and set expiry
        verification_token = str(uuid.uuid4())
        token_expiry = timezone.now() + timedelta(hours=24)
        
        orcid_profile.verification_token = verification_token
        orcid_profile.token_expiry = token_expiry
        orcid_profile.save()
        
        # In a real implementation, this would redirect to ORCID for OAuth,
        # but for this example we'll simulate with a verification code
        return JsonResponse({
            "message": "Verification initiated",
            "verification_token": verification_token,
            "expires_at": token_expiry.isoformat()
        })
        
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@login_required
@require_http_methods(["POST"])
def confirm_orcid_verification(request):
    """Confirm ORCID verification with token"""
    try:
        data = json.loads(request.body)
        verification_code = data.get('verification_code')
        
        if not verification_code:
            return JsonResponse({"error": "Verification code is required"}, status=400)
        
        # Get user's ORCID profile
        try:
            orcid_profile = OrcidProfile.objects.get(user=request.user)
        except OrcidProfile.DoesNotExist:
            return JsonResponse({"error": "ORCID profile not found"}, status=404)
        
        # Check token and expiry
        if orcid_profile.verification_token != verification_code:
            return JsonResponse({"error": "Invalid verification code"}, status=400)
        
        if orcid_profile.token_expiry < timezone.now():
            return JsonResponse({"error": "Verification code has expired"}, status=400)
        
        # In a real implementation, we would verify with ORCID API
        # For this example, we'll simulate a successful verification
        
        # Fetch ORCID data (simulated)
        orcid_data = fetch_orcid_profile(orcid_profile.orcid_id)
        
        # Mark as verified
        orcid_profile.is_verified = True
        orcid_profile.verified_at = timezone.now()
        orcid_profile.orcid_data = orcid_data
        orcid_profile.save()
        
        return JsonResponse({
            "message": "ORCID successfully verified",
            "orcid_id": orcid_profile.orcid_id,
            "verified_at": orcid_profile.verified_at.isoformat()
        })
        
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@login_required
def get_orcid_profile(request):
    """Get the user's ORCID profile"""
    try:
        try:
            orcid_profile = OrcidProfile.objects.get(user=request.user)
        except OrcidProfile.DoesNotExist:
            return JsonResponse({"error": "ORCID profile not found"}, status=404)
        
        return JsonResponse({
            "orcid_id": orcid_profile.orcid_id,
            "is_verified": orcid_profile.is_verified,
            "verified_at": orcid_profile.verified_at.isoformat() if orcid_profile.verified_at else None,
            "profile_data": orcid_profile.orcid_data
        })
        
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


def validate_orcid_format(orcid_id):
    """Validate ORCID ID format (0000-0000-0000-0000)"""
    import re
    pattern = r'^\d{4}-\d{4}-\d{4}-\d{4}$'
    return bool(re.match(pattern, orcid_id))

def fetch_orcid_profile(orcid_id):
    """Fetch ORCID profile data from the ORCID API (simulated)"""
    # In a real implementation, this would call the ORCID API
    # For this example, we'll return simulated data
    return {
        "orcid_id": orcid_id,
        "name": "Sample Researcher",
        "biography": "Sample researcher biography",
        "education": [
            "Ph.D. in Chemistry, Sample University, 2015",
            "M.Sc. in Chemistry, Another University, 2010"
        ],
        "employment": [
            "Senior Researcher, Research Institute, 2015-Present",
            "Research Assistant, University Lab, 2010-2015"
        ],
        "works": [
            {
                "title": "Sample Research Paper",
                "type": "journal-article",
                "year": 2020,
                "url": "https://doi.org/10.1234/sample"
            }
        ]
    }
