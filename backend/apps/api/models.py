
from django.db import models
from django.contrib.auth.models import User

class DataCategory(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class DataType(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class Publication(models.Model):
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    journal = models.CharField(max_length=255, blank=True, null=True)
    year = models.CharField(max_length=4, blank=True, null=True)
    doi = models.CharField(max_length=100, unique=True, blank=True, null=True)
    citations = models.IntegerField(default=0)
    abstract = models.TextField(blank=True, null=True)
    is_public = models.BooleanField(default=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class FileUpload(models.Model):
    file_name = models.CharField(max_length=255)
    file_content = models.TextField()  # Store file content as text
    file_size = models.IntegerField()
    data_type = models.ForeignKey(DataType, on_delete=models.SET_NULL, null=True)
    category = models.ForeignKey(DataCategory, on_delete=models.SET_NULL, null=True, blank=True)
    description = models.TextField(blank=True, null=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    upload_date = models.DateTimeField(auto_now_add=True)
    is_public = models.BooleanField(default=False)
    downloads_count = models.IntegerField(default=0)
    method = models.CharField(max_length=100, blank=True, null=True)
    electrode_type = models.CharField(max_length=100, blank=True, null=True)
    instrument = models.CharField(max_length=100, blank=True, null=True)
    delimiter = models.CharField(max_length=5, default=',')  # Store delimiter used in the file

    def __str__(self):
        return self.file_name

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
