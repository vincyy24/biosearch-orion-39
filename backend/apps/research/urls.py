from django.urls import path
from . import views


urlpatterns = [
    # Research project routes
    path('', views.ResearchView.as_view(), name='research_projects'),
    path(
        '<str:research_id>/',
        views.ResearchDetailView.as_view(),
        name='research_project_detail'
    ),
    path(
        '<str:research_id>/assign/',
        views.AssignExperimentView.as_view(),
        name='assign_experiment'
    ),
    path(
        '<str:research_id>/collaborators/add/',
        views.AddCollaboratorView.as_view(),
        name='add_collaborator'
    ),
    path(
        '<str:research_id>/collaborators/<int:collaborator_id>/',
        views.ManageCollaboratorView.as_view(),
        name='manage_collaborator'
    ),
    path(
        '<str:research_id>/comparisons/',
        views.DatasetComparisonsView.as_view(),
        name='dataset_comparisons'
    ),
    path(
        '<str:research_id>/upload/',
        views.ResearchUploadView.as_view(),
        name='research_upload'
    ),
    path(
        '<str:research_id>/versions/',
        views.ResearchVersionsView.as_view(),
        name='research_versions'
    ),
    path(
        "<str:research_id>/experiments/assign/",
        views.AssignExperimentView.as_view(),
        name="assign_experiment"
    ),
] + \
    [
    # Dataset comparison routes
    path(
        'comparisons/',
        views.DatasetComparisonsView.as_view(),
        name='dataset_comparisons_all'
    ),
    path(
        '<str:research_id>/comparisons/',
        views.DatasetComparisonsView.as_view(),
        name='research_dataset_comparisons'
    ),
    path(
        'comparisons/<str:comparison_id>/',
        views.ComparisonDetail.as_view(),
        name='comparison_detail'
    ),
]
