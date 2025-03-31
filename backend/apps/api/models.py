from datetime import datetime
from django.db import models
from django.contrib.auth.models import User

from .models_research import ResearchProject


class Researcher(models.Model):
    name = models.CharField(max_length=255)
    institution = models.CharField(max_length=255, blank=True, default='')
    email = models.EmailField(blank=True, default='')
    orcid_id = models.CharField(max_length=255, blank=True, default='')
    
    # Link to user account if available
    user_account = models.OneToOneField(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='researcher_profile'
    )

    def __str__(self):
        return self.name

class Publication(models.Model):
    doi = models.CharField(
        max_length=255,
        unique=True,
        verbose_name="DOI",
        null=True,
        blank=True
    )
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    abstract = models.TextField(blank=True, null=True)
    publisher = models.CharField(max_length=255, blank=True, null=True)
    journal = models.CharField(max_length=255, blank=True, null=True)
    year = models.CharField(max_length=4, blank=True, null=True)
    doi = models.CharField(max_length=100, unique=True, blank=True, null=True)
    citations = models.IntegerField(default=0)
    is_public = models.BooleanField(default=True)
    url = models.URLField(max_length=500, blank=True, null=True)
    is_peer_reviewed = models.BooleanField(default=False)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    researchers = models.ManyToManyField(
        Researcher,
        through='PublicationResearcher',
        related_name='publications'
    )
    def __str__(self):
        return f"{self.title} ({self.year}) by {self.author}"

    class Meta:
        ordering = ['-year', 'title']

class PublicationResearcher(models.Model):
    researcher = models.ForeignKey(Researcher, on_delete=models.CASCADE)
    publication = models.ForeignKey(Publication, on_delete=models.CASCADE)
    is_primary = models.BooleanField(default=False)
    sequence = models.PositiveIntegerField(default=1)
    
    class Meta:
        ordering = ['sequence']

    def __str__(self):
        return f"{self.publication.title} - {self.researcher.name}"

class DataType(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Dataset(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    file_path = models.CharField(max_length=500)
    file_size = models.BigIntegerField()
    file_type = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    is_public = models.BooleanField(default=False)
    
    # Relationships
    publication = models.ForeignKey(
        'Publication',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='datasets'
    )
    research_project = models.ForeignKey(
        'ResearchProject',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='project_datasets'
    )

    def __str__(self):
        return f"{self.title} ({self.file_type})"

class DataCategory(models.Model):
    """Model for categorizing datasets by their publication status"""
    PUBLISHED = 'published'
    PEER_REVIEW = 'peer_review'
    RESEARCH = 'research'
    OTHER = 'other'
    
    CATEGORY_CHOICES = [
        (PUBLISHED, 'Published Data'),
        (PEER_REVIEW, 'Under Peer Review'),
        (RESEARCH, 'Under Research'),
        (OTHER, 'Other'),
    ]
    
    name = models.CharField(
        max_length=20, 
        choices=CATEGORY_CHOICES, 
        default=RESEARCH
    )
    description = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return self.get_name_display()
    
    class Meta:
        verbose_name = "Data Category"
        verbose_name_plural = "Data Categories"

class FileUpload(models.Model):
    file_name = models.CharField(max_length=255)
    file_content = models.TextField(default='')  # Store file content as text
    file_size = models.IntegerField()
    data_type = models.ForeignKey(DataType, on_delete=models.SET_NULL, null=True)
    description = models.TextField(blank=True, null=True)
    upload_date = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    is_public = models.BooleanField(default=False)
    category = models.ForeignKey(
        DataCategory, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        help_text="Categorization of the dataset (e.g., Published, Under Review)"
    )
    project_id = models.ForeignKey(
        ResearchProject,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    method = models.CharField(max_length=100, blank=True, null=True,
                            help_text="Experiment method (e.g., Cyclic, Constant, Square wave)")
    electrode_type = models.CharField(max_length=100, blank=True, null=True,
                                    help_text="Type of electrode used")
    instrument = models.CharField(max_length=100, blank=True, null=True,
                                help_text="Instrument name or type")
    downloads_count = models.IntegerField(default=0,
                                        help_text="Number of times this file has been downloaded")
    delimiter = models.CharField(max_length=5, default=',')

    def __str__(self):
        return f"{self.file_name} ({self.data_type})"

    class Meta:
        verbose_name = "Uploaded File"
        verbose_name_plural = "Uploaded Files"
        ordering = ['-upload_date']
        
    @property
    def access_status(self):
        """Return a string representation of the access status"""
        return "public" if self.is_public else "private"

class Instrument(models.Model):
    name = models.CharField(max_length=255, unique=True)
    
    def __str__(self):
        return self.name

class Electrode(models.Model):
    type = models.CharField(max_length=255, unique=True)
    
    def __str__(self):
        return self.type

class Method(models.Model):
    name = models.CharField(max_length=255, unique=True)
    
    def __str__(self):
        return self.name

class VoltammetryTechnique(models.Model):
    name = models.CharField(max_length=255, unique=True)
    
    def __str__(self):
        return self.name

class ResearchPublication(models.Model):
    """Expanded publication model with more details than the simple Publication model"""
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    doi = models.CharField(max_length=255, unique=True)
    verified = models.BooleanField(default=False)
    publication_data = models.JSONField(blank=True, null=True)
    thumbnail = models.CharField(max_length=255, blank=True, null=True)
    access_level = models.CharField(max_length=10, choices=[
        ('public', 'Public'),
        ('private', 'Private')
    ], default='private')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title
    
    class Meta:
        verbose_name = "Research Publication"
        verbose_name_plural = "Research Publications"

class Experiment(models.Model):
    research_id = models.CharField(max_length=50)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    researcher = models.ForeignKey(User, on_delete=models.CASCADE)
    method = models.ForeignKey(Method, on_delete=models.CASCADE)
    electrode = models.ForeignKey(Electrode, on_delete=models.CASCADE)
    instrument = models.ForeignKey(Instrument, on_delete=models.CASCADE)
    voltammetry_technique = models.ForeignKey(VoltammetryTechnique, on_delete=models.SET_NULL, null=True, blank=True)
    method_parameters = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.title} ({self.research_id})"
    
    class Meta:
        verbose_name = "Experiment"
        verbose_name_plural = "Experiments"

class ExperimentFile(models.Model):
    experiment = models.ForeignKey(Experiment, on_delete=models.CASCADE, related_name='files')
    file_name = models.CharField(max_length=255)
    file_path = models.CharField(max_length=255)
    data_type = models.CharField(max_length=50, blank=True, null=True)
    data_category = models.CharField(max_length=50, blank=True, null=True)
    access_level = models.CharField(max_length=10, choices=[
        ('public', 'Public'),
        ('private', 'Private')
    ], default='private')
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.file_name} ({self.experiment.title})"
    
    class Meta:
        verbose_name = "Experiment File"
        verbose_name_plural = "Experiment Files"

class ResearchCollaborator(models.Model):
    research = models.ForeignKey(Experiment, on_delete=models.CASCADE, related_name='collaborators')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    permission_level = models.CharField(max_length=10, choices=[
        ('read', 'Read'),
        ('write', 'Write'),
        ('admin', 'Admin')
    ], default='read')
    
    def __str__(self):
        return f"{self.user.username} - {self.permission_level} on {self.research.title}"
    
    class Meta:
        verbose_name = "Research Collaborator"
        verbose_name_plural = "Research Collaborators"
        unique_together = ('research', 'user')

class DoiVerificationLog(models.Model):
    publication = models.ForeignKey(ResearchPublication, on_delete=models.CASCADE, related_name='verification_logs')
    doi = models.CharField(max_length=255)
    verified = models.BooleanField(default=False)
    verification_response = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Verification of {self.doi} - {'Verified' if self.verified else 'Unverified'}"
    
    class Meta:
        verbose_name = "DOI Verification Log"
        verbose_name_plural = "DOI Verification Logs"

class UserSetting(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='settings')
    theme = models.CharField(max_length=20, default='light')
    layout_density = models.CharField(max_length=20, default='normal')
    font_size = models.IntegerField(default=14)
    show_welcome_screen = models.BooleanField(default=True)
    data_visibility = models.CharField(max_length=10, choices=[
        ('public', 'Public'),
        ('private', 'Private')
    ], default='private')
    share_research_interests = models.BooleanField(default=False)
    show_activity_status = models.BooleanField(default=False)
    data_usage_consent = models.BooleanField(default=False)
    analytics_opt_in = models.BooleanField(default=False)
    personalization_opt_in = models.BooleanField(default=False)
    export_all_data = models.BooleanField(default=False)
    request_data_deletion = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Settings for {self.user.username}"
    
    class Meta:
        verbose_name = "User Setting"
        verbose_name_plural = "User Settings"

class ResearchLibrary(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='research_library')
    research_title = models.CharField(max_length=255)
    research_doi = models.CharField(max_length=255, blank=True, null=True)
    research_url = models.URLField(blank=True, null=True)
    saved_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.research_title} (Saved by {self.user.username})"
    
    class Meta:
        verbose_name = "Research Library Item"
        verbose_name_plural = "Research Library Items"

class UserAnalytics(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='analytics')
    search_count = models.IntegerField(default=0)
    saved_items_count = models.IntegerField(default=0)
    tools_used = models.JSONField(blank=True, null=True)
    research_hours = models.FloatField(default=0.0)
    last_updated = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Analytics for {self.user.username}"
    
    class Meta:
        verbose_name = "User Analytics"
        verbose_name_plural = "User Analytics"

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Notification for {self.user.username}: {self.message[:30]}..."
    
    class Meta:
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"
        ordering = ['-created_at']

class ContactSupport(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='support_requests', null=True, blank=True)
    subject = models.CharField(max_length=255)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    processed = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Support Request: {self.subject} - {'Processed' if self.processed else 'Pending'}"
    
    class Meta:
        verbose_name = "Contact Support"
        verbose_name_plural = "Contact Support Requests"
        ordering = ['-created_at']


class CollaborationInvite(models.Model):
    """
    Model to store collaboration invitations.
    If invitee is null but email is provided, it means invitation to a non-registered user.
    """
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
        ('expired', 'Expired'),
    )
    ROLE_CHOICES = (
        ('viewer', 'Viewer'),
        ('contributor', 'Contributor'),
        ('admin', 'Admin'),
    )
    
    project_id = models.CharField(max_length=100)  # Project identifier
    inviter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_invites')
    invitee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_invites', null=True, blank=True)
    email = models.EmailField(blank=True, null=True)  # For non-registered users
    orcid_id = models.CharField(max_length=19, blank=True, null=True)  # ORCID ID format: 0000-0000-0000-0000
    role = models.CharField(max_length=15, choices=ROLE_CHOICES, default='viewer')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Invitation to {self.invitee.username if self.invitee else self.email or self.orcid_id} for {self.project_id}"
