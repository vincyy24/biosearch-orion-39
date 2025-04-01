from django.urls import path
from .views import CSRFTokenView, SearchView

urlpatterns = [
    path('csrf_token/', CSRFTokenView.as_view(), name='csrf_token'),
    path('search/', SearchView.as_view(), name='search'),
]
