from .views import AnalyticsOverviewView, ResearchAnalyticsView, PublicationAnalyticsView, DatasetAnalyticsView, ActivityChartView
from django.urls import path

urlpatterns = [
    # Analytics
    path('', AnalyticsOverviewView.as_view(), name='analytics_overview'),
    path('research/', ResearchAnalyticsView.as_view(), name='research_analytics'),
    path('publications/', PublicationAnalyticsView.as_view(), name='publication_analytics'),
    path('datasets/', DatasetAnalyticsView.as_view(), name='dataset_analytics'),
    path('activity-chart/', ActivityChartView.as_view(), name='activity_chart'),

]
