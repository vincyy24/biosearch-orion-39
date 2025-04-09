from django.shortcuts import render
from django.http import JsonResponse
from .models import VoltammetryData
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import FileUpload

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

def search_voltammetry_data(request):
    """Advanced search API with filters"""
    query = request.GET.get('query', '')
    experiment_type = request.GET.get('experiment_type', '')
    electrode_material = request.GET.get('electrode_material', '')
    date_from = request.GET.get('date_from', '')
    date_to = request.GET.get('date_to', '')
    
    # Start with all objects
    queryset = VoltammetryData.objects.all()
    
    # Apply search query if provided
    if query:
        queryset = queryset.filter(
            Q(title__icontains=query) |
            Q(description__icontains=query) |
            Q(experiment_id__icontains=query) |
            Q(electrode_material__icontains=query) |
            Q(electrolyte__icontains=query)
        )
    
    # Apply filters
    if experiment_type:
        queryset = queryset.filter(experiment_type=experiment_type)
    if electrode_material:
        queryset = queryset.filter(electrode_material__icontains=electrode_material)
    if date_from:
        queryset = queryset.filter(date_created__gte=date_from)
    if date_to:
        queryset = queryset.filter(date_created__lte=date_to)
    
    # Convert results to list of dictionaries (without full data points)
    results = queryset.values(
        'experiment_id', 'title', 'experiment_type', 'electrode_material',
        'date_created', 'scan_rate'
    )
    
    # Include total count for pagination
    count = queryset.count()
    
    return JsonResponse({
        'results': list(results), 
        'count': count
    })

def get_search_suggestions(request):
    """API endpoint for search autocomplete suggestions"""
    query = request.GET.get('query', '')
    if not query or len(query) < 2:
        return JsonResponse({'suggestions': []})
    
    # Get suggestions from different fields
    title_suggestions = VoltammetryData.objects.filter(
        title__icontains=query
    ).values_list('title', flat=True).distinct()[:5]
    
    electrode_suggestions = VoltammetryData.objects.filter(
        electrode_material__icontains=query
    ).values_list('electrode_material', flat=True).distinct()[:3]
    
    electrolyte_suggestions = VoltammetryData.objects.filter(
        electrolyte__icontains=query
    ).values_list('electrolyte', flat=True).distinct()[:3]
    
    # Combine all suggestions
    all_suggestions = list(title_suggestions) + list(electrode_suggestions) + list(electrolyte_suggestions)
    
    return JsonResponse({'suggestions': all_suggestions[:10]})


class DashboardSummaryView(APIView):
    """
    API view to retrieve dashboard summary data.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Implementation to retrieve dashboard summary data
        return Response({
            'datasets_count': 42,
            'recent_datasets': [],
            'publications_count': 18,
            'recent_publications': [],
            'projects_count': 7,
            'recent_projects': []
        })


class UserActivityView(APIView):
    """
    API view to retrieve user activity data.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Implementation to retrieve user activity data
        return Response({
            'activities': []
        })


class RecentExperimentsView(APIView):
    """
    API view to retrieve recent experiments.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Implementation to retrieve recent experiments
        return Response({
            'experiments': []
        })


class RecentDatasetsView(APIView):
    """
    API view to get recent public datasets for the homepage.
    """
    def get(self, request):
        recent_datasets = FileUpload.objects.filter().order_by('-created_at')[:5]
        datasets = []
        for dataset in recent_datasets:
            datasets.append({
                'id': dataset.id,
                'title': dataset.file_name,
                'description': dataset.description,
                'category': dataset.data_type.name if dataset.data_type else "Unknown",
                'access': 'public',
                'author': dataset.user.username,
                'date': dataset.upload_date.isoformat(),
                'downloads': dataset.downloads_count,
                'method': dataset.method,
                'electrode': dataset.electrode_type,
                'instrument': dataset.instrument,
            })
        return Response(datasets)

