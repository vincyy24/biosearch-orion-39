from django.urls import path
from . import views


urlpatterns = []


urlpatterns += [
    path('csrf_token/', views.CSRFTokenView.as_view(), name='csrf_token'),
    # Search route
    path('search/', views.SearchView.as_view(), name='search'),
]