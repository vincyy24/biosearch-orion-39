
from django.db import models
from django.contrib.auth.models import User

class OrcidProfile(models.Model):
    """Model for storing ORCID profile information"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='orcid_profile')
    orcid_id = models.CharField(max_length=19, unique=True)  # Format: 0000-0000-0000-0000
    is_verified = models.BooleanField(default=False)
    verification_token = models.CharField(max_length=64, blank=True, null=True)
    token_expiry = models.DateTimeField(blank=True, null=True)
    verified_at = models.DateTimeField(blank=True, null=True)
    orcid_data = models.JSONField(blank=True, null=True)  # Stores the raw profile data from ORCID
    
    def __str__(self):
        return f"ORCID: {self.orcid_id} ({self.user.username})"
    
    class Meta:
        verbose_name = "ORCID Profile"
        verbose_name_plural = "ORCID Profiles"

class ResearchProject(models.Model):
    """Model for research projects that can have multiple collaborators"""
    PROJECT_STATUS = (
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('archived', 'Archived'),
    )
    
    project_id = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    head_researcher = models.ForeignKey(User, on_delete=models.CASCADE, related_name='headed_projects')
    is_public = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=PROJECT_STATUS, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.title} ({self.project_id})"
    
    class Meta:
        verbose_name = "Research Project"
        verbose_name_plural = "Research Projects"
    
    def add_collaborator(self, user, role='viewer'):
        """Add a collaborator to the project"""
        return ResearchCollaborator.objects.create(
            project=self,
            user=user,
            role=role
        )
    
    def remove_collaborator(self, user):
        """Remove a collaborator from the project"""
        ResearchCollaborator.objects.filter(project=self, user=user).delete()
    
    def get_collaborators(self):
        """Get all collaborators for this project"""
        return self.collaborators.all()
    
    def get_experiments(self):
        """Get all experiments associated with this project"""
        from apps.dashboard.models import VoltammetryData
        return VoltammetryData.objects.filter(research_project=self)

class ResearchCollaborator(models.Model):
    """Model for collaborators on a research project"""
    ROLE_CHOICES = (
        ('viewer', 'Viewer'),
        ('contributor', 'Contributor'),
        ('manager', 'Manager'),
    )
    
    project = models.ForeignKey(ResearchProject, on_delete=models.CASCADE, related_name='collaborators')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='research_collaborations')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='viewer')
    joined_at = models.DateTimeField(auto_now_add=True)
    invited_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='sent_invitations')
    
    class Meta:
        verbose_name = "Research Collaborator"
        verbose_name_plural = "Research Collaborators"
        unique_together = ('project', 'user')
    
    def __str__(self):
        return f"{self.user.username} - {self.get_role_display()} on {self.project.title}"

class DatasetComparison(models.Model):
    """Model for comparing multiple datasets"""
    comparison_id = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_comparisons')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_public = models.BooleanField(default=False)
    
    # Store the experiment IDs and comparison results as JSON
    datasets = models.JSONField(default=list)  # List of experiment_ids
    comparison_results = models.JSONField(default=dict)
    
    def __str__(self):
        return f"{self.title} ({self.comparison_id})"
    
    class Meta:
        verbose_name = "Dataset Comparison"
        verbose_name_plural = "Dataset Comparisons"
