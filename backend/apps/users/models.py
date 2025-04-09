from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.db import models
import re

from apps.common.models import CreatedAtModel


def validate_orcid(value):
    pattern = r'^\d{4}-\d{4}-\d{4}-\d{4}$'
    if not re.match(pattern, value):
        raise ValidationError(
            'ORCID must be in the format 0000-0000-0000-0000')


class UserSetting(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name='settings')
    theme = models.CharField(max_length=20, default='light')
    layout_density = models.CharField(max_length=20, default='normal')
    font_size = models.IntegerField(default=14)
    show_welcome_screen = models.BooleanField(default=True)
    data_visibility = models.CharField(max_length=10, choices=[
        ('public', 'Public'),
        ('private', 'Private')
    ], default='private')
    share_research_interests = models.BooleanField(default=False)
    show_activity_status = models.BooleanField(default=False)
    data_usage_consent = models.BooleanField(default=False)
    analytics_opt_in = models.BooleanField(default=False)
    personalization_opt_in = models.BooleanField(default=False)
    export_all_data = models.BooleanField(default=False)
    request_data_deletion = models.BooleanField(default=False)

    def __str__(self):
        return f"Settings for {self.user.username}"

    class Meta:
        verbose_name = "User Setting"
        verbose_name_plural = "User Settings"


class Notification(CreatedAtModel):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"Notification for {self.user.username}: {self.message[:30]}..."

    class Meta:
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"
        ordering = ['-created_at']


class OrcidProfile(models.Model):
    """Model for storing ORCID profile information"""
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name='orcid_profile')
    orcid_id = models.CharField(
        max_length=19,
        unique=True,
        validators=[
            validate_orcid
        ]
    )  # Format: 0000-0000-0000-0000
    is_verified = models.BooleanField(default=False)
    verification_token = models.CharField(max_length=64, blank=True, null=True)
    token_expiry = models.DateTimeField(blank=True, null=True)
    verified_at = models.DateTimeField(blank=True, null=True)
    # Stores the raw profile data from ORCID
    orcid_data = models.JSONField(blank=True, null=True)

    def __str__(self):
        return f"ORCID: {self.orcid_id} ({self.user.username})"

    class Meta:
        verbose_name = "ORCID Profile"
        verbose_name_plural = "ORCID Profiles"
