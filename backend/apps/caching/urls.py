from . import views
from django.urls import path

urlpatterns = [
    # Caching example route
    path('data-types/', views.get_data_types, name='get_data_types'),
    path('experiments/', views.get_paginated_experiments, name='get_paginated_experiments'),
    path('experiments/<str:experiment_id>/', views.get_cached_experiment, name='get_cached_experiment'),
    path('clear/', views.clear_cache, name='clear_cache'),
]
