from django.db import models
from django.contrib.auth.models import User

from apps.common.models import CreatedAtModel, TimeStampedModel


class Publication(TimeStampedModel):
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
    citations = models.IntegerField(default=0)
    is_public = models.BooleanField(default=True)
    url = models.URLField(max_length=500, blank=True, null=True)
    is_peer_reviewed = models.BooleanField(default=False)
    user = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True)
    researchers = models.ManyToManyField(
        to='research.Researcher',
        through='PublicationResearcher',
        related_name='publications'
    )
    publication_data = models.JSONField(blank=True, null=True)
    thumbnail = models.URLField(blank=True, null=True)

    def __str__(self):
        return f"{self.title} ({self.year}) by {self.author}"

    class Meta:
        ordering = ['-year', 'title']


class PublicationResearcher(models.Model):
    researcher = models.ForeignKey('research.Researcher', on_delete=models.CASCADE)
    publication = models.ForeignKey('Publication', on_delete=models.CASCADE)
    is_primary = models.BooleanField(default=False)
    sequence = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ['sequence']

    def __str__(self):
        return f"{self.publication.title} - {self.researcher.name}"


class DoiVerificationLog(CreatedAtModel):
    publication = models.ForeignKey(
        Publication, on_delete=models.CASCADE, related_name='verification_logs')
    doi = models.CharField(max_length=255)
    verified = models.BooleanField(default=False)
    verification_response = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Verification of {self.doi} - {('Unverified', 'Verified')[int(self.verified)]}"

    class Meta:
        verbose_name = "DOI Verification Log"
        verbose_name_plural = "DOI Verification Logs"
