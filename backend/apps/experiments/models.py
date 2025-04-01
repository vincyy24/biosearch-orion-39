from django.db import models

class Instrument(models.Model):
    name = models.CharField(max_length=255, unique=True)
    
    def __str__(self):
        return self.name

class Electrode(models.Model):
    type = models.CharField(max_length=255, unique=True)
    
    def __str__(self):
        return self.type

# class Method(models.Model):
#     name = models.CharField(max_length=255, unique=True)
    
#     def __str__(self):
#         return self.name

class VoltammetryTechnique(models.Model):
    name = models.CharField(max_length=255, unique=True)
    
    def __str__(self):
        return self.name

class Experiment(models.Model):
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
    research = models.ForeignKey('Research', null=True, blank=True, on_delete=models.SET_NULL, related_name='experiments')
    
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
        new_version = Experiment.objects.get(pk=self.pk)
        new_version.pk = None
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

