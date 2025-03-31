from . import views
from django.urls import path

urlpatterns = [
    # Analytics
    path('overview/', views.AnalyticsOverviewView.as_view(), name='analytics_overview'),
    path('research/', views.ResearchAnalyticsView.as_view(), name='research_analytics'),
    path('publications/', views.PublicationAnalyticsView.as_view(), name='publication_analytics'),
    path('datasets/', views.DatasetAnalyticsView.as_view(), name='dataset_analytics'),
]
