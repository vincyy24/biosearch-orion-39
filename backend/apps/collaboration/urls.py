from .views import InviteCollaboratorView
from django.urls import path

urlpatterns = [
    path('research/<int:project_id>/invite/',
         InviteCollaboratorView.as_view(), name='invite_collaborator'),
]
