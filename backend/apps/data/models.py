import uuid
from django.db import models
from django.contrib.auth.models import User

from apps.common.models import CreatedAtModel, TimeStampedModel


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


class Dataset(CreatedAtModel):
    id = models.UUIDField(auto_created=True, default=uuid.uuid4)
    title = models.CharField(max_length=255, primary_key=True)
    content = models.TextField(
        help_text="Content of the dataset, typically raw data or metadata",
        blank=False,
        null=False,
        default=''
    )
    description = models.TextField(blank=True, default='')
    file_path = models.CharField(max_length=500)
    file_size = models.BigIntegerField()
    file_type = models.CharField(max_length=100)
    is_public = models.BooleanField(default=False)

    # Relationships
    publication = models.ForeignKey(
        'publication.Publication',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='datasets'
    )
    research = models.ForeignKey(
        'research.Research',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='research_datasets'
    )

    def __str__(self):
        return f"{self.title} ({self.file_type})"


class DatasetComparison(TimeStampedModel):
    """Model for comparing multiple datasets"""
    comparison_id = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='created_comparisons')
    is_public = models.BooleanField(default=False)

    # Store the experiment IDs and comparison results as JSON
    datasets = models.JSONField(default=list)  # List of experiment_ids
    comparison_results = models.JSONField(default=dict)

    def __str__(self):
        return f"{self.title} ({self.comparison_id})"

    class Meta:
        verbose_name = "Dataset Comparison"
        verbose_name_plural = "Dataset Comparisons"


class FileUpload(models.Model):
    file_name = models.CharField(max_length=255)
    content = models.TextField()
    description = models.TextField(blank=True, null=True)
    uploaded_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='file_uploads')
    upload_date = models.DateTimeField(auto_now_add=True)
    experiment_type = models.CharField(max_length=50, default='other')
    data_type = models.ForeignKey(
        'DataType', on_delete=models.SET_NULL, null=True)
    version = models.IntegerField(default=1)
    category = models.ForeignKey(
        'DataCategory',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="Categorization of the dataset (e.g., Published, Under Review)"
    )
    research_id = models.ForeignKey(
        'research.Research',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    method = models.CharField(max_length=100, blank=True, null=True,
                              help_text="Experiment method (e.g., Cyclic, Constant, Square wave)")
    electrode_type = models.CharField(
        max_length=100, blank=True, null=True, help_text="Type of electrode used")
    instrument = models.CharField(
        max_length=100, blank=True, null=True, help_text="Instrument name or type")
    downloads_count = models.IntegerField(
        default=0, help_text="Number of times this file has been downloaded")
    delimiter = models.CharField(max_length=5, default=',')

    def __str__(self):
        return f"{self.file_name} ({self.data_type}) v({self.version}) (by {self.uploaded_by})"

    def create_new_version(self, new_content):
        """Create a new version of this file"""
        new_version = FileUpload.objects.get(pk=self.pk)
        new_version.pk = None  # Create a new record
        new_version.version = self.version + 1
        new_version.content = new_content
        new_version.save()
        return new_version

    @property
    def access_status(self):
        """Return a string representation of the access status"""
        return ("private", "public")[int(self.is_public)]

    def export_as_csv(self):
        """Export content as CSV format"""
        return self.content

    def export_as_tsv(self):
        """Export content as TSV format (replace commas with tabs)"""
        if ',' in self.content:
            return self.content.replace(',', '\t')
        return self.content

    def export_with_delimiter(self, delimiter):
        """Export with custom delimiter"""
        if ',' in self.content and delimiter != ',':
            return self.content.replace(',', delimiter)
        return self.content

    class Meta:
        verbose_name = "Uploaded File"
        verbose_name_plural = "Uploaded Files"
        ordering = ['-upload_date']
