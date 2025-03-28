from django.shortcuts import get_object_or_404
from django.http import JsonResponse
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

from .models import Publication, Researcher, Dataset
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
            
            # Check if publication already exists
            if Publication.objects.filter(doi=data['doi']).exists():
                return JsonResponse({"error": "A publication with this DOI already exists"}, status=400)
            
            # Create the publication
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
            
            # Add researchers
            researchers = data.get('researchers', [])
            for idx, researcher_data in enumerate(researchers):
                # Set the first researcher as primary by default
                is_primary = idx == 0 if 'is_primary' not in researcher_data else researcher_data['is_primary']
                
                researcher = Researcher.objects.create(
                    name=researcher_data.get('name', ''),
                    institution=researcher_data.get('institution', ''),
                    email=researcher_data.get('email', ''),
                    orcid_id=researcher_data.get('orcid_id', ''),
                    is_primary=is_primary,
                    sequence=researcher_data.get('sequence', idx + 1),
                )
                publication.researchers.add(researcher)
            
            return JsonResponse({
                "message": "Publication registered successfully",
                "publication_id": publication.id,
                "doi": publication.doi,
            })
            
        except Exception as e:
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