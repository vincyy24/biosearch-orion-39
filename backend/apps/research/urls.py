from django.urls import path
from . import views



urlpatterns = [
    # Research project routes
    path('', views.ResearchProjects.as_view(), name='research_projects'),
    path('<str:project_id>/', views.ResearchProjectDetail.as_view(), name='research_project_detail'),
    path('<str:project_id>/assign/', views.AssignExperiment.as_view(), name='assign_experiment'),
    path('<str:project_id>/collaborators/', views.AddCollaborator.as_view(), name='add_collaborator'),
    path('<str:project_id>/collaborators/<int:collaborator_id>/', views.ManageCollaborator.as_view(), name='manage_collaborator'),
    path('<str:project_id>/comparisons/', views.DatasetComparisons.as_view(), name='dataset_comparisons'),
    path('<str:project_id>/invite/', views.InviteCollaboratorView.as_view(), name='invite_collaborator'),
    path('<str:project_id>/upload/', views.ResearchUpload.as_view(), name='research_upload'),
    path('<str:project_id>/versions/', views.ResearchVersionsView.as_view(), name='research_versions'),
] + \
[
    # Dataset comparison routes
    path('comparisons/', views.DatasetComparisons.as_view(), name='dataset_comparisons_all'),
    path('comparisons/<str:comparison_id>/', views.ComparisonDetail.as_view(), name='comparison_detail'),
]