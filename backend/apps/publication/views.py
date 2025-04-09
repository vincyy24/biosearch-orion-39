from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.http import JsonResponse, FileResponse
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
import json
import mimetypes
import os
import traceback
import uuid

from apps.data.models import Dataset
from apps.research.models import Researcher
from .models import Publication, PublicationResearcher

# Create your views here.

class PublicationListView(APIView):
    """
    API view to list and create publications
    """
    def get(self, request):
        publication_id = request.data.get("publication_id")
    
        if publication_id:
            try:
                publication = Publication.objects.get(id=publication_id)
                return Response({
                'id': publication.id,
                'title': publication.title,
                'author': publication.author,
                'year': publication.year,
                'citations': publication.citations
            })
            except Publication.DoesNotExist:
                return Response({'error': 'Publication not found'}, status=status.HTTP_404_NOT_FOUND)
        publications = Publication.objects.all().values('id', 'doi', 'title', 'author', 'year', 'citations', 'is_public')
        return Response(list(publications))
    
    def post(self, request):
        """
        Create a new publication
        """
        # Get data from request
        title = request.data.get('title')
        authors = request.data.get('authors')
        journal = request.data.get('journal')
        year = request.data.get('year')
        doi = request.data.get('doi')
        abstract = request.data.get('abstract')
        
        # Validate required fields
        if not title or not authors or not journal or not year:
            return Response(
                {'error': 'Title, authors, journal, and year are required fields'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Create the publication
            publication = Publication.objects.create(
                title=title,
                author=", ".join([author['name'] for author in authors]) if isinstance(authors, list) else authors,
                journal=journal,
                year=year,
                doi=doi or "",
                abstract=abstract or "",
                is_public=True,  # Default to public
                user=request.user if request.user.is_authenticated else None
            )
            
            return Response({
                'id': publication.id,
                'title': publication.title,
                'doi': publication.doi,
                'message': 'Publication created successfully'
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PublicationDetailView(APIView):
    def get(self, request, doi: str=None):
        """Get details for a specific publication by DOI"""
        if not doi:
            return JsonResponse({"error": "DOI is required"}, status=400)
        
        try:
            doi = doi.replace("_", "/")
            publication = Publication.objects.get(doi=doi)
            
            # Get publication datasets
            datasets = Dataset.objects.filter(publication__doi=doi)
            datasets_data = []
            
            for dataset in datasets:
                datasets_data.append({
                    "id": dataset.id,
                    "title": dataset.title,
                    "description": dataset.description,
                    "file_path": dataset.file_path,
                    "file_size": dataset.file_size,
                    "file_type": dataset.file_type,
                    "created_at": dataset.created_at.isoformat(),
                    "is_public": dataset.is_public,
                })
            
            # Get researchers
            researchers = publication.researchers.all()
            researchers_data = []
            
            for researcher in researchers:
                pub_researcher = list(PublicationResearcher.objects.filter(publication_id=publication.id, researcher_id=researcher.id))[0]
                researchers_data.append({
                    "id": researcher.id,
                    "name": researcher.name,
                    "institution": researcher.institution,
                    "email": researcher.email,
                    "orcid_id": researcher.orcid_id,
                    "is_primary": pub_researcher.is_primary,
                    "sequence": pub_researcher.sequence,
                })
            
            data = {
                "id": publication.id,
                "doi": publication.doi,
                "title": publication.title,
                "abstract": publication.abstract,
                "journal": publication.journal,
                # "volume": publication.volume,
                # "issue": publication.issue,
                # "pages": publication.pages,
                "year": publication.year,
                "publisher": publication.publisher,
                "url": publication.url,
                "is_public": publication.is_public,
                "is_peer_reviewed": publication.is_peer_reviewed,
                # "created_at": publication.created_at.isoformat(),
                # "updated_at": publication.updated_at.isoformat(),
                "researchers": researchers_data,
                "datasets": datasets_data,
            }
            
            return JsonResponse(data)
        except Publication.DoesNotExist:
            return JsonResponse({"error": "Publication not found"}, status=404)
        except Exception as e:
            print(traceback.format_exc())
            return JsonResponse({"error": str(e)}, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class PublicationRegistrationView(APIView):
    @method_decorator(login_required)
    def post(self, request):
        """Register a new publication"""
        try:
            data = request.data

            # Required fields
            required_fields = ['doi', 'title']
            for field in required_fields:
                if field not in data:
                    return JsonResponse({"error": f"{field} is required"}, status=400)

            # Check if publication already exists by DOI (more reliable than title)
            if Publication.objects.filter(doi=data["doi"]).exists():
                return JsonResponse({
                    "error": "A publication with this DOI already exists",
                    "exists": True,
                    "doi": data["doi"]
                }, status=400)

            # Create the publication first without researchers
            publication = Publication.objects.create(
                doi=data['doi'],
                title=data['title'],
                abstract=data.get('abstract', ''),
                journal=data.get('journal', ''),
                # volume=data.get('volume', ''),
                # issue=data.get('issue', ''),
                # pages=data.get('pages', ''),
                year=data.get('year', None),
                publisher=data.get('publisher', ''),
                url=data.get('url', ''),
                is_public=data.get('is_public', False),
                is_peer_reviewed=data.get('is_peer_reviewed', False),
            )

            # Add researchers through the through model
            researchers = data.get('researchers', [])
            for idx, researcher_data in enumerate(researchers):
                # Get or create researcher to avoid duplicates
                researcher, created = Researcher.objects.get_or_create(
                    orcid_id=researcher_data.get('orcid_id', ''),
                    defaults={
                        'name': researcher_data.get('name', ''),
                        'institution': researcher_data.get('institution', ''),
                        'email': researcher_data.get('email', '')
                    }
                )
                
                # Create through model relationship with sequence and primary status
                is_primary = idx == 0  # First researcher is primary by default
                PublicationResearcher.objects.create(
                    publication=publication,
                    researcher=researcher,
                    is_primary=is_primary,
                    sequence=idx + 1
                )

            return JsonResponse({
                "message": "Publication registered successfully",
                "publication_id": publication.id,
                "doi": publication.doi,
            })
            
        except Exception as e:
            print(traceback.format_exc())
            return JsonResponse({"error": str(e)}, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class PublicationFileUploadView(APIView):
    @method_decorator(login_required)
    def post(self, request, doi=None):
        """Upload a file to a publication"""
        if not doi:
            return JsonResponse({"error": "DOI is required"}, status=400)
            
        try:
            publication = get_object_or_404(Publication, doi=doi)
            
            # Check if file is in the request
            if 'file' not in request.FILES:
                return JsonResponse({"error": "No file was uploaded"}, status=400)
                
            file = request.FILES['file']
            
            # Generate a unique file name to prevent overwriting
            file_name = f"{uuid.uuid4()}_{file.name}"
            
            # Create directory if it doesn't exist
            upload_path = os.path.join('publications', doi, 'datasets')
            full_path = os.path.join(settings.MEDIA_ROOT, upload_path)
            os.makedirs(full_path, exist_ok=True)
            
            # Save the file
            file_path = os.path.join(upload_path, file_name)
            path = default_storage.save(file_path, ContentFile(file.read()))
            
            # Create dataset record
            dataset = Dataset.objects.create(
                title=request.POST.get('title', file.name),
                description=request.POST.get('description', ''),
                file_path=path,
                file_size=file.size,
                file_type=file.content_type,
                is_public=request.POST.get('is_public', 'false').lower() == 'true',
                publication=publication,
            )
            
            return JsonResponse({
                "message": "File uploaded successfully",
                "dataset_id": dataset.id,
                "file_path": path,
            })
            
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

class DatasetDownloadView(APIView):
    def get(self, request, dataset_id=None):
        """Download a dataset file"""
        if not dataset_id:
            return JsonResponse({"error": "Dataset ID is required"}, status=400)
            
        try:
            dataset = get_object_or_404(Dataset, id=dataset_id)
            
            # Check if user has access to this dataset
            if not dataset.is_public:
                if not request.user.is_authenticated:
                    return JsonResponse({"error": "Authentication required to access this dataset"}, status=403)
                
                # If dataset is part of a research project
                if dataset.research_project and request.user != dataset.research_project.head_researcher and not dataset.research_project.collaborators.filter(user=request.user).exists():
                    return JsonResponse({"error": "You do not have permission to access this dataset"}, status=403)
                
                # If dataset is part of a publication (add ownership checks as needed)
                # This is a simplified check and might need to be enhanced based on your requirements
            
            # Get file path
            file_path = os.path.join(settings.MEDIA_ROOT, dataset.file_path)
            
            if not os.path.exists(file_path):
                return JsonResponse({"error": "File not found on server"}, status=404)
            
            # Determine the file's content type
            content_type, encoding = mimetypes.guess_type(file_path)
            if not content_type:
                content_type = 'application/octet-stream'
            
            # Open the file
            file = open(file_path, 'rb')
            response = FileResponse(file, content_type=content_type)
            
            # Set the Content-Disposition header to force a file download
            file_name = os.path.basename(dataset.file_path)
            response['Content-Disposition'] = f'attachment; filename="{file_name}"'
            
            return response
            
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

class PublicationAnalysisView(APIView):
    def get(self, request, doi=None):
        """Get analysis of a publication's datasets"""
        if not doi:
            return JsonResponse({"error": "DOI is required"}, status=400)
            
        try:
            publication = get_object_or_404(Publication, doi=doi)
            datasets = Dataset.objects.filter(publication=publication)
            
            # Mock analysis for demonstration purposes
            # In a real implementation, this would perform actual data analysis
            analysis_results = {
                "publication_info": {
                    "doi": publication.doi,
                    "title": publication.title,
                    "journal": publication.journal,
                    "year": publication.year
                },
                "dataset_count": datasets.count(),
                "total_file_size": sum(d.file_size for d in datasets),
                "data_types": list(datasets.values_list('file_type', flat=True).distinct()),
                "summary_statistics": {
                    "avg_dataset_size": sum(d.file_size for d in datasets) / max(datasets.count(), 1),
                    "date_range": {
                        "oldest": datasets.order_by('created_at').first().created_at.isoformat() if datasets.exists() else None,
                        "newest": datasets.order_by('-created_at').first().created_at.isoformat() if datasets.exists() else None
                    }
                }
            }
            
            return JsonResponse(analysis_results)
            
        except Publication.DoesNotExist:
            return JsonResponse({"error": "Publication not found"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)


class PublicationSearchView(APIView):
    def all(self, request):
        return JsonResponse({"message": "Not implemented yet"})

class DoiVerificationView(APIView):
    def all(self, request):
        return JsonResponse({"message": "Not implemented yet"})
