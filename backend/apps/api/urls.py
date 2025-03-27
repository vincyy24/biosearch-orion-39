
from django.urls import path, include
from . import views
from . import views_caching
from . import views_orcid
from . import views_research

urlpatterns = [
    # API endpoints for Publications
    path('publications/', views.get_publications, name='get_publications'),
    path('publications/<int:publication_id>/', views.get_publication, name='get_publication'),
    
    # API endpoints for Data Types
    path('data-types/', views_caching.get_data_types, name='get_data_types'),
    
    # API endpoints for Data Categories
    path('data-categories/', views.get_data_categories, name='get_data_categories'),
    
    # API endpoints for Uploads
    path('upload/', views.upload_file, name='upload_file'),
    
    # API endpoints for Search
    path('search/', views.search_data, name='search_data'),
    path('search/suggestions/', views.get_search_suggestions, name='get_search_suggestions'),
    
    # API endpoints for Downloads
    path('download/', views.download_file, name='download_file'),
    
    # API endpoints for Voltammetry
    path('voltammetry/', views.get_voltammetry_data, name='get_voltammetry_data'),
    path('voltammetry/<str:experiment_id>/', views.get_voltammetry_data, name='get_voltammetry_detail'),
    
    # API endpoints for Recent Datasets
    path('recent-datasets/', views.get_recent_datasets, name='get_recent_datasets'),
    
    # API endpoints for Authentication
    path('auth/login/', views.login_view, name='login'),
    path('auth/signup/', views.signup_view, name='signup'),
    path('auth/logout/', views.logout_view, name='logout'),
    path('auth/profile/', views.get_user_profile, name='get_user_profile'),
    path('auth/password-reset/', views.password_reset, name='password_reset'),
    path('auth/password-reset/confirm/', views.password_reset_confirm, name='password_reset_confirm'),
    
    # API endpoints for Caching
    path('cached/experiment/<str:experiment_id>/', views_caching.get_cached_experiment, name='get_cached_experiment'),
    path('paginated/experiments/', views_caching.get_paginated_experiments, name='get_paginated_experiments'),
    
    # ORCID Verification API endpoints
    path('orcid/verify/', views_orcid.initiate_orcid_verification, name='initiate_orcid_verification'),
    path('orcid/confirm/', views_orcid.confirm_orcid_verification, name='confirm_orcid_verification'),
    path('orcid/profile/', views_orcid.get_orcid_profile, name='get_orcid_profile'),
    
    # Research Project API endpoints
    path('research/projects/', views_research.research_projects, name='research_projects'),
    path('research/projects/<str:project_id>/', views_research.research_project_detail, name='research_project_detail'),
    path('research/projects/<str:project_id>/collaborators/', views_research.add_collaborator, name='add_collaborator'),
    path('research/projects/<str:project_id>/collaborators/<int:collaborator_id>/', views_research.manage_collaborator, name='manage_collaborator'),
    path('research/projects/<str:project_id>/experiments/', views_research.assign_experiment, name='assign_experiment'),
    path('research/projects/<str:project_id>/comparisons/', views_research.dataset_comparisons, name='project_dataset_comparisons'),
    path('research/comparisons/', views_research.dataset_comparisons, name='dataset_comparisons'),
    path('research/comparisons/<str:comparison_id>/', views_research.comparison_detail, name='comparison_detail'),
]
