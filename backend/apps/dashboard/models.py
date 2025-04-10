from django.db import models
from apps.common.models import TimeStampedModel

# class DataAnalysisPipeline(models.Model):
#     """Model for defining data analysis workflows"""
    
#     # ... keep existing code (class and fields for DataAnalysisPipeline)


class VoltammetryData(models.Model):
    pass

class FileUpload(TimeStampedModel):
    # Define Fields for Dataset Upload
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=255, blank=True, null=True)
    access = models.CharField(max_length=255, blank=True, null=True)
    author = models.CharField(max_length=255, blank=True, null=True)
    date = models.DateTimeField(auto_now_add=True)
    downloads = models.IntegerField(default=0)
    method = models.CharField(max_length=255, blank=True, null=True)
    electrode = models.CharField(max_length=255, blank=True, null=True)
    instrument = models.CharField(max_length=255, blank=True, null=True)
    