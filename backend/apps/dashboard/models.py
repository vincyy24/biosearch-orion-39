
from django.db import models
import json

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
    
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Store analysis steps as JSON
    analysis_steps = models.JSONField(default=list)
    
    # Configuration options for the pipeline
    config_options = models.JSONField(default=dict)
    
    # User who created this pipeline
    created_by = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='analysis_pipelines')
    
    # Whether this pipeline is public and can be used by other users
    is_public = models.BooleanField(default=False)
    
    # New: Link to Research Project
    research_project = models.ForeignKey('api.ResearchProject', null=True, blank=True, on_delete=models.SET_NULL, related_name='analysis_pipelines')
    
    def __str__(self):
        return self.name
    
    def add_step(self, step_type, step_parameters):
        """Add a new analysis step to the pipeline"""
        step = {
            'type': step_type,
            'parameters': step_parameters
        }
        steps = self.analysis_steps
        steps.append(step)
        self.analysis_steps = steps
        self.save()
        return self
    
    def remove_step(self, step_index):
        """Remove an analysis step from the pipeline"""
        steps = self.analysis_steps
        if 0 <= step_index < len(steps):
            steps.pop(step_index)
            self.analysis_steps = steps
            self.save()
        return self
    
    def run(self, data):
        """
        Run the analysis pipeline on the provided data
        This is a placeholder that would typically call a more sophisticated
        data processing system
        """
        result = data  # Start with the input data
        
        for step in self.analysis_steps:
            step_type = step['type']
            params = step['parameters']
            
            if step_type == 'filter':
                # Apply filtering logic
                pass
            elif step_type == 'transform':
                # Apply transformation logic
                pass
            elif step_type == 'analyze':
                # Apply analysis logic
                pass
            # Add more step types as needed
            
        return result
