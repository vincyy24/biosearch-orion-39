from . import views
from django.urls import path


urlpatterns = [
    # Publication routes
    path('', views.PublicationList.as_view(), name='publication_list'),
    path('register/', views.PublicationRegistration.as_view(), name='register_publication'),
    path('<str:doi>/', views.PublicationDetail.as_view(), name='publication_detail'),
    path('<str:doi>/upload/', views.PublicationFileUploadView.as_view(), name='upload_dataset'),
    path('<str:doi>/upload-text/', views.PublicationFileUploadView.as_view(), name='upload_dataset_as_text'),
    path('<str:doi>/analysis/', views.PublicationAnalysisView.as_view(), name='publication_analysis'),
]
