
from django.urls import path
from . import views
from . import views_caching
from . import views_orcid
from . import views_research

urlpatterns = [
    # API endpoints for Publications
    path('publications/', views.PublicationList.as_view(), name='get_publications'),
    path('publications/<int:publication_id>/', views.PublicationList.as_view(), name='get_publication'),
    path('publications/doi/<str:doi>/', views.PublicationDetail.as_view(), name='get_publication_by_doi'),
    path('publications/register/', views.PublicationRegistration.as_view(), name='register_publication'),
    
    # API endpoints for Data Types
    path('data-types/', views_caching.get_data_types, name='get_data_types'),
    
    # API endpoints for Data Categories
    path('data-categories/', views.DataCategoriesList.as_view(), name='get_data_categories'),
    
    # API endpoints for Uploads
    path('upload/', views.FileUploadView.as_view(), name='upload_file'),
    path('upload/publication/<str:doi>/', views.PublicationFileUploadView.as_view(), name='upload_file_to_publication'),
    path('upload/research/<str:project_id>/', views.ResearchFileUploadView.as_view(), name='upload_file_to_research'),
    
    # API endpoints for Search
    path('search/', views.SearchView.as_view(), name='search_data'),
    path('search/suggestions/', views.SearchView.as_view(), name='get_search_suggestions'),
    
    # API endpoints for Downloads
    path('download/<str:dataset_id>/', views.DownloadView.as_view(), name='download_file'),
    path('download/<str:dataset_id>/<str:format>/', views.DownloadView.as_view(), name='download_file_format'),
    
    # API endpoints for Voltammetry
    path('voltammetry/', views.VoltammetryDataView.as_view(), name='get_voltammetry_data'),
    path('voltammetry/<str:experiment_id>/', views.VoltammetryDataView.as_view(), name='get_voltammetry_detail'),
    
    # API endpoints for Recent Datasets
    path('recent-datasets/', views.RecentDatasetsView.as_view(), name='get_recent_datasets'),
    
    # API endpoints for Authentication
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/signup/', views.SignupView.as_view(), name='signup'),
    path('auth/logout/', views.LogoutView.as_view(), name='logout'),
    path('auth/profile/', views.UserProfileView.as_view(), name='get_user_profile'),
    path('auth/password-reset/', views.PasswordResetRequestView.as_view(), name='password_reset'),
    path('auth/password-reset/confirm/', views.PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    
    # API endpoints for Caching
    path('cached/experiment/<str:experiment_id>/', views_caching.get_cached_experiment, name='get_cached_experiment'),
    path('paginated/experiments/', views_caching.get_paginated_experiments, name='get_paginated_experiments'),
    
    # ORCID Verification API endpoints
    path('orcid/verify/', views_orcid.initiate_orcid_verification, name='initiate_orcid_verification'),
    path('orcid/confirm/', views_orcid.confirm_orcid_verification, name='confirm_orcid_verification'),
    path('orcid/profile/', views_orcid.get_orcid_profile, name='get_orcid_profile'),
    
    # Research Project API endpoints
    path('research/projects/', views_research.research_projects, name='research_projects'),
    path('research/projects/new/', views_research.research_projects, name='create_research_project'),
    path('research/projects/<str:project_id>/', views_research.research_project_detail, name='research_project_detail'),
    path('research/projects/<str:project_id>/collaborators/', views_research.add_collaborator, name='add_collaborator'),
    path(route='research/projects/<str:project_id>/collaborators/<int:collaborator_id>/', view=views_research.manage_collaborator, name='manage_collaborator'),
    path('research/projects/<str:project_id>/experiments/', views_research.assign_experiment, name='assign_experiment'),
    path('research/projects/<str:project_id>/comparisons/', views_research.dataset_comparisons, name='project_dataset_comparisons'),
    path('research/comparisons/', views_research.dataset_comparisons, name='dataset_comparisons'),
    path('research/comparisons/<str:comparison_id>/', views_research.comparison_detail, name='comparison_detail'),
]
