from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
import traceback

from apps.collaboration.models import CollaborationInvite

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


# Helper Functions
def check_pending_invitations(email):
    """Check for pending invitations for a newly registered user."""
    # Implementation to check and process pending invitations
    pending_invites = CollaborationInvite.objects.filter(email=email, invitee=None)
    
    if pending_invites.exists():
        # Process pending invitations
        print(f"Found {pending_invites.count()} pending invitations for {email}")
