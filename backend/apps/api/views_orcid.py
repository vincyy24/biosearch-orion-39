
import json
import uuid
import requests
from datetime import datetime, timedelta
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User

from .models_research import OrcidProfile

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

# Helper functions
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
