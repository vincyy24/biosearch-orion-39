from . import views
from django.urls import path


urlpatterns = [
    # Voltammetry data routes
    path('', views.ExperimentDataView.as_view(), name='voltammetry_data_list'),
    path('<str:experiment_id>/', views.ExperimentDataView.as_view(), name='voltammetry_data_detail'),
    path('<str:experiment_id>/raw/', views.ExperimentRawDataView.as_view(), name='voltammetry_raw_data'),
    path('<str:experiment_id>/plot/', views.ExperimentPlotView.as_view(), name='voltammetry_plot'),
    path('export/', views.ExportDataView.as_view(), name='voltammetry_export'),
]