from django.db import models
from django.contrib.auth.models import User

# Create your models here.
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
    research = models.ForeignKey(
        'Research',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='research_datasets'
    )

    def __str__(self):
        return f"{self.title} ({self.file_type})"

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
    data_type = models.ForeignKey('DataType', on_delete=models.SET_NULL, null=True)
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
        'Research',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    method = models.CharField(max_length=100, blank=True, null=True, help_text="Experiment method (e.g., Cyclic, Constant, Square wave)")
    electrode_type = models.CharField(max_length=100, blank=True, null=True, help_text="Type of electrode used")
    instrument = models.CharField(max_length=100, blank=True, null=True, help_text="Instrument name or type")
    downloads_count = models.IntegerField(default=0, help_text="Number of times this file has been downloaded")
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
