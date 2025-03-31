from django.db import models
from django.contrib.auth.models import User

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

