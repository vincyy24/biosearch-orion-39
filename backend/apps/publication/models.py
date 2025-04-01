from django.db import models
from django.contrib.auth.models import User

class Publication(models.Model):
    doi = models.CharField(
        max_length=255,
        unique=True,
        verbose_name="DOI",
        null=True,
        blank=True
    )
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    abstract = models.TextField(blank=True, null=True)
    publisher = models.CharField(max_length=255, blank=True, null=True)
    journal = models.CharField(max_length=255, blank=True, null=True)
    year = models.CharField(max_length=4, blank=True, null=True)
    doi = models.CharField(max_length=100, unique=True, blank=True, null=True)
    citations = models.IntegerField(default=0)
    is_public = models.BooleanField(default=True)
    url = models.URLField(max_length=500, blank=True, null=True)
    is_peer_reviewed = models.BooleanField(default=False)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    researchers = models.ManyToManyField(
        to='Researcher',
        through='PublicationResearcher',
        related_name='publications'
    )
    def __str__(self):
        return f"{self.title} ({self.year}) by {self.author}"

    class Meta:
        ordering = ['-year', 'title']

class PublicationResearcher(models.Model):
    researcher = models.ForeignKey('Researcher', on_delete=models.CASCADE)
    publication = models.ForeignKey('Publication', on_delete=models.CASCADE)
    is_primary = models.BooleanField(default=False)
    sequence = models.PositiveIntegerField(default=1)
    
    class Meta:
        ordering = ['sequence']

    def __str__(self):
        return f"{self.publication.title} - {self.researcher.name}"

class DoiVerificationLog(models.Model):
    publication = models.ForeignKey(Publication, on_delete=models.CASCADE, related_name='verification_logs')
    doi = models.CharField(max_length=255)
    verified = models.BooleanField(default=False)
    verification_response = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Verification of {self.doi} - {('Unverified', 'Verified' )[int(self.verified)]}"
    
    class Meta:
        verbose_name = "DOI Verification Log"
        verbose_name_plural = "DOI Verification Logs"
