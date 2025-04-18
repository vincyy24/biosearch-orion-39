from django.apps import AppConfig


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.api'
    
    def ready(self):
        # Register API endpoints
        # This is a good place to perform any initialization for API endpoints
        pass
