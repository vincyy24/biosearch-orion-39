from django.urls import path
from . import views
from . import views_caching
from . import views_publication
from . import views_research

urlpatterns = [
    # Authentication routes
    path('csrf_token/', views.CSRFTokenView.as_view(), name='csrf_token'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('signup/', views.SignupView.as_view(), name='signup'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('password/reset/', views.PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('password/reset/confirm/', views.PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    
    # User profile routes
    path('users/me/', views.UserProfileView.as_view(), name='user_profile'),
    path('users/me/username/', views.UpdateUsernameView.as_view(), name='update_username'),
    path('users/me/password/', views.UpdatePasswordView.as_view(), name='update_password'),
    
    # Data routes
    path('data-types/', views.DataTypesList.as_view(), name='data_types_list'),
    path('data-categories/', views.DataCategoriesList.as_view(), name='data_categories_list'),
    path('file-upload/', views.FileUploadView.as_view(), name='file_upload'),
    path('download/', views.DownloadView.as_view(), name='download'),
    
    # Publication routes
    path('publications/', views.PublicationList.as_view(), name='publication_list'),
    
    # Dashboard routes
    path('dashboard/summary/', views.DashboardSummaryView.as_view(), name='dashboard_summary'),
    path('dashboard/activity/', views.UserActivityView.as_view(), name='user_activity'),
    path('dashboard/recent-experiments/', views.RecentExperimentsView.as_view(), name='recent_experiments'),
    path('dashboard/recent-datasets/', views.RecentDatasetsView.as_view(), name='recent_datasets'),
    
    # Search route
    path('search/', views.SearchView.as_view(), name='search'),
    path('search/advanced/', views.AdvancedSearchView.as_view(), name='advanced_search'),
    
    # Voltammetry data routes
    path('voltammetry/', views.VoltammetryDataView.as_view(), name='voltammetry_data_list'),
    path('voltammetry/<str:experiment_id>/', views.VoltammetryDataView.as_view(), name='voltammetry_data_detail'),
    path('voltammetry/<str:experiment_id>/raw/', views.VoltammetryRawDataView.as_view(), name='voltammetry_raw_data'),
    path('voltammetry/<str:experiment_id>/plot/', views.VoltammetryPlotView.as_view(), name='voltammetry_plot'),
    path('voltammetry/export/', views.ExportDataView.as_view(), name='voltammetry_export'),
    
    # Caching example route
    path('caching/data-types/', views_caching.get_data_types, name='get_data_types'),
    path('caching/experiments/', views_caching.get_paginated_experiments, name='get_paginated_experiments'),
    path('caching/experiments/<str:experiment_id>/', views_caching.get_cached_experiment, name='get_cached_experiment'),
    path('caching/clear/', views_caching.clear_cache, name='clear_cache'),
    
    # Research project routes
    path('research/projects/', views_research.research_projects, name='research_projects'),
    path('research/projects/<str:project_id>/', views_research.research_project_detail, name='research_project_detail'),
    path('research/projects/<str:project_id>/collaborators/', views_research.add_collaborator, name='add_collaborator'),
    path('research/projects/<str:project_id>/collaborators/<int:collaborator_id>/', views_research.manage_collaborator, name='manage_collaborator'),
    path('research/projects/<str:project_id>/assign/', views_research.assign_experiment, name='assign_experiment'),
    path('research/projects/<str:project_id>/comparisons/', views_research.dataset_comparisons, name='dataset_comparisons'),
    
    # Dataset comparison routes
    path('comparisons/', views_research.dataset_comparisons, name='dataset_comparisons_all'),
    path('comparisons/<str:comparison_id>/', views_research.comparison_detail, name='comparison_detail'),
]

# Add these routes to fix the 405 error
urlpatterns += [
    # Publication routes
    path('publications/register/', views_publication.register_publication, name='register_publication'),
    path('publications/<str:doi>/', views_publication.publication_detail, name='publication_detail'),
    path('publications/<str:doi>/upload/', views_publication.upload_dataset, name='upload_dataset'),
    path('publications/<str:doi>/upload-text/', views_publication.upload_dataset_as_text, name='upload_dataset_as_text'),
    path('publications/<str:doi>/analysis/', views_publication.publication_analysis, name='publication_analysis'),
    
    # User profile and settings
    path('users/profile/<str:username>/', views.UserPublicProfileView.as_view(), name='user_profile'),
    path('users/search/', views.UserSearchView.as_view(), name='user_search'),
    path('users/settings/', views.UserSettingsView.as_view(), name='user_settings'),
    path('users/notifications/', views.UserNotificationsView.as_view(), name='user_notifications'),
    path('users/notifications/settings/', views.NotificationSettingsView.as_view(), name='notification_settings'),
    
    # Research collaboration
    path('research/projects/<str:project_id>/invite/', views_research.InviteCollaboratorView.as_view(), name='invite_collaborator'),
    path('research/projects/<str:project_id>/versions/', views_research.ResearchVersionsView.as_view(), name='research_versions'),
    
    # Analytics
    path('analytics/overview/', views.AnalyticsOverviewView.as_view(), name='analytics_overview'),
    path('analytics/research/', views.ResearchAnalyticsView.as_view(), name='research_analytics'),
    path('analytics/publications/', views.PublicationAnalyticsView.as_view(), name='publication_analytics'),
    path('analytics/datasets/', views.DatasetAnalyticsView.as_view(), name='dataset_analytics'),
]
