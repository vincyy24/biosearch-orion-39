from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include, re_path
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.generic import TemplateView

# Customize the admin site
admin.site.site_header = 'ORION Database Administration'
admin.site.site_title = 'ORION Admin Portal'
admin.site.index_title = 'Welcome to ORION Database Administration'

# Wrap the TemplateView with ensure_csrf_cookie for better security
react_view = ensure_csrf_cookie(TemplateView.as_view(template_name='index.html'))

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('apps.api.urls')),
    path('pdash/', include('django_plotly_dash.urls')),
    # Add catch-all route for React router, excluding admin/, api/, and pdash/ routes
    re_path(r'^(?!admin/|api/|pdash/).*$', react_view),
]

# Serve static files during development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
