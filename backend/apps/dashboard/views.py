
from django.shortcuts import render
from django.http import JsonResponse
from .models import VoltammetryData
import json

def get_voltammetry_data(request, experiment_id=None):
    """API view to get voltammetry data"""
    if experiment_id:
        try:
            data = VoltammetryData.objects.get(experiment_id=experiment_id)
            return JsonResponse({
                'experiment_id': data.experiment_id,
                'title': data.title,
                'description': data.description,
                'experiment_type': data.experiment_type,
                'scan_rate': data.scan_rate,
                'electrode_material': data.electrode_material,
                'electrolyte': data.electrolyte,
                'temperature': data.temperature,
                'data_points': data.data_points,
                'peak_anodic_current': data.peak_anodic_current,
                'peak_cathodic_current': data.peak_cathodic_current,
                'peak_anodic_potential': data.peak_anodic_potential,
                'peak_cathodic_potential': data.peak_cathodic_potential,
            })
        except VoltammetryData.DoesNotExist:
            return JsonResponse({'error': 'Experiment not found'}, status=404)
    else:
        # Return a list of all experiments (without full data points)
        experiments = VoltammetryData.objects.all().values(
            'experiment_id', 'title', 'experiment_type', 'date_created'
        )
        return JsonResponse({'experiments': list(experiments)})

def voltammetry_dashboard(request):
    """View for the voltammetry dashboard page"""
    experiments = VoltammetryData.objects.all()
    return render(request, 'dashboard/voltammetry.html', {'experiments': experiments})
