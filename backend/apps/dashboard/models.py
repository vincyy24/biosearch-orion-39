
from django.db import models
import json
from django.contrib.auth.models import User

class VoltammetryData(models.Model):
    """Model for storing voltammetry experimental data"""
    
    experiment_id = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    date_created = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)
    
    # Metadata
    experiment_type = models.CharField(max_length=50, choices=[
        ('cyclic', 'Cyclic Voltammetry'),
        ('differential_pulse', 'Differential Pulse Voltammetry'),
        ('square_wave', 'Square Wave Voltammetry'),
        ('linear_sweep', 'Linear Sweep Voltammetry'),
        ('chronoamperometry', 'Chronoamperometry'),
        ('other', 'Other')
    ])
    scan_rate = models.FloatField(help_text="Scan rate in mV/s")
    electrode_material = models.CharField(max_length=100, blank=True, null=True)
    electrolyte = models.CharField(max_length=100, blank=True, null=True)
    temperature = models.FloatField(blank=True, null=True, help_text="Temperature in °C")
    
    # Raw data fields are stored as JSON in data_points
    # This will contain arrays of potential, current, and time values
    data_points = models.JSONField()
    
    # Fields for calculated metrics
    peak_anodic_current = models.FloatField(blank=True, null=True)
    peak_cathodic_current = models.FloatField(blank=True, null=True)
    peak_anodic_potential = models.FloatField(blank=True, null=True)
    peak_cathodic_potential = models.FloatField(blank=True, null=True)
    
    # Version control field
    version = models.IntegerField(default=1)
    is_latest_version = models.BooleanField(default=True)
    parent_experiment = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name='versions')
    
    # New: Link to Research Project
    research_project = models.ForeignKey('api.ResearchProject', null=True, blank=True, on_delete=models.SET_NULL, related_name='experiments')
    
    def __str__(self):
        return f"{self.title} ({self.experiment_id}) v{self.version}"
    
    class Meta:
        verbose_name = "Voltammetry Dataset"
        verbose_name_plural = "Voltammetry Datasets"
    
    def create_new_version(self, new_data=None):
        """
        Create a new version of this experiment
        If new_data is provided, it will update fields in the new version
        """
        # Set all current versions to not be latest
        if self.is_latest_version:
            # Mark current version as not latest
            self.is_latest_version = False
            self.save()
        
        # Create new version
        new_version = VoltammetryData.objects.get(pk=self.pk)
        new_version.pk = None  # Create a new record
        new_version.version = self.version + 1
        new_version.is_latest_version = True
        new_version.parent_experiment = self
        
        # Update with new data if provided
        if new_data:
            for key, value in new_data.items():
                if hasattr(new_version, key):
                    setattr(new_version, key, value)
        
        new_version.save()
        return new_version

class DataAnalysisPipeline(models.Model):
    """Model for defining data analysis workflows"""
    
    # ... keep existing code (class and fields for DataAnalysisPipeline)

class FileUpload(models.Model):
    """Model for storing file upload data as text content"""
    
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='file_uploads')
    file_name = models.CharField(max_length=255)
    content = models.TextField()  # Store file content as text
    experiment_type = models.CharField(max_length=50, default='other')
    description = models.TextField(blank=True, null=True)
    is_public = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    research_project = models.ForeignKey('api.ResearchProject', null=True, blank=True, on_delete=models.SET_NULL, related_name='file_uploads')
    publication_doi = models.CharField(max_length=255, blank=True, null=True)
    version = models.IntegerField(default=1)
    
    def __str__(self):
        return f"{self.file_name} (by {self.uploaded_by.username})"
    
    def create_new_version(self, new_content):
        """Create a new version of this file"""
        new_version = FileUpload.objects.get(pk=self.pk)
        new_version.pk = None  # Create a new record
        new_version.version = self.version + 1
        new_version.content = new_content
        new_version.save()
        return new_version
    
    def export_as_csv(self):
        """Export content as CSV format"""
        return self.content  # Already stored as text
    
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
