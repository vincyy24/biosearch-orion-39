from . import views
from django.urls import path


urlpatterns = [
    # Dashboard routes
    path('summary/', views.DashboardSummaryView.as_view(), name='dashboard_summary'),
    path('activity/', views.UserActivityView.as_view(), name='user_activity'),
    path('recent-experiments/', views.RecentExperimentsView.as_view(), name='recent_experiments'),
    path('recent-datasets/', views.RecentDatasetsView.as_view(), name='recent_datasets'),
]