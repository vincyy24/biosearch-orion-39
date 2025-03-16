
from django.apps import AppConfig


class DashboardConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.dashboard'
    
    def ready(self):
        # Import dash applications to ensure they are registered
        import apps.dashboard.plotly_apps
