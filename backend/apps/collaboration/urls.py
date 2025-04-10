from django.urls import path
from .views import InviteCollaboratorView

urlpatterns = [
    # Changed to use string research_id for consistency
    path(
        'research/<str:research_id>/invite/',
        InviteCollaboratorView.as_view(),
        name='invite_collaborator'
    ),
]
