
import json
import uuid
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.core.paginator import Paginator
from django.db.models import Q

from .models_research import ResearchProject, ResearchProjectCollaborator, DatasetComparison
from apps.dashboard.models import VoltammetryData

@login_required
@require_http_methods(["GET", "POST"])
def research_projects(request):
    """Handle research projects listing and creation"""
    if request.method == "GET":
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
    
    elif request.method == "POST":
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

@login_required
@require_http_methods(["GET", "PUT", "DELETE"])
def research_project_detail(request, project_id):
    """Handle individual research project operations"""
    # Get the project
    project = get_object_or_404(ResearchProject, project_id=project_id)
    
    # Check if user has access to this project
    if not has_project_access(request.user, project):
        return JsonResponse({"error": "You don't have access to this project"}, status=403)
    
    if request.method == "GET":
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
    
    elif request.method == "PUT":
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
    
    elif request.method == "DELETE":
        # Delete project
        # Only head researcher can delete
        if project.head_researcher != request.user:
            return JsonResponse({"error": "Only the head researcher can delete this project"}, status=403)
        
        project_title = project.title
        project.delete()
        
        return JsonResponse({
            'message': f'Research project "{project_title}" has been deleted'
        })

@login_required
@require_http_methods(["POST"])
def add_collaborator(request, project_id):
    """Add a collaborator to a research project"""
    project = get_object_or_404(ResearchProject, project_id=project_id)
    
    # Only head researcher or managers can add collaborators
    if not can_manage_project(request.user, project):
        return JsonResponse({"error": "You don't have permission to add collaborators"}, status=403)
    
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

@login_required
@require_http_methods(["PUT", "DELETE"])
def manage_collaborator(request, project_id, collaborator_id):
    """Update or remove a collaborator"""
    project = get_object_or_404(ResearchProject, project_id=project_id)
    
    # Only head researcher or managers can manage collaborators
    if not can_manage_project(request.user, project):
        return JsonResponse({"error": "You don't have permission to manage collaborators"}, status=403)
    
    # Get the collaborator
    collaborator = get_object_or_404(ResearchProjectCollaborator, id=collaborator_id, project=project)
    
    if request.method == "PUT":
        # Update collaborator role
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
    
    elif request.method == "DELETE":
        # Remove collaborator
        username = collaborator.user.username
        collaborator.delete()
        
        return JsonResponse({
            'message': f'Removed {username} from project'
        })

@login_required
@require_http_methods(["POST"])
def assign_experiment(request, project_id):
    """Assign an experiment to a research project"""
    project = get_object_or_404(ResearchProject, project_id=project_id)
    
    # Check if user can contribute to this project
    if not can_contribute_to_project(request.user, project):
        return JsonResponse({"error": "You don't have permission to assign experiments"}, status=403)
    
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

@login_required
@require_http_methods(["POST", "GET"])
def dataset_comparisons(request, project_id=None):
    """Create or list dataset comparisons"""
    if request.method == "POST":
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
    
    elif request.method == "GET":
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

@login_required
@require_http_methods(["GET"])
def comparison_detail(request, comparison_id):
    """Get details of a dataset comparison"""
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
