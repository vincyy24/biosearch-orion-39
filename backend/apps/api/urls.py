from django.urls import include, path
from .views import CSRFTokenView, SearchView

# Define common endpoints available outside versioning
common_patterns = [
    # path('csrf_token/', CSRFTokenView.as_view(), name='csrf_token'),
]

# Define v0 API endpoints
v0_patterns = [
    path('search/', SearchView.as_view(), name='search'),
    path('auth/', include('apps.authn.urls')),
    path('users/', include('apps.users.urls')),
    path('data/', include('apps.data.urls')),
    path('collaboration/', include('apps.collaboration.urls')),
    path('research/', include('apps.research.urls')),
    path('experiments/', include('apps.experiments.urls')),
    path('publications/', include('apps.publication.urls')),
    path('dashboard/', include('apps.dashboard.urls')),
    path('analytics/', include('apps.analytics.urls')),
    path('caching/', include('apps.caching.urls')),
]

# Combine both version-specific and common patterns
urlpatterns = common_patterns + [
    # API versioning
    path('v0/', include((v0_patterns, 'v0'))),
    
    # For backward compatibility during migration, duplicate endpoints at root level
    # These should be deprecated after clients move to versioned endpoints
]
