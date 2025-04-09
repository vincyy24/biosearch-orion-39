from django.urls import include, path
from .views import CSRFTokenView, SearchView

urlpatterns = [
    path('csrf_token/', CSRFTokenView.as_view(), name='csrf_token'),
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
