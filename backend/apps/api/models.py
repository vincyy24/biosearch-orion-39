
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

class FileUpload(models.Model):
    file_name = models.CharField(max_length=255)
    file_path = models.CharField(max_length=255)
    file_size = models.IntegerField()
    data_type = models.ForeignKey(DataType, on_delete=models.CASCADE)
    description = models.TextField(blank=True, null=True)
    upload_date = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.file_name} ({self.data_type})"
