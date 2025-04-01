from .views import DashboardSummaryView, UserActivityView, RecentExperimentsView, RecentDatasetsView
from django.urls import path


urlpatterns = [
    # Dashboard routes
    path('summary/',DashboardSummaryView.as_view(), name='dashboard_summary'),
    path('activity/',UserActivityView.as_view(), name='user_activity'),
    path('recent-experiments/',RecentExperimentsView.as_view(), name='recent_experiments'),
    path('recent-datasets/',RecentDatasetsView.as_view(), name='recent_datasets'),
]