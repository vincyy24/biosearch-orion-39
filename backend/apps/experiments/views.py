from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from .models import Electrode, Instrument, VoltammetryTechnique


class ExperimentDataView(APIView):
    """
    API view to handle voltammetry data.
    """

    def get(self, request, experiment_id=None):
        from apps.dashboard.models import VoltammetryData

        if experiment_id:
            try:
                experiment = VoltammetryData.objects.get(
                    experiment_id=experiment_id)
                return Response({
                    'id': experiment.experiment_id,
                    'title': experiment.title,
                    'description': experiment.description,
                    'experiment_type': experiment.experiment_type,
                    'scan_rate': experiment.scan_rate,
                    'electrode_material': experiment.electrode_material,
                    'electrolyte': experiment.electrolyte,
                    'temperature': experiment.temperature,
                    'data_points': experiment.data_points,
                    'peak_anodic_current': experiment.peak_anodic_current,
                    'peak_cathodic_current': experiment.peak_cathodic_current,
                    'peak_anodic_potential': experiment.peak_anodic_potential,
                    'peak_cathodic_potential': experiment.peak_cathodic_potential,
                })
            except VoltammetryData.DoesNotExist:
                return Response({'error': 'Experiment not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            experiments = VoltammetryData.objects.all().values(
                'experiment_id', 'title', 'experiment_type', 'date_created'
            )
            return Response(list(experiments))


class ExperimentRawDataView(APIView):
    """
    API view to retrieve raw voltammetry data.
    """

    def get(self, request, experiment_id):
        # Implementation to retrieve raw voltammetry data
        return Response({
            'data': []
        })


class ExperimentPlotView(APIView):
    """
    API view to generate voltammetry plots.
    """

    def get(self, request, experiment_id):
        # Implementation to generate voltammetry plots
        return Response({
            'plot_data': {}
        })


class ExportDataView(APIView):
    """
    API view to export data in various formats.
    """

    def get(self, request):
        # Implementation to export data
        return Response({
            'export_url': ''
        })


# class Methods(APIView):
#     """
#     API view to get the list of methods
#     """
#     permission_classes = [AllowAny]

#     def get(self, request):
#         methods = Method.objects.all().values('id', 'name')
#         return Response(list(methods))


class Electrodes(APIView):
    """
    API view to get the list of electrodes
    """
    permission_classes = [AllowAny]

    def get(self, request):
        electrodes = Electrode.objects.all().values('id', 'type')
        return Response(list(electrodes))


class Instruments(APIView):
    """
    API view to get the list of instruments
    """
    permission_classes = [AllowAny]

    def get(self, request):
        instruments = Instrument.objects.all().values('id', 'name')
        return Response(list(instruments))


class VoltammetryTechniques(APIView):
    """
    API view to get the list of voltammetry techniques
    """
    permission_classes = [AllowAny]

    def get(self, request):
        techniques = VoltammetryTechnique.objects.all().values('id', 'name')
        return Response(list(techniques))
