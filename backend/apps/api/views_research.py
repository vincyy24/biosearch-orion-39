import json
import uuid
from datetime import datetime
from rest_framework.views import APIView
from django.http import JsonResponse
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.core.paginator import Paginator
from django.db.models import Q

from .models_research import ResearchProject, ResearchProjectCollaborator, DatasetComparison, OrcidProfile
from apps.dashboard.models import VoltammetryData, FileUpload

@method_decorator(csrf_exempt, name='dispatch')
class ResearchProjects(APIView):
    """Handle research projects listing and creation"""
    @method_decorator(login_required)
    def get(self, request):
        # List projects the user is involved in
        headed_projects = ResearchProject.objects.filter(head_researcher=request.user)
        
        # Projects where user is a collaborator
        collaborated_projects = ResearchProject.objects.filter(
            collaborators__user=request.user
        )
        
        # Combine and remove duplicates
        all_projects = (headed_projects | collaborated_projects).distinct()
        
        # Paginate results
        page = request.GET.get('page', 1)
        page_size = request.GET.get('page_size', 10)
        paginator = Paginator(all_projects.order_by('-created_at'), page_size)
        page_obj = paginator.get_page(page)
        
        # Format results
        results = []
        for project in page_obj:
            results.append({
                'id': project.project_id,
                'title': project.title,
                'description': project.description,
                'status': project.status,
                'is_public': project.is_public,
                'created_at': project.created_at.isoformat(),
                'updated_at': project.updated_at.isoformat(),
                'head_researcher': {
                    'id': project.head_researcher.id,
                    'username': project.head_researcher.username,
                    'email': project.head_researcher.email,
                },
                'is_head': project.head_researcher == request.user,
                'role': get_user_role_in_project(request.user, project),
                'experiments_count': project.experiments.count()
            })
        
        return JsonResponse({
            'count': paginator.count,
            'num_pages': paginator.num_pages,
            'current_page': int(page),
            'has_next': page_obj.has_next(),
            'has_previous': page_obj.has_previous(),
            'results': results
        })

    @method_decorator(login_required)
    def post(self, request):
        # Create a new research project
        try:
            data = json.loads(request.body)
            title = data.get('title')
            description = data.get('description', '')
            is_public = data.get('is_public', False)
            
            if not title:
                return JsonResponse({"error": "Title is required"}, status=400)
            
            # Generate a unique project ID
            project_id = f"RP-{uuid.uuid4().hex[:8].upper()}"
            
            # Create the project
            project = ResearchProject.objects.create(
                project_id=project_id,
                title=title,
                description=description,
                head_researcher=request.user,
                is_public=is_public
            )
            
            return JsonResponse({
                'message': 'Research project created successfully',
                'project': {
                    'id': project.project_id,
                    'title': project.title,
                    'description': project.description,
                    'status': project.status,
                    'is_public': project.is_public,
                    'created_at': project.created_at.isoformat(),
                    'head_researcher': {
                        'id': request.user.id,
                        'username': request.user.username,
                        'email': request.user.email,
                    }
                }
            })
            
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

@method_decorator(csrf_exempt, "dispatch")
class ResearchProjectDetail(APIView):
    """Handle individual research project operations"""
    # Get the project
    
    @method_decorator(login_required)
    def get(self,request, project_id):
        project = _check_access(request.user, project_id)
        # Get project details including collaborators
        collaborators = []
        for collab in project.collaborators.all():
            collaborators.append({
                'id': collab.id,
                'user': {
                    'id': collab.user.id,
                    'username': collab.user.username,
                    'email': collab.user.email,
                    'has_orcid': hasattr(collab.user, 'orcid_profile')
                },
                'role': collab.role,
                'joined_at': collab.joined_at.isoformat()
            })
        
        # Get project experiments
        experiments = []
        for exp in project.experiments.all().order_by('-date_created')[:10]:  # Limit to 10 most recent
            experiments.append({
                'id': exp.experiment_id,
                'title': exp.title,
                'experiment_type': exp.experiment_type,
                'date_created': exp.date_created.isoformat()
            })
        
        return JsonResponse({
            'id': project.project_id,
            'title': project.title,
            'description': project.description,
            'status': project.status,
            'is_public': project.is_public,
            'created_at': project.created_at.isoformat(),
            'updated_at': project.updated_at.isoformat(),
            'head_researcher': {
                'id': project.head_researcher.id,
                'username': project.head_researcher.username,
                'email': project.head_researcher.email,
            },
            'collaborators': collaborators,
            'experiments': experiments,
            'experiments_count': project.experiments.count(),
            'is_head': project.head_researcher == request.user,
            'user_role': get_user_role_in_project(request.user, project)
        })
    
    @method_decorator(login_required)
    def put(self,request, project_id):
        project = self._check_access(request.user, project_id)
        # Update project details
        # Only head researcher or managers can update
        if not can_manage_project(request.user, project):
            return JsonResponse({"error": "You don't have permission to update this project"}, status=403)
        
        try:
            data = json.loads(request.body)
            
            # Update fields
            if 'title' in data:
                project.title = data['title']
            if 'description' in data:
                project.description = data['description']
            if 'is_public' in data:
                project.is_public = data['is_public']
            if 'status' in data and data['status'] in dict(ResearchProject.PROJECT_STATUS):
                project.status = data['status']
            
            project.save()
            
            return JsonResponse({
                'message': 'Research project updated successfully',
                'project': {
                    'id': project.project_id,
                    'title': project.title,
                    'description': project.description,
                    'status': project.status,
                    'is_public': project.is_public,
                    'updated_at': project.updated_at.isoformat(),
                }
            })
            
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    
    @method_decorator(login_required)
    def delete(self,request, project_id):
        project = self._check_access(request.user, project_id)
        # Delete project
        # Only head researcher can delete
        if project.head_researcher != request.user:
            return JsonResponse({"error": "Only the head researcher can delete this project"}, status=403)
        
        project_title = project.title
        project.delete()
        
        return JsonResponse({
            'message': f'Research project "{project_title}" has been deleted'
        })

@method_decorator(csrf_exempt, name='dispatch')
class AddCollaborator(APIView):
    """Add a collaborator to a research project"""
    
    @method_decorator(login_required)
    def post(self, request, project_id):
        project = _check_access(request.user, project_id)
        try:
            data = json.loads(request.body)
            username_or_email = data.get('username_or_email')
            role = data.get('role', 'viewer')
            
            if not username_or_email:
                return JsonResponse({"error": "Username or email is required"}, status=400)
            
            # Check if role is valid
            if role not in dict(ResearchProjectCollaborator.ROLE_CHOICES):
                return JsonResponse({"error": f"Invalid role: {role}"}, status=400)
            
            # Find the user
            try:
                user = User.objects.get(
                    Q(username=username_or_email) | Q(email=username_or_email)
                )
            except User.DoesNotExist:
                return JsonResponse({"error": "User not found"}, status=404)
            
            # Check if user is already the head researcher
            if user == project.head_researcher:
                return JsonResponse({"error": "User is already the head researcher"}, status=400)
            
            # Check if user is already a collaborator
            if ResearchProjectCollaborator.objects.filter(project=project, user=user).exists():
                return JsonResponse({"error": "User is already a collaborator"}, status=400)
            
            # Add collaborator
            collaborator = ResearchProjectCollaborator.objects.create(
                project=project,
                user=user,
                role=role,
                invited_by=request.user
            )
            
            return JsonResponse({
                'message': f'Added {user.username} as a {collaborator.get_role_display().lower()}',
                'collaborator': {
                    'id': collaborator.id,
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email
                    },
                    'role': role,
                    'joined_at': collaborator.joined_at.isoformat()
                }
            })
            
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class ManageCollaborator(APIView):
    """Update or remove a collaborator"""
    # Get the collaborator
    @method_decorator(login_required)
    def put(self, request, collaborator_id, project_id):
        # Update collaborator role
        project = _check_access(request.user, project_id)
        collaborator = get_object_or_404(ResearchProjectCollaborator, id=collaborator_id, project=project)
        try:
            data = json.loads(request.body)
            role = data.get('role')
            
            if not role:
                return JsonResponse({"error": "Role is required"}, status=400)
            
            # Check if role is valid
            if role not in dict(ResearchProjectCollaborator.ROLE_CHOICES):
                return JsonResponse({"error": f"Invalid role: {role}"}, status=400)
            
            collaborator.role = role
            collaborator.save()
            
            return JsonResponse({
                'message': f'Updated role for {collaborator.user.username} to {collaborator.get_role_display().lower()}',
                'collaborator': {
                    'id': collaborator.id,
                    'user': {
                        'id': collaborator.user.id,
                        'username': collaborator.user.username,
                        'email': collaborator.user.email
                    },
                    'role': role
                }
            })
            
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    
    @method_decorator(login_required)
    def delete(self, request, collaborator_id, project_id):
        # Remove collaborator
        project = _check_access(request.user, project_id)
        collaborator = get_object_or_404(ResearchProjectCollaborator, id=collaborator_id, project=project)
        username = collaborator.user.username
        collaborator.delete()
        
        return JsonResponse({
            'message': f'Removed {username} from project'
        })

@method_decorator(csrf_exempt, name='dispatch')
class AssignExperiment(APIView):
    """Assign an experiment to a research project"""
    @method_decorator(login_required)
    def post(self, request, project_id):
        project = _check_access(request.user, project_id)
        try:
            data = json.loads(request.body)
            experiment_id = data.get('experiment_id')
            
            if not experiment_id:
                return JsonResponse({"error": "Experiment ID is required"}, status=400)
            
            # Get the experiment
            experiment = get_object_or_404(VoltammetryData, experiment_id=experiment_id)
            
            # Assign to project
            experiment.research_project = project
            experiment.save()
            
            return JsonResponse({
                'message': f'Experiment "{experiment.title}" assigned to project',
                'experiment': {
                    'id': experiment.experiment_id,
                    'title': experiment.title,
                    'experiment_type': experiment.experiment_type,
                    'date_created': experiment.date_created.isoformat()
                }
            })
            
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class DatasetComparisons(APIView):
    """Create or list dataset comparisons"""
    
    @method_decorator(login_required)
    def post(self, request):
        try:
            data = json.loads(request.body)
            title = data.get('title')
            description = data.get('description', '')
            dataset_ids = data.get('dataset_ids', [])
            is_public = data.get('is_public', False)
            
            if not title:
                return JsonResponse({"error": "Title is required"}, status=400)
            
            if not dataset_ids or len(dataset_ids) < 2:
                return JsonResponse({"error": "At least two datasets are required for comparison"}, status=400)
            
            # Validate dataset IDs
            datasets = []
            for dataset_id in dataset_ids:
                try:
                    dataset = VoltammetryData.objects.get(experiment_id=dataset_id)
                    datasets.append(dataset)
                except VoltammetryData.DoesNotExist:
                    return JsonResponse({"error": f"Dataset {dataset_id} not found"}, status=404)
            
            # Check if user has access to all datasets
            for dataset in datasets:
                if dataset.research_project and not has_project_access(request.user, dataset.research_project) and not dataset.research_project.is_public:
                    return JsonResponse({"error": f"You don't have access to dataset {dataset.experiment_id}"}, status=403)
            
            # Generate a unique comparison ID
            comparison_id = f"CMP-{uuid.uuid4().hex[:8].upper()}"
            
            # Create the comparison
            # In a real system, this would trigger a background job for comparison calculation
            comparison = DatasetComparison.objects.create(
                comparison_id=comparison_id,
                title=title,
                description=description,
                created_by=request.user,
                datasets=dataset_ids,
                is_public=is_public,
                # Simulated comparison results
                comparison_results={
                    "summary": "Comparison between multiple datasets",
                    "correlation": 0.87,
                    "peak_differences": {
                        "anodic": [0.02, 0.05, 0.03],
                        "cathodic": [0.04, 0.02, 0.01]
                    }
                }
            )
            
            return JsonResponse({
                'message': 'Dataset comparison created successfully',
                'comparison': {
                    'id': comparison.comparison_id,
                    'title': comparison.title,
                    'description': comparison.description,
                    'created_at': comparison.created_at.isoformat(),
                    'dataset_count': len(dataset_ids)
                }
            })
            
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    
    @method_decorator(login_required)
    def get(self, request, project_id=None):
        # List comparisons
        # If project_id is provided, filter by project
        if project_id:
            project = get_object_or_404(ResearchProject, project_id=project_id)
            
            # Check if user has access to project
            if not has_project_access(request.user, project) and not project.is_public:
                return JsonResponse({"error": "You don't have access to this project"}, status=403)
            
            # Get experiments in project
            project_experiments = project.experiments.values_list('experiment_id', flat=True)
            
            # Get comparisons containing these experiments
            comparisons = DatasetComparison.objects.filter(
                Q(datasets__contains=list(project_experiments)) | 
                Q(created_by=request.user)
            ).distinct()
        else:
            # Get user's comparisons or public ones
            comparisons = DatasetComparison.objects.filter(
                Q(created_by=request.user) | Q(is_public=True)
            ).distinct()
        
        # Paginate results
        page = request.GET.get('page', 1)
        page_size = request.GET.get('page_size', 10)
        paginator = Paginator(comparisons.order_by('-created_at'), page_size)
        page_obj = paginator.get_page(page)
        
        # Format results
        results = []
        for comparison in page_obj:
            results.append({
                'id': comparison.comparison_id,
                'title': comparison.title,
                'description': comparison.description,
                'created_at': comparison.created_at.isoformat(),
                'dataset_count': len(comparison.datasets),
                'is_public': comparison.is_public,
                'created_by': {
                    'id': comparison.created_by.id,
                    'username': comparison.created_by.username
                }
            })
        
        return JsonResponse({
            'count': paginator.count,
            'num_pages': paginator.num_pages,
            'current_page': int(page),
            'has_next': page_obj.has_next(),
            'has_previous': page_obj.has_previous(),
            'results': results
        })

@method_decorator(csrf_exempt, name='dispatch')
class ComparisonDetail(APIView):
    """Get details of a dataset comparison"""
    def get(self, request, comparison_id):
        comparison = get_object_or_404(DatasetComparison, comparison_id=comparison_id)
        
        # Check access
        if comparison.created_by != request.user and not comparison.is_public:
            # Check if user has access to any of the datasets' projects
            has_access = False
            for dataset_id in comparison.datasets:
                try:
                    dataset = VoltammetryData.objects.get(experiment_id=dataset_id)
                    if dataset.research_project and has_project_access(request.user, dataset.research_project):
                        has_access = True
                        break
                except VoltammetryData.DoesNotExist:
                    continue
            
            if not has_access:
                return JsonResponse({"error": "You don't have access to this comparison"}, status=403)
        
        # Get dataset details
        datasets = []
        for dataset_id in comparison.datasets:
            try:
                dataset = VoltammetryData.objects.get(experiment_id=dataset_id)
                datasets.append({
                    'id': dataset.experiment_id,
                    'title': dataset.title,
                    'experiment_type': dataset.experiment_type,
                    'scan_rate': dataset.scan_rate,
                    'electrode_material': dataset.electrode_material
                })
            except VoltammetryData.DoesNotExist:
                datasets.append({
                    'id': dataset_id,
                    'title': 'Unknown dataset',
                    'error': 'Dataset not found'
                })
        
        return JsonResponse({
            'id': comparison.comparison_id,
            'title': comparison.title,
            'description': comparison.description,
            'created_at': comparison.created_at.isoformat(),
            'updated_at': comparison.updated_at.isoformat(),
            'is_public': comparison.is_public,
            'created_by': {
                'id': comparison.created_by.id,
                'username': comparison.created_by.username
            },
            'datasets': datasets,
            'results': comparison.comparison_results
        })

@method_decorator(csrf_exempt, name='dispatch')
class InviteCollaboratorView(View):
    """Handle invitations to collaborate on research projects"""
    
    @method_decorator(login_required)
    def post(self, request, project_id):
        """Send invitation to a user to collaborate on a project"""
        project = get_object_or_404(ResearchProject, project_id=project_id)
        
        # Check if user has permission to invite collaborators
        if not can_manage_project(request.user, project):
            return JsonResponse({"error": "You don't have permission to invite collaborators"}, status=403)
        
        try:
            data = json.loads(request.body)
            email = data.get('email')
            orcid_id = data.get('orcid_id')
            role = data.get('role', 'viewer')
            
            if not email and not orcid_id:
                return JsonResponse({"error": "Email or ORCID ID is required"}, status=400)
            
            # Check if role is valid
            if role not in dict(ResearchProjectCollaborator.ROLE_CHOICES):
                return JsonResponse({"error": f"Invalid role: {role}"}, status=400)
            
            # Try to find user by email or ORCID ID
            user = None
            
            if email:
                try:
                    user = User.objects.get(email=email)
                    # Send notification to the user
                    # This would need a notification model in a real app
                    
                except User.DoesNotExist:
                    # User not found, store invitation in database and send email
                    # Create pending invitation in database
                    # This would need an invitation model in a real app
                    
                    # Send invitation email
                    # This would need an email service in a real app
                    
                    return JsonResponse({
                        'message': f'Invitation sent to {email}',
                        'status': 'pending',
                        'recipient': email
                    })
            
            if orcid_id and not user:
                try:
                    orcid_profile = OrcidProfile.objects.get(orcid_id=orcid_id)
                    user = orcid_profile.user
                    
                    # Send notification to the user
                    # This would need a notification model in a real app
                    
                except OrcidProfile.DoesNotExist:
                    # User not found, store invitation in database 
                    # This would need an invitation model in a real app
                    
                    # Try to get email from ORCID API and send invitation
                    # This would need integration with ORCID API in a real app
                    
                    return JsonResponse({
                        'message': f'Invitation sent to ORCID ID {orcid_id}',
                        'status': 'pending',
                        'recipient': orcid_id
                    })
            
            if user:
                # Check if user is already the head researcher
                if user == project.head_researcher:
                    return JsonResponse({"error": "User is already the head researcher"}, status=400)
                
                # Check if user is already a collaborator
                if ResearchProjectCollaborator.objects.filter(project=project, user=user).exists():
                    return JsonResponse({"error": "User is already a collaborator"}, status=400)
                
                # Add collaborator
                collaborator = ResearchProjectCollaborator.objects.create(
                    project=project,
                    user=user,
                    role=role,
                    invited_by=request.user
                )
                
                # Send notification to user (would be implemented in a real system)
                
                return JsonResponse({
                    'message': f'Added {user.username} as a {collaborator.get_role_display().lower()}',
                    'collaborator': {
                        'id': collaborator.id,
                        'user': {
                            'id': user.id,
                            'username': user.username,
                            'email': user.email
                        },
                        'role': role,
                        'joined_at': collaborator.joined_at.isoformat()
                    }
                })
                
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class ResearchVersionsView(View):
    """Handle version history for research projects"""
    
    def get(self, request, project_id):
        """Get version history for a research project"""
        project = get_object_or_404(ResearchProject, project_id=project_id)
        
        # Check if user has access to this project
        if not has_project_access(request.user, project) and not project.is_public:
            return JsonResponse({"error": "You don't have access to this project"}, status=403)
        
        # In a real system, version history would be stored in a database
        # Here, we'll return some sample data
        versions = [
            {
                'version': 'v1.0.0',
                'updated_at': '2023-08-15T10:30:00Z',
                'updated_by': {
                    'id': project.head_researcher.id,
                    'username': project.head_researcher.username
                },
                'changes': 'Initial version'
            },
            {
                'version': 'v1.1.0',
                'updated_at': '2023-09-01T14:45:00Z',
                'updated_by': {
                    'id': project.head_researcher.id,
                    'username': project.head_researcher.username
                },
                'changes': 'Added new experimental data'
            },
            {
                'version': 'v1.2.0',
                'updated_at': '2023-09-15T09:15:00Z',
                'updated_by': {
                    'id': project.head_researcher.id,
                    'username': project.head_researcher.username
                },
                'changes': 'Updated analysis methodology'
            }
        ]
        
        return JsonResponse({
            'project_id': project.project_id,
            'title': project.title,
            'versions': versions
        })

@method_decorator(csrf_exempt, name='dispatch')
class ResearchUpload(APIView):
    """Handle file uploads for research projects"""

    @method_decorator(login_required)
    def post(self, request):
        try:
            # Check if a file is included in the request
            if 'file' not in request.FILES:
                return JsonResponse({"error": "No file provided"}, status=400)

            uploaded_file = request.FILES['file']

            # Ensure the file is a text file
            if not uploaded_file.content_type.startswith('text/'):
                return JsonResponse({"error": "Only text files are allowed"}, status=400)

            # Read the file content
            file_content = uploaded_file.read().decode('utf-8')

            # Save the file content to the database
            from apps.dashboard.models import FileUpload  # Import the model
            file_upload = FileUpload.objects.create(
                uploaded_by=request.user,
                file_name=uploaded_file.name,
                content=file_content
            )

            return JsonResponse({
                "message": "File uploaded and saved successfully",
                "file": {
                    "id": file_upload.id,
                    "file_name": file_upload.file_name,
                    "uploaded_at": file_upload.uploaded_at.isoformat(),
                    "version": file_upload.version
                }
            })

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class ResearchFileUploadView(View):
    """Handle file uploads for research projects with text content storage"""

    @method_decorator(login_required)
    def post(self, request, project_id=None):
        try:
            # Check if project_id is provided
            if project_id:
                project = _check_access(request.user, project_id)
                
                # Check if user is head researcher or can contribute
                if not (project.head_researcher == request.user or can_contribute_to_project(request.user, project)):
                    return JsonResponse({"error": "You don't have permission to upload files to this project"}, status=403)
            
            # Get file content and metadata
            file_content = request.POST.get('file_content')
            file_name = request.POST.get('file_name')
            description = request.POST.get('description', '')
            experiment_type = request.POST.get('experiment_type', 'other')
            is_public = request.POST.get('is_public', 'false').lower() == 'true'
            
            if not file_content or not file_name:
                return JsonResponse({"error": "File content and file name are required"}, status=400)
            
            # Create new file upload record
            file_upload = FileUpload.objects.create(
                uploaded_by=request.user,
                file_name=file_name,
                content=file_content,
                description=description,
                experiment_type=experiment_type,
                is_public=is_public,
                research_project=project if project_id else None
            )

            return JsonResponse({
                "message": "File uploaded and saved successfully",
                "file": {
                    "id": file_upload.id,
                    "file_name": file_upload.file_name,
                    "uploaded_at": file_upload.uploaded_at.isoformat(),
                    "version": file_upload.version
                }
            })

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class ResearchFileVersionView(View):
    """Handle file versions and updates"""

    @method_decorator(login_required)
    def get(self, request, file_id):
        """Get all versions of a file"""
        try:
            # Get the original file
            original_file = get_object_or_404(FileUpload, id=file_id)
            
            # Check if user has access to the file
            if original_file.uploaded_by != request.user and (
                (original_file.research_project and not has_project_access(request.user, original_file.research_project)) and
                not original_file.is_public
            ):
                return JsonResponse({"error": "You don't have access to this file"}, status=403)
            
            # Get all versions of the file
            # In a real scenario, we would query versions based on a relationship field
            # For this example, we're returning a mock response
            versions = [
                {
                    "id": original_file.id,
                    "version": original_file.version,
                    "uploaded_at": original_file.uploaded_at.isoformat(),
                    "uploaded_by": {
                        "id": original_file.uploaded_by.id,
                        "username": original_file.uploaded_by.username
                    },
                    "changes": "Initial version"
                }
            ]
            
            # Add sample newer versions if this is version 1
            if original_file.version == 1:
                # Mock additional versions
                newer_date = datetime.now().isoformat()
                versions.append({
                    "id": f"{original_file.id}-v2",
                    "version": 2,
                    "uploaded_at": newer_date,
                    "uploaded_by": {
                        "id": original_file.uploaded_by.id,
                        "username": original_file.uploaded_by.username
                    },
                    "changes": "Updated data values"
                })
            
            return JsonResponse({
                "file_name": original_file.file_name,
                "versions": versions
            })
            
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    
    @method_decorator(login_required)
    def post(self, request, file_id):
        """Create a new version of a file"""
        try:
            # Get the original file
            original_file = get_object_or_404(FileUpload, id=file_id)
            
            # Check if user has access to modify the file
            if original_file.uploaded_by != request.user and (
                original_file.research_project and 
                not can_contribute_to_project(request.user, original_file.research_project)
            ):
                return JsonResponse({"error": "You don't have permission to modify this file"}, status=403)
            
            # Get new content and change description
            file_content = request.POST.get('file_content')
            changes = request.POST.get('changes', 'Updated version')
            
            if not file_content:
                return JsonResponse({"error": "New file content is required"}, status=400)
            
            # Create new version
            new_version = original_file.create_new_version(file_content)
            
            return JsonResponse({
                "message": "New version created successfully",
                "file": {
                    "id": new_version.id,
                    "file_name": new_version.file_name,
                    "uploaded_at": new_version.uploaded_at.isoformat(),
                    "version": new_version.version
                }
            })
            
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class ResearchFileDownloadView(View):
    """Handle file downloads with different format options"""

    @method_decorator(login_required)
    def get(self, request, file_id):
        try:
            # Get the file
            file_upload = get_object_or_404(FileUpload, id=file_id)
            
            # Check if user has access to the file
            if file_upload.uploaded_by != request.user and (
                (file_upload.research_project and not has_project_access(request.user, file_upload.research_project)) and
                not file_upload.is_public
            ):
                return JsonResponse({"error": "You don't have access to this file"}, status=403)
            
            # Get format parameter (csv, tsv, or custom)
            format_type = request.GET.get('format', 'csv')
            delimiter = request.GET.get('delimiter', ',')
            
            # Process content based on format
            if format_type == 'csv':
                content = file_upload.export_as_csv()
                content_type = 'text/csv'
                file_extension = 'csv'
            elif format_type == 'tsv':
                content = file_upload.export_as_tsv()
                content_type = 'text/tab-separated-values'
                file_extension = 'tsv'
            else:
                content = file_upload.export_with_delimiter(delimiter)
                content_type = 'text/plain'
                file_extension = 'txt'
            
            # Create filename
            filename = f"{file_upload.file_name}_v{file_upload.version}.{file_extension}"
            
            # Add headers for file download
            response = JsonResponse({"content": content})
            response['Content-Type'] = content_type
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            
            return response
            
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

# Helper functions
def has_project_access(user, project):
    """Check if a user has access to a project"""
    # Head researcher always has access
    if project.head_researcher == user:
        return True
    
    # Public projects are accessible to all
    if project.is_public:
        return True
    
    # Check if user is a collaborator
    return ResearchProjectCollaborator.objects.filter(project=project, user=user).exists()

def can_manage_project(user, project):
    """Check if a user can manage a project"""
    # Head researcher can always manage
    if project.head_researcher == user:
        return True
    
    # Check if user is a manager
    return ResearchProjectCollaborator.objects.filter(
        project=project, user=user, role='manager'
    ).exists()

def can_contribute_to_project(user, project):
    """Check if a user can contribute to a project"""
    # Head researcher and managers can contribute
    if can_manage_project(user, project):
        return True
    
    # Check if user is a contributor
    return ResearchProjectCollaborator.objects.filter(
        project=project, user=user, role__in=['contributor', 'manager']
    ).exists()

def get_user_role_in_project(user, project):
    """Get the user's role in a project"""
    if project.head_researcher == user:
        return 'head'
    
    try:
        collaborator = ResearchProjectCollaborator.objects.get(project=project, user=user)
        return collaborator.role
    except ResearchProjectCollaborator.DoesNotExist:
        return None

def _check_access(user, project_id):
        project = get_object_or_404(ResearchProject, project_id=project_id)
        # Check if user has access to this project
        if not has_project_access(user, project):
            return JsonResponse({"error": "You don't have access to this project"}, status=403)
        return project

# Add these URL patterns to your urls.py
"""
path('research/projects/<str:project_id>/upload/', ResearchFileUploadView.as_view(), name='research_file_upload'),
path('research/files/<int:file_id>/versions/', ResearchFileVersionView.as_view(), name='research_file_versions'),
path('research/files/<int:file_id>/download/', ResearchFileDownloadView.as_view(), name='research_file_download'),
"""
