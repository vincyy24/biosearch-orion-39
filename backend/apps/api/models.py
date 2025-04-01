from django.db import models
from django.contrib.auth.models import User

from backend.apps.common.models import CreatedAtModel


class ContactSupport(CreatedAtModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='support_requests', null=True, blank=True)
    subject = models.CharField(max_length=255)
    message = models.TextField()
    processed = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Support Request: {self.subject} - {'Processed' if self.processed else 'Pending'}"
    
    class Meta:
        verbose_name = "Contact Support"
        verbose_name_plural = "Contact Support Requests"
        ordering = ['-created_at']
