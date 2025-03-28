
from django.urls import path
from . import views
from . import views_publication
from . import views_research
from . import views_orcid
from . import views_caching

urlpatterns = [
    # Authentication endpoints
    path('auth/login/', views.login_view, name='api-login'),
    path('auth/logout/', views.logout_view, name='api-logout'),
    path('auth/signup/', views.signup_view, name='api-signup'),
    path('auth/user/', views.user_view, name='api-user'),
    path('auth/reset-password/', views.password_reset_request, name='api-password-reset-request'),
    path('auth/reset-password/<str:token>/', views.password_reset_confirm, name='api-password-reset-confirm'),
    
    # Data visualization endpoints
    path('dashboard/summary/', views.dashboard_summary, name='api-dashboard-summary'),
    path('dashboard/activity/', views.user_activity, name='api-user-activity'),
    path('dashboard/experiments/', views.recent_experiments, name='api-recent-experiments'),
    
    # Voltammetry data endpoints
    path('voltammetry/', views.voltammetry_list, name='api-voltammetry-list'),
    path('voltammetry/<str:experiment_id>/', views.voltammetry_detail, name='api-voltammetry-detail'),
    path('voltammetry/<str:experiment_id>/raw/', views.voltammetry_raw_data, name='api-voltammetry-raw-data'),
    path('voltammetry/<str:experiment_id>/plot/', views.voltammetry_plot, name='api-voltammetry-plot'),
    path('voltammetry/<str:experiment_id>/export/', views.export_data, name='api-export-data'),
    
    # Search endpoints
    path('search/', views.search, name='api-search'),
    path('advanced-search/', views.advanced_search, name='api-advanced-search'),
    
    # Research project endpoints
    path('research/projects/', views_research.research_projects, name='api-research-projects'),
    path('research/projects/<str:project_id>/', views_research.research_project_detail, name='api-research-project-detail'),
    path('research/projects/<str:project_id>/collaborators/', views_research.add_collaborator, name='api-add-collaborator'),
    path('research/projects/<str:project_id>/collaborators/<int:collaborator_id>/', views_research.manage_collaborator, name='api-manage-collaborator'),
    path('research/projects/<str:project_id>/experiments/', views_research.assign_experiment, name='api-assign-experiment'),
    path('research/projects/<str:project_id>/comparisons/', views_research.dataset_comparisons, name='api-project-comparisons'),
    path('research/comparisons/', views_research.dataset_comparisons, name='api-comparisons'),
    path('research/comparisons/<str:comparison_id>/', views_research.comparison_detail, name='api-comparison-detail'),
    path('research/<str:project_id>/upload/', views_publication.ResearchFileUploadView.as_view(), name='api-research-file-upload'),
    
    # Publication endpoints
    path('publications/', views_publication.PublicationsList.as_view(), name='api-publications-list'),
    path('publications/<str:doi>/', views_publication.PublicationDetail.as_view(), name='api-publication-detail'),
    path('publications/register/', views_publication.PublicationRegistration.as_view(), name='api-publication-register'),
    path('publications/<str:doi>/upload/', views_publication.PublicationFileUploadView.as_view(), name='api-publication-file-upload'),
    path('publications/<str:doi>/analysis/', views_publication.PublicationAnalysisView.as_view(), name='api-publication-analysis'),
    path('datasets/<int:dataset_id>/download/', views_publication.DatasetDownloadView.as_view(), name='api-dataset-download'),
    
    # ORCID integration endpoints
    path('orcid/verify/', views_orcid.initiate_verification, name='api-orcid-verify'),
    path('orcid/confirm/', views_orcid.confirm_verification, name='api-orcid-confirm'),
    path('orcid/profile/', views_orcid.get_profile, name='api-orcid-profile'),
    
    # Caching endpoints
    path('cache/clear/', views_caching.clear_cache, name='api-clear-cache'),
]
