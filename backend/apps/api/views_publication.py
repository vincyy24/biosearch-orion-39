
import json
import uuid
from django.http import JsonResponse
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods

@method_decorator(csrf_exempt, name='dispatch')
class PublicationRegistrationView(View):
    """Handle publication registration and retrieval"""
    
    def get(self, request, doi=None):
        """Get publication details by DOI"""
        if not doi:
            # Return list of publications
            publications = [
                {
                    "doi": "10.1021/jacs.0c01924",
                    "title": "Enhanced Electrochemical Performance of Lithium-Ion Batteries with Artificial SEI Films",
                    "journal": "Journal of the American Chemical Society",
                    "year": 2023,
                    "researchers": [
                        {"id": "r1", "name": "Dr. Sarah Johnson", "institution": "MIT", "is_primary": True},
                        {"id": "r2", "name": "Dr. Michael Chen", "institution": "Stanford University", "is_primary": False}
                    ],
                    "created_at": "2023-04-15T10:30:00Z",
                    "is_public": True,
                    "abstract": "This paper investigates novel artificial solid-electrolyte interphase films for lithium-ion batteries, demonstrating significant improvements in cycle life and capacity retention.",
                    "is_peer_reviewed": True
                },
                {
                    "doi": "10.1038/s41586-020-2649-2",
                    "title": "Machine Learning Approaches for Predicting Battery Material Properties",
                    "journal": "Nature",
                    "year": 2022,
                    "researchers": [
                        {"id": "r3", "name": "Dr. Emily Williams", "institution": "UC Berkeley", "is_primary": True},
                        {"id": "r4", "name": "Dr. Robert Kumar", "institution": "Princeton University", "is_primary": False}
                    ],
                    "created_at": "2022-11-22T14:15:00Z",
                    "is_public": True,
                    "abstract": "A comprehensive study utilizing machine learning algorithms to predict properties of novel battery materials, accelerating discovery of high-performance energy storage solutions.",
                    "is_peer_reviewed": True
                }
            ]
            
            return JsonResponse({
                "count": len(publications),
                "results": publications
            })
        
        # Return details for specific DOI
        publication = {
            "doi": doi,
            "title": "Example Publication with DOI " + doi,
            "journal": "Sample Journal",
            "year": 2023,
            "researchers": [
                {"id": "r1", "name": "Dr. John Doe", "institution": "Example University", "is_primary": True}
            ],
            "created_at": "2023-01-01T00:00:00Z",
            "is_public": True,
            "abstract": "This is a sample abstract for the publication with DOI " + doi,
            "is_peer_reviewed": True
        }
        
        return JsonResponse(publication)

    @method_decorator(login_required)
    def post(self, request, doi=None):
        """Register a new publication or update an existing one"""
        try:
            # Parse JSON data from request body
            data = json.loads(request.body)
            
            # Validate required fields
            required_fields = ['doi', 'title', 'journal', 'year']
            for field in required_fields:
                if field not in data:
                    return JsonResponse({"error": f"Missing required field: {field}"}, status=400)
            
            # Process the publication data
            # In a real application, this would save to a database
            publication = {
                "doi": data['doi'],
                "title": data['title'],
                "journal": data['journal'],
                "year": data['year'],
                "is_public": data.get('is_public', False),
                "researchers": data.get('researchers', []),
                "abstract": data.get('abstract', ''),
                "is_peer_reviewed": data.get('is_peer_reviewed', False),
                "created_at": "2023-01-01T00:00:00Z"  # Would be actual timestamp in real app
            }
            
            return JsonResponse({
                "message": "Publication registered successfully",
                "publication": publication
            })
            
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON in request body"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    @method_decorator(login_required)
    def put(self, request, doi):
        """Update an existing publication"""
        try:
            # Parse JSON data from request body
            data = json.loads(request.body)
            
            # In a real application, this would update in a database
            publication = {
                "doi": doi,
                "title": data.get('title', 'Updated Publication'),
                "journal": data.get('journal', 'Updated Journal'),
                "year": data.get('year', 2023),
                "is_public": data.get('is_public', False),
                "researchers": data.get('researchers', []),
                "abstract": data.get('abstract', ''),
                "is_peer_reviewed": data.get('is_peer_reviewed', False),
                "updated_at": "2023-01-01T00:00:00Z"  # Would be actual timestamp in real app
            }
            
            return JsonResponse({
                "message": "Publication updated successfully",
                "publication": publication
            })
            
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON in request body"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    @method_decorator(login_required)
    def delete(self, request, doi):
        """Delete a publication"""
        # In a real application, this would delete from a database
        return JsonResponse({
            "message": f"Publication with DOI {doi} deleted successfully"
        })
