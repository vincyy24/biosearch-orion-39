from django.db import models
from django.contrib.auth.models import User




class ContactSupport(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='support_requests', null=True, blank=True)
    subject = models.CharField(max_length=255)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    processed = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Support Request: {self.subject} - {'Processed' if self.processed else 'Pending'}"
    
    class Meta:
        verbose_name = "Contact Support"
        verbose_name_plural = "Contact Support Requests"
        ordering = ['-created_at']


