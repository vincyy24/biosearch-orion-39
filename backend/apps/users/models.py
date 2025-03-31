from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.db import models
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.http import require_http_methods
from datetime import timedelta
import json
import uuid

class UserSetting(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='settings')
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

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Notification for {self.user.username}: {self.message[:30]}..."
    
    class Meta:
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"
        ordering = ['-created_at']

class OrcidProfile(models.Model):
    """Model for storing ORCID profile information"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='orcid_profile')
    orcid_id = models.CharField(max_length=19, unique=True)  # Format: 0000-0000-0000-0000
    is_verified = models.BooleanField(default=False)
    verification_token = models.CharField(max_length=64, blank=True, null=True)
    token_expiry = models.DateTimeField(blank=True, null=True)
    verified_at = models.DateTimeField(blank=True, null=True)
    orcid_data = models.JSONField(blank=True, null=True)  # Stores the raw profile data from ORCID
    
    def __str__(self):
        return f"ORCID: {self.orcid_id} ({self.user.username})"
    
    class Meta:
        verbose_name = "ORCID Profile"
        verbose_name_plural = "ORCID Profiles"


# ORCID API endpoints
ORCID_API_URL = "https://pub.orcid.org/v3.0"
ORCID_AUTH_URL = "https://orcid.org/oauth/authorize"
ORCID_TOKEN_URL = "https://orcid.org/oauth/token"

@login_required
@require_http_methods(["POST"])
def initiate_orcid_verification(request):
    """Initiate the ORCID verification process for a user"""
    try:
        data = json.loads(request.body)
        orcid_id = data.get('orcid_id')
        
        if not orcid_id:
            return JsonResponse({"error": "ORCID ID is required"}, status=400)
        
        # Validate ORCID ID format (0000-0000-0000-0000)
        if not validate_orcid_format(orcid_id):
            return JsonResponse({"error": "Invalid ORCID ID format"}, status=400)
        
        # Check if this ORCID ID is already verified by another user
        if OrcidProfile.objects.filter(orcid_id=orcid_id, is_verified=True).exists():
            return JsonResponse({"error": "This ORCID ID is already verified by another user"}, status=400)
        
        # Get or create ORCID profile for the user
        orcid_profile, created = OrcidProfile.objects.get_or_create(
            user=request.user,
            defaults={'orcid_id': orcid_id}
        )
        
        if not created and orcid_profile.orcid_id != orcid_id:
            orcid_profile.orcid_id = orcid_id
            orcid_profile.is_verified = False
            
        # Generate verification token and set expiry
        verification_token = str(uuid.uuid4())
        token_expiry = timezone.now() + timedelta(hours=24)
        
        orcid_profile.verification_token = verification_token
        orcid_profile.token_expiry = token_expiry
        orcid_profile.save()
        
        # In a real implementation, this would redirect to ORCID for OAuth,
        # but for this example we'll simulate with a verification code
        return JsonResponse({
            "message": "Verification initiated",
            "verification_token": verification_token,
            "expires_at": token_expiry.isoformat()
        })
        
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@login_required
@require_http_methods(["POST"])
def confirm_orcid_verification(request):
    """Confirm ORCID verification with token"""
    try:
        data = json.loads(request.body)
        verification_code = data.get('verification_code')
        
        if not verification_code:
            return JsonResponse({"error": "Verification code is required"}, status=400)
        
        # Get user's ORCID profile
        try:
            orcid_profile = OrcidProfile.objects.get(user=request.user)
        except OrcidProfile.DoesNotExist:
            return JsonResponse({"error": "ORCID profile not found"}, status=404)
        
        # Check token and expiry
        if orcid_profile.verification_token != verification_code:
            return JsonResponse({"error": "Invalid verification code"}, status=400)
        
        if orcid_profile.token_expiry < timezone.now():
            return JsonResponse({"error": "Verification code has expired"}, status=400)
        
        # In a real implementation, we would verify with ORCID API
        # For this example, we'll simulate a successful verification
        
        # Fetch ORCID data (simulated)
        orcid_data = fetch_orcid_profile(orcid_profile.orcid_id)
        
        # Mark as verified
        orcid_profile.is_verified = True
        orcid_profile.verified_at = timezone.now()
        orcid_profile.orcid_data = orcid_data
        orcid_profile.save()
        
        return JsonResponse({
            "message": "ORCID successfully verified",
            "orcid_id": orcid_profile.orcid_id,
            "verified_at": orcid_profile.verified_at.isoformat()
        })
        
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@login_required
def get_orcid_profile(request):
    """Get the user's ORCID profile"""
    try:
        try:
            orcid_profile = OrcidProfile.objects.get(user=request.user)
        except OrcidProfile.DoesNotExist:
            return JsonResponse({"error": "ORCID profile not found"}, status=404)
        
        return JsonResponse({
            "orcid_id": orcid_profile.orcid_id,
            "is_verified": orcid_profile.is_verified,
            "verified_at": orcid_profile.verified_at.isoformat() if orcid_profile.verified_at else None,
            "profile_data": orcid_profile.orcid_data
        })
        
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


def validate_orcid_format(orcid_id):
    """Validate ORCID ID format (0000-0000-0000-0000)"""
    import re
    pattern = r'^\d{4}-\d{4}-\d{4}-\d{4}$'
    return bool(re.match(pattern, orcid_id))

def fetch_orcid_profile(orcid_id):
    """Fetch ORCID profile data from the ORCID API (simulated)"""
    # In a real implementation, this would call the ORCID API
    # For this example, we'll return simulated data
    return {
        "orcid_id": orcid_id,
        "name": "Sample Researcher",
        "biography": "Sample researcher biography",
        "education": [
            "Ph.D. in Chemistry, Sample University, 2015",
            "M.Sc. in Chemistry, Another University, 2010"
        ],
        "employment": [
            "Senior Researcher, Research Institute, 2015-Present",
            "Research Assistant, University Lab, 2010-2015"
        ],
        "works": [
            {
                "title": "Sample Research Paper",
                "type": "journal-article",
                "year": 2020,
                "url": "https://doi.org/10.1234/sample"
            }
        ]
    }
