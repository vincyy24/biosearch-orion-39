from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from .models import CollaborationInvite, ResearchCollaborator
from rest_framework.permissions import IsAuthenticated

class InviteCollaboratorView(APIView):
    """
    API view to handle collaboration invitations.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, research):
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
                project_id=research,
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
                send_collaboration_notification(user, request.user, research, role)
            else:
                # Send email invitation to the non-registered user
                send_collaboration_email(email or "user@example.com", request.user, research, role)
            
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
