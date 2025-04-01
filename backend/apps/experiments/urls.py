from .views import ExperimentDataView, ExperimentRawDataView, ExperimentPlotView, ExportDataView, Electrodes, Instruments, VoltammetryTechniques
from django.urls import path


urlpatterns = [
    # Voltammetry data routes
    path('', ExperimentDataView.as_view(), name='voltammetry_data_list'),
    path('<str:experiment_id>/', ExperimentDataView.as_view(), name='voltammetry_data_detail'),
    path('<str:experiment_id>/raw/', ExperimentRawDataView.as_view(), name='voltammetry_raw_data'),
    path('<str:experiment_id>/plot/', ExperimentPlotView.as_view(), name='voltammetry_plot'),
    path('export/', ExportDataView.as_view(), name='voltammetry_export'),

    # path('methods/', Methods.as_view(), name='methods'),
    path('electrodes/', Electrodes.as_view(), name='electrodes'),
    path('instruments/', Instruments.as_view(), name='instruments'),
    path('techniques/', VoltammetryTechniques.as_view(), name='voltammetry_techniques'),
]