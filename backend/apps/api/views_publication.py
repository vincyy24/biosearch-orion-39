from django.shortcuts import get_object_or_404
from django.http import JsonResponse, HttpResponse, FileResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views import View
from django.conf import settings
import json
import os
import uuid
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from datetime import datetime
import mimetypes
from wsgiref.util import FileWrapper
import traceback
from .models import Publication, PublicationResearcher, Researcher, Dataset
from .models_research import ResearchProject

class PublicationDetail(View):
    def get(self, request, doi=None):
        """Get details for a specific publication by DOI"""
        if not doi:
            return JsonResponse({"error": "DOI is required"}, status=400)
        
        try:
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
                researchers_data.append({
                    "id": researcher.id,
                    "name": researcher.name,
                    "institution": researcher.institution,
                    "email": researcher.email,
                    "orcid_id": researcher.orcid_id,
                    "is_primary": researcher.is_primary,
                    "sequence": researcher.sequence,
                })
            
            data = {
                "id": publication.id,
                "doi": publication.doi,
                "title": publication.title,
                "abstract": publication.abstract,
                "journal": publication.journal,
                "volume": publication.volume,
                "issue": publication.issue,
                "pages": publication.pages,
                "year": publication.year,
                "publisher": publication.publisher,
                "url": publication.url,
                "is_public": publication.is_public,
                "is_peer_reviewed": publication.is_peer_reviewed,
                "created_at": publication.created_at.isoformat(),
                "updated_at": publication.updated_at.isoformat(),
                "researchers": researchers_data,
                "datasets": datasets_data,
            }
            
            return JsonResponse(data)
        except Publication.DoesNotExist:
            return JsonResponse({"error": "Publication not found"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class PublicationRegistration(View):
    @method_decorator(login_required)
    def post(self, request):
        """Register a new publication"""
        try:
            data = json.loads(request.body)

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
                volume=data.get('volume', ''),
                issue=data.get('issue', ''),
                pages=data.get('pages', ''),
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
class PublicationFileUploadView(View):
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

@method_decorator(csrf_exempt, name='dispatch')
class ResearchFileUploadView(View):
    @method_decorator(login_required)
    def post(self, request, project_id=None):
        """Upload a file to a research project"""
        if not project_id:
            return JsonResponse({"error": "Project ID is required"}, status=400)
            
        try:
            project = get_object_or_404(ResearchProject, project_id=project_id)
            
            # Check if the current user is authorized to upload to this project
            if (request.user != project.head_researcher and 
                not project.collaborators.filter(user=request.user).exists()):
                return JsonResponse({"error": "You are not authorized to upload to this project"}, status=403)
            
            # Check if file is in the request
            if 'file' not in request.FILES:
                return JsonResponse({"error": "No file was uploaded"}, status=400)
                
            file = request.FILES['file']
            
            # Generate a unique file name to prevent overwriting
            file_name = f"{uuid.uuid4()}_{file.name}"
            
            # Create directory if it doesn't exist
            upload_path = os.path.join('research', project_id, 'datasets')
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
                is_public=request.POST.get('is_public', 'false').lower() == 'true' and project.is_public,
                research_project=project,
            )
            
            return JsonResponse({
                "message": "File uploaded successfully",
                "dataset_id": dataset.id,
                "file_path": path,
            })
            
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

class PublicationsList(View):
    def get(self, request):
        """Get a list of publications"""
        try:
            publications = Publication.objects.all()
            
            # Handle filters
            query = request.GET.get('query', '')
            is_public = request.GET.get('is_public', None)
            
            if query:
                publications = publications.filter(title__icontains=query) | \
                              publications.filter(doi__icontains=query) | \
                              publications.filter(abstract__icontains=query) | \
                              publications.filter(journal__icontains=query)
            
            if is_public is not None:
                is_public = is_public.lower() == 'true'
                publications = publications.filter(is_public=is_public)
            
            # Pagination
            page = int(request.GET.get('page', 1))
            per_page = int(request.GET.get('per_page', 10))
            start = (page - 1) * per_page
            end = start + per_page
            
            total_count = publications.count()
            publications = publications[start:end]
            
            publications_data = []
            for pub in publications:
                researchers = pub.researchers.all()
                researchers_data = []
                
                for researcher in researchers:
                    researchers_data.append({
                        "id": researcher.id,
                        "name": researcher.name,
                        "institution": researcher.institution,
                        # "is_primary": researcher.is_primary,
                    })
                
                publications_data.append({
                    "id": pub.id,
                    "doi": pub.doi,
                    "title": pub.title,
                    "abstract": pub.abstract,
                    "journal": pub.journal,
                    "year": pub.year,
                    "is_public": pub.is_public,
                    "year": pub.year,
                    "researchers": researchers_data,
                })
            
            return JsonResponse({
                "count": total_count,
                "next": f"/api/publications/?page={page+1}&per_page={per_page}" if end < total_count else None,
                "previous": f"/api/publications/?page={page-1}&per_page={per_page}" if page > 1 else None,
                "results": publications_data,
            })
            
        except Exception as e:
            print(traceback.format_exc())
            return JsonResponse({"error": str(e)}, status=500)

class DatasetDownloadView(View):
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

class PublicationAnalysisView(View):
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
