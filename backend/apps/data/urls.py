from .views import DataTypesListView, DataCategoriesListView, FileUploadView, DownloadView
from django.urls import path


urlpatterns = [
    path('data-types/', DataTypesListView.as_view(), name='data_types_list'),
    path('data-categories/', DataCategoriesListView.as_view(), name='data_categories_list'),
    path('file-upload/', FileUploadView.as_view(), name='file_upload'),
    path('download/', DownloadView.as_view(), name='download'),
]
