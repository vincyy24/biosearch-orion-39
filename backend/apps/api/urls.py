
from django.urls import path
from . import views
from . import views_caching
from . import views_orcid
from . import views_research
from . import views_publication

urlpatterns = [
    # Authentication endpoints
    path('auth/login/', views.LoginView.as_view(), name='api-login'),
    path('auth/logout/', views.LogoutView.as_view(), name='api-logout'),
    path('auth/signup/', views.SignupView.as_view(), name='api-signup'),
    path('auth/user/', views.UserProfileView.as_view(), name='api-user'),
    path('auth/reset-password/', views.PasswordResetRequestView.as_view(), name='api-password-reset-request'),
    path('auth/reset-password/<str:token>/', views.PasswordResetConfirmView.as_view(), name='api-password-reset-confirm'),
    path('auth/profile/', views.UserProfileView.as_view(), name='api-user-profile'),
    path('auth/username/', views.UpdateUsernameView.as_view(), name='api-update-username'),
    path('auth/password/', views.UpdatePasswordView.as_view(), name='api-update-password'),
    
    # Dashboard endpoints
    path('dashboard/summary/', views.DashboardSummaryView.as_view(), name='api-dashboard-summary'),
    path('dashboard/activity/', views.UserActivityView.as_view(), name='api-user-activity'),
    path('dashboard/experiments/', views.RecentExperimentsView.as_view(), name='api-recent-experiments'),
    
    # Voltammetry data endpoints
    path('voltammetry/', views.VoltammetryDataView.as_view(), name='api-voltammetry-list'),
    path('voltammetry/<str:experiment_id>/', views.VoltammetryDataView.as_view(), name='api-voltammetry-detail'),
    path('voltammetry/<str:experiment_id>/raw/', views.VoltammetryRawDataView.as_view(), name='api-voltammetry-raw-data'),
    path('voltammetry/<str:experiment_id>/plot/', views.VoltammetryPlotView.as_view(), name='api-voltammetry-plot'),
    path('recent-datasets/', views.RecentDatasetsView.as_view(), name='get_recent_datasets'),
    path('voltammetry/<str:experiment_id>/export/', views.ExportDataView.as_view(), name='api-export-data'),
    
    # Search endpoints
    path('search/', views.SearchView.as_view(), name='api-search'),
    path('advanced-search/', views.AdvancedSearchView.as_view(), name='api-advanced-search'),
    path('search/users/', views.UserSearchView.as_view(), name='api-user-search'),
    
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
    path('research/<str:project_id>/versions/', views_research.ResearchVersionsView.as_view(), name='api-research-versions'),
    path('research/<str:project_id>/invite/', views_research.InviteCollaboratorView.as_view(), name='api-invite-collaborator'),
    
    # Publication endpoints
    path('publications/', views_publication.PublicationsList.as_view(), name='api-publications-list'),
    path('publications/<str:doi>/', views_publication.PublicationDetail.as_view(), name='api-publication-detail'),
    path('publications/register/', views_publication.PublicationRegistration.as_view(), name='api-publication-register'),
    path('publications/<str:doi>/upload/', views_publication.PublicationFileUploadView.as_view(), name='api-publication-file-upload'),
    path('publications/<str:doi>/analysis/', views_publication.PublicationAnalysisView.as_view(), name='api-publication-analysis'),
    path('datasets/<int:dataset_id>/download/', views_publication.DatasetDownloadView.as_view(), name='api-dataset-download'),
    path('publications/search/', views_publication.PublicationSearchView.as_view(), name='api-publication-search'),
    path('publications/doi/<str:doi>/', views_publication.DoiVerificationView.as_view(), name='api-doi-verification'),
    
    # User profile and settings endpoints
    path('user/profile/<str:username>/', views.UserPublicProfileView.as_view(), name='api-user-public-profile'),
    path('user/settings/', views.UserSettingsView.as_view(), name='api-user-settings'),
    path('user/notifications/', views.UserNotificationsView.as_view(), name='api-user-notifications'),
    path('user/notifications/settings/', views.NotificationSettingsView.as_view(), name='api-notification-settings'),
    path('user/delete/', views.DeleteAccountView.as_view(), name='api-delete-account'),
    
    # Analytics endpoints
    path('analytics/overview/', views.AnalyticsOverviewView.as_view(), name='api-analytics-overview'),
    path('analytics/research/', views.ResearchAnalyticsView.as_view(), name='api-research-analytics'),
    path('analytics/publications/', views.PublicationAnalyticsView.as_view(), name='api-publication-analytics'),
    path('analytics/datasets/', views.DatasetAnalyticsView.as_view(), name='api-dataset-analytics'),
    
    # ORCID integration endpoints
    path('orcid/verify/', views_orcid.initiate_orcid_verification, name='api-orcid-verify'),
    path('orcid/confirm/', views_orcid.confirm_orcid_verification, name='api-orcid-confirm'),
    path('orcid/profile/', views_orcid.get_orcid_profile, name='api-orcid-profile'),
    
    # Caching endpoints
    path('cache/clear/', views_caching.clear_cache, name='api-clear-cache'),
]
