from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response

class PublicationList(APIView):
    def get(self, request):
        # Mock data - replace with database query later
        publications = [
            {"id": 1, "title": "Advancements in Genomic Research", "author": "Dr. Jane Smith", "year": 2023, "citations": 45},
            {"id": 2, "title": "Clinical Applications of CRISPR", "author": "Dr. John Doe", "year": 2022, "citations": 78},
            {"id": 3, "title": "New Frontiers in Cancer Treatment", "author": "Dr. Sarah Johnson", "year": 2023, "citations": 32},
            {"id": 4, "title": "Biomarkers for Early Disease Detection", "author": "Dr. Michael Chen", "year": 2021, "citations": 102},
            {"id": 5, "title": "Machine Learning in Drug Discovery", "author": "Dr. Emily Brown", "year": 2022, "citations": 64}
        ]
        return Response(publications)