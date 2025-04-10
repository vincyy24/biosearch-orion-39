from .views import PublicationListView, PublicationDetailView, PublicationRegistrationView, PublicationFileUploadView, PublicationAnalysisView, MyPublicationListView
from django.urls import path


urlpatterns = [
    # Publication routes
    path('', PublicationListView.as_view(), name='publication_list'),
    path('my/', MyPublicationListView.as_view(), name='publication_list'),
    path('register/', PublicationRegistrationView.as_view(), name='register_publication'),
    path('<str:doi>/', PublicationDetailView.as_view(), name='publication_detail'),
    path('<str:doi>/upload/', PublicationFileUploadView.as_view(), name='upload_dataset'),
    path('<str:doi>/upload-text/', PublicationFileUploadView.as_view(), name='upload_dataset_as_text'),
    path('<str:doi>/analysis/', PublicationAnalysisView.as_view(), name='publication_analysis'),
]
