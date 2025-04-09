from django.db import models
from django.contrib.auth.models import User

from apps.collaboration.models import ResearchCollaborator
from apps.common.models import TimeStampedModel


class Research(TimeStampedModel):
    """Model for researches that can have multiple collaborators"""
    STATUS = (
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('under_review', 'Under Peer Review'),
        ('archived', 'Archived'),
    )

    research_id = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    head_researcher = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='headed_researches')
    collaborators = models.ForeignKey(
        'collaboration.ResearchCollaborator', on_delete=models.CASCADE, related_name='researches')
    status = models.CharField(max_length=20, choices=STATUS, default='active')

    def __str__(self):
        return f"{self.title} ({self.research_id})"

    class Meta:
        verbose_name = "Research"
        verbose_name_plural = "Researches"

    def add_collaborator(self, user, role='viewer'):
        """Add a collaborator to the research"""
        return ResearchCollaborator.objects.create(
            research=self,
            user=user,
            role=role
        )

    def remove_collaborator(self, user):
        """Remove a collaborator from the research"""
        ResearchCollaborator.objects.filter(research=self, user=user).delete()

    def get_collaborators(self):
        """Get all collaborators for this research"""
        return self.collaborators.all()

    def get_experiments(self):
        """Get all experiments associated with this research"""
        from apps.dashboard.models import VoltammetryData
        return VoltammetryData.objects.filter(research=self)


class Researcher(models.Model):
    name = models.CharField(max_length=255)
    institution = models.CharField(max_length=255, blank=True, default='')
    email = models.EmailField(blank=True, default='')
    orcid_id = models.CharField(max_length=255, blank=True, default='')

    user_account = models.OneToOneField(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='researcher_profile'
    )

    def __str__(self):
        return self.name


class ResearchLibrary(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='research_library')
    research_title = models.CharField(max_length=255)
    research_url = models.URLField(blank=True, null=True)
    saved_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.research_title} (Saved by {self.user.username})"

    class Meta:
        verbose_name = "Research Library Item"
        verbose_name_plural = "Research Library Items"
