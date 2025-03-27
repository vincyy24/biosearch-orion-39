
# Django Backend Setup Instructions

This document provides instructions for setting up the Django backend with Plotly Dash integration.

## Prerequisites

- Python 3.8 or higher
- Node.js and npm (already installed for the frontend)
- pip (Python package manager)

## Setup Steps

1. **Create a Python virtual environment** (recommended):
   ```bash
   python -m venv venv
   # On Windows
   venv\Scripts\activate
   # On macOS/Linux
   source venv/bin/activate
   ```

2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Create a new Django project**:
   ```bash
   django-admin startproject backend
   cd backend
   ```

4. **Create API and Dashboard apps**:
   ```bash
   python manage.py startapp api
   python manage.py startapp dashboard
   ```

5. **Configure Django settings**:
   - Add the following to `backend/settings.py`:
   ```python
   INSTALLED_APPS = [
       # ... default apps
       'rest_framework',
       'corsheaders',
       'channels',
       'django_plotly_dash.apps.DjangoPlotlyDashConfig',
       'api',
       'dashboard',
   ]

   MIDDLEWARE = [
       'corsheaders.middleware.CorsMiddleware',
       # ... other middleware
   ]

   # Allow frontend to access the API during development
   CORS_ALLOWED_ORIGINS = [
       "http://localhost:8080",
   ]

   # Django Plotly Dash settings
   X_FRAME_OPTIONS = 'SAMEORIGIN'
   CHANNEL_LAYERS = {
       'default': {
           'BACKEND': 'channels.layers.InMemoryChannelLayer',
       },
   }
   PLOTLY_DASH = {
       'serve_locally': True,
   }
   
   # Rest Framework settings
   REST_FRAMEWORK = {
       'DEFAULT_PERMISSION_CLASSES': [
           'rest_framework.permissions.AllowAny',
       ]
   }
   ```

6. **Set up URL routing**:
   - In `backend/urls.py`:
   ```python
   from django.contrib import admin
   from django.urls import path, include

   urlpatterns = [
       path('admin/', admin.site.urls),
       path('api/', include('api.urls')),
       path('pdash/', include('pdash.urls')),
   ]
   ```

7. **Create a basic API endpoint**:
   - Create `api/urls.py`:
   ```python
   from django.urls import path
   from .views import PublicationList

   urlpatterns = [
       path('publications/', PublicationList.as_view(), name='publication-list'),
   ]
   ```

   - Create `api/views.py`:
   ```python
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
   ```

8. **Create a Plotly Dash application**:
   - Create `dashboard/plotly_apps.py`:
   ```python
   import dash
   from dash import dcc, html
   import plotly.express as px
   import pandas as pd
   from django_plotly_dash import DjangoDash

   # Create sample dataframe
   df = pd.DataFrame({
       'Year': [2020, 2021, 2022, 2023, 2023, 2022, 2021],
       'Citations': [45, 102, 78, 32, 45, 64, 89],
       'Title': [
           'Advancements in Genomic Research',
           'Biomarkers for Early Disease Detection',
           'Clinical Applications of CRISPR',
           'New Frontiers in Cancer Treatment',
           'AI in Medical Imaging',
           'Machine Learning in Drug Discovery',
           'Personalized Medicine Approaches'
       ]
   })

   # Register the Dash app with django_plotly_dash
   app = DjangoDash('PublicationsViz')

   # Define the layout
   app.layout = html.Div([
       html.H1('Publication Citations by Year'),
       dcc.Graph(
           figure=px.scatter(
               df, 
               x='Year', 
               y='Citations',
               hover_data=['Title'],
               title='Publication Impact'
           )
       )
   ])
   ```

9. **Initialize the Django database**:
   ```bash
   python manage.py migrate
   ```

10. **Run the Django development server**:
    ```bash
    python manage.py runserver 8000
    ```

11. **Run the React frontend** (in a separate terminal):
    ```bash
    npm run dev
    ```

## Next Steps

1. Connect the React frontend to fetch data from the Django API
2. Embed the Plotly Dash app in your React application
3. Create models in Django to store your data
4. Expand your API endpoints

## Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Django Plotly Dash](https://django-plotly-dash.readthedocs.io/)
- [Plotly Python](https://plotly.com/python/)
