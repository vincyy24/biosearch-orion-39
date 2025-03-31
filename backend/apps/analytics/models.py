from django.db import models
from django.contrib.auth.models import User

class UserAnalytics(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='analytics')
    search_count = models.IntegerField(default=0)
    saved_items_count = models.IntegerField(default=0)
    tools_used = models.JSONField(blank=True, null=True)
    research_hours = models.FloatField(default=0.0)
    last_updated = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Analytics for {self.user.username}"
    
    class Meta:
        verbose_name = "User Analytics"
        verbose_name_plural = "User Analytics"
