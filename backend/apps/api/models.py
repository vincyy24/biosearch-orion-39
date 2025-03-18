
from django.db import models
from django.contrib.auth.models import User

class Publication(models.Model):
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    year = models.IntegerField()
    citations = models.IntegerField()

    def __str__(self):
        return f"{self.title} ({self.year}) by {self.author}"

class DataType(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

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
    file_path = models.CharField(max_length=255)
    file_size = models.IntegerField()
    data_type = models.ForeignKey(DataType, on_delete=models.CASCADE)
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
    
    # Experiment metadata
    method = models.CharField(max_length=100, blank=True, null=True, 
                            help_text="Experiment method (e.g., Cyclic, Constant, Square wave)")
    electrode_type = models.CharField(max_length=100, blank=True, null=True,
                                    help_text="Type of electrode used")
    instrument = models.CharField(max_length=100, blank=True, null=True,
                                help_text="Instrument name or type")
    downloads_count = models.IntegerField(default=0,
                                        help_text="Number of times this file has been downloaded")

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
