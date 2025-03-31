from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import login
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from django.middleware.csrf import get_token


from .models import Publication, FileUpload, CollaborationInvite
from apps.api import models

class CSRFTokenView(APIView):
    """
    API view to provide CSRF token
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        csrf_token = get_token(request)
        return Response({'csrf_token': csrf_token})

class Methods(APIView):
    """
    API view to get the list of methods
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        methods = models.Method.objects.all().values('id', 'name')
        return Response(list(methods))
class Electrodes(APIView):
    """
    API view to get the list of electrodes
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        electrodes = models.Electrode.objects.all().values('id', 'type')
        return Response(list(electrodes))

class Instruments(APIView):
    """
    API view to get the list of instruments
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        instruments = models.Instrument.objects.all().values('id', 'name')
        return Response(list(instruments))
    

class VoltammetryTechniques(APIView):
    """
    API view to get the list of voltammetry techniques
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        techniques = models.VoltammetryTechnique.objects.all().values('id', 'name')
        return Response(list(techniques))



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
