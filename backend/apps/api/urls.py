
from django.urls import path
from .views import PublicationList, DataTypesList, FileUploadView

urlpatterns = [
    path('publications/', PublicationList.as_view(), name='publication-list'),
    path('data-types/', DataTypesList.as_view(), name='data-types-list'),
    path('upload/', FileUploadView.as_view(), name='file-upload'),
]
