from django.db.models import Q
from django.middleware.csrf import get_token
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.data.models import FileUpload
from apps.publication.models import Publication


class CSRFTokenView(APIView):
    """
    API view to provide CSRF token
    """
    permission_classes = [AllowAny]

    def get(self, request):
        csrf_token = get_token(request)
        return Response({'csrf_token': csrf_token})


class SearchView(APIView):
    """
    API view to handle search queries.
    """

    def get(self, request):
        query = request.query_params.get('query', '')

        if not query:
            return Response({'error': 'Search query is required'}, status=status.HTTP_400_BAD_REQUEST)

        is_authenticated = request.user.is_authenticated

        publications = Publication.objects.filter(
            title__icontains=query
        ).values('id', 'title', 'author', 'year', 'citations')

        data_type = request.query_params.get('data_type', None)
        category = request.query_params.get('category', None)
        year_from = request.query_params.get('year_from', None)
        year_to = request.query_params.get('year_to', None)

        if year_from and year_from.isdigit():
            publications = publications.filter(year__gte=int(year_from))

        if year_to and year_to.isdigit():
            publications = publications.filter(year__lte=int(year_to))

        file_uploads_query = FileUpload.objects.filter(
            file_name__icontains=query
        )

        if data_type:
            file_uploads_query = file_uploads_query.filter(
                data_type__id=data_type)

        if category:
            file_uploads_query = file_uploads_query.filter(
                category__name=category)

        if not is_authenticated:
            file_uploads_query = file_uploads_query.filter(is_public=True)
        elif not request.user.is_staff:
            file_uploads_query = file_uploads_query.filter(
                Q(is_public=True) | Q(user=request.user)
            )

        file_uploads = file_uploads_query.values(
            'id',
            'file_name',
            'data_type__name',
            'description',
            'upload_date',
            'is_public',
            'user__username',
            'category__name',
            'method',
            'electrode_type',
            'instrument',
            'downloads_count'
        )

        datasets = []
        for item in file_uploads:
            datasets.append({
                'id': item['id'],
                'title': item['file_name'],
                'description': item['description'],
                'category': item['data_type__name'],
                'dataCategory': item['category__name'],
                'access': 'public' if item['is_public'] else 'private',
                'author': item['user__username'],
                'date': item['upload_date'],
                'downloads': item['downloads_count'],
                'method': item['method'],
                'electrode': item['electrode_type'],
                'instrument': item['instrument'],
            })

        results = {
            'publications': list(publications),
            'datasets': datasets,
            'tools': [
                {
                    'id': 'tool-1',
                    'title': f'Analysis tool for "{query}"',
                    'description': 'Sample tool description',
                    'year': 2022,
                    'type': 'tool'
                }
            ],
            'genes': [
                {
                    'id': 'gene-1',
                    'title': f'Gene related to "{query}"',
                    'description': 'Sample gene description',
                    'type': 'gene'
                }
            ]
        }

        return Response(results)
