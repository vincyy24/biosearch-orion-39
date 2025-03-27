
from django.core.cache import cache
from django.http import JsonResponse
from django.core.paginator import Paginator
from apps.dashboard.models import VoltammetryData
from django.views.decorators.cache import cache_page

# Cache the results for 5 minutes (300 seconds)
@cache_page(300)
def get_data_types(request):
    """Return all data types with caching"""
    from apps.api.models import DataType
    data_types = list(DataType.objects.all().values())
    return JsonResponse({"data_types": data_types})

def get_paginated_experiments(request):
    """Return paginated experiment data"""
    page = request.GET.get('page', 1)
    page_size = request.GET.get('page_size', 10)
    
    # Get all experiments
    experiments = VoltammetryData.objects.all().order_by('-date_created')
    
    # Paginate the results
    paginator = Paginator(experiments, page_size)
    current_page = paginator.get_page(page)
    
    # Create the response data
    data = {
        'count': paginator.count,
        'num_pages': paginator.num_pages,
        'current_page': int(page),
        'has_next': current_page.has_next(),
        'has_previous': current_page.has_previous(),
        'results': list(current_page.object_list.values(
            'experiment_id', 'title', 'experiment_type', 'date_created'
        ))
    }
    
    return JsonResponse(data)

def get_cached_experiment(request, experiment_id):
    """Get a single experiment with caching"""
    # Try to get from cache first
    cache_key = f'experiment_{experiment_id}'
    experiment = cache.get(cache_key)
    
    if not experiment:
        # If not in cache, get from database
        try:
            data = VoltammetryData.objects.get(experiment_id=experiment_id)
            experiment = {
                'experiment_id': data.experiment_id,
                'title': data.title,
                'description': data.description,
                'experiment_type': data.experiment_type,
                'scan_rate': data.scan_rate,
                'electrode_material': data.electrode_material,
                'electrolyte': data.electrolyte,
                'temperature': data.temperature,
                # Exclude large data_points to save cache space
                'peak_anodic_current': data.peak_anodic_current,
                'peak_cathodic_current': data.peak_cathodic_current,
                'peak_anodic_potential': data.peak_anodic_potential,
                'peak_cathodic_potential': data.peak_cathodic_potential,
            }
            # Save to cache for 10 minutes
            cache.set(cache_key, experiment, 600)
        except VoltammetryData.DoesNotExist:
            return JsonResponse({'error': 'Experiment not found'}, status=404)
    
    return JsonResponse(experiment)
