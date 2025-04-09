from .views import DataTypeListView, DataCategoriesListView, FileUploadCreateView, DownloadView
from django.urls import path


urlpatterns = [
    path('data-types/', DataTypeListView.as_view(), name='data_types_list'),
    path('data-categories/', DataCategoriesListView.as_view(), name='data_categories_list'),
    path('file-upload/', FileUploadCreateView.as_view(), name='file_upload'),
    path('download/', DownloadView.as_view(), name='download'),
]
