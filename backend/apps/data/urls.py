from . import views
from django.urls import path


urlpatterns = [
    # Data routes
    path('data-types/', views.DataTypesList.as_view(), name='data_types_list'),
    path('data-categories/', views.DataCategoriesList.as_view(), name='data_categories_list'),
    path('file-upload/', views.FileUploadView.as_view(), name='file_upload'),
    path('download/', views.DownloadView.as_view(), name='download'),
]