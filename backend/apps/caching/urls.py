from .views import get_data_types, get_paginated_experiments, get_cached_experiment, clear_cache
from django.urls import path

urlpatterns = [
    # Caching example route
    path('data-types/', get_data_types, name='get_data_types'),
    path('experiments/', get_paginated_experiments, name='get_paginated_experiments'),
    path('experiments/<str:experiment_id>/', get_cached_experiment, name='get_cached_experiment'),
    path('clear/', clear_cache, name='clear_cache'),
]
