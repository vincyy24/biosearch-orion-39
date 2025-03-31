
from django.urls import path
from .views import FileUploadView, LoginView, LogoutView, UserViewSet, CreateUser
from .views_research import ResearchProjects, ResearchProjectDetail, AddCollaborator, ManageCollaborator, AssignExperiment, DatasetComparisons, ComparisonDetail, InviteCollaboratorView, ResearchVersionsView, ResearchFileUploadView, ResearchFileVersionView, ResearchFileDownloadView
from .views_publication import PublicationRegistrationView

urlpatterns = [
    # Authentication
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('users/create/', CreateUser.as_view(), name='create_user'),
    path('users/<int:pk>/', UserViewSet.as_view(), name='user_detail'),
    
    # Upload
    path('upload/', FileUploadView.as_view(), name='file_upload'),
    
    # Research projects
    path('research/projects/', ResearchProjects.as_view(), name='research_projects'),
    path('research/projects/<str:project_id>/', ResearchProjectDetail.as_view(), name='research_project_detail'),
    path('research/projects/<str:project_id>/collaborators/add/', AddCollaborator.as_view(), name='add_collaborator'),
    path('research/projects/<str:project_id>/collaborators/<int:collaborator_id>/', ManageCollaborator.as_view(), name='manage_collaborator'),
    path('research/projects/<str:project_id>/experiments/assign/', AssignExperiment.as_view(), name='assign_experiment'),
    path('research/comparisons/', DatasetComparisons.as_view(), name='dataset_comparisons'),
    path('research/comparisons/<str:comparison_id>/', ComparisonDetail.as_view(), name='comparison_detail'),
    path('research/projects/<str:project_id>/invite/', InviteCollaboratorView.as_view(), name='invite_collaborator'),
    path('research/projects/<str:project_id>/versions/', ResearchVersionsView.as_view(), name='research_versions'),
    
    # New file upload and version management routes
    path('research/projects/<str:project_id>/upload/', ResearchFileUploadView.as_view(), name='research_file_upload'),
    path('research/files/<int:file_id>/versions/', ResearchFileVersionView.as_view(), name='research_file_versions'),
    path('research/files/<int:file_id>/download/', ResearchFileDownloadView.as_view(), name='research_file_download'),
    
    # Publications
    path('publications/register/', PublicationRegistrationView.as_view(), name='register_publication'),
    path('publications/<str:doi>/', PublicationRegistrationView.as_view(), name='publication_detail'),
    path('publications/<str:doi>/upload/', FileUploadView.as_view(), name='publication_file_upload'),
]
