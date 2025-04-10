from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import plotly.graph_objects as go
from plotly.utils import PlotlyJSONEncoder
import json
import numpy as np
import pandas as pd

# Create your views here.
class AnalyticsOverviewView(APIView):
    """
    API view to retrieve analytics overview data.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Implementation to retrieve analytics overview data
        return Response({
            'dataset_count': 45,
            'dataset_downloads': 312,
            'publication_count': 18,
            'publication_citations': 87,
            'collaboration_count': 9,
            'monthly_activity': [
                {'month': 'Jan', 'datasets': 3, 'publications': 1},
                {'month': 'Feb', 'datasets': 5, 'publications': 2},
                {'month': 'Mar', 'datasets': 4, 'publications': 1},
                {'month': 'Apr', 'datasets': 6, 'publications': 3},
                {'month': 'May', 'datasets': 8, 'publications': 2},
                {'month': 'Jun', 'datasets': 7, 'publications': 4}
            ]
        })

class ResearchAnalyticsView(APIView):
    """
    API view to retrieve research project analytics.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Implementation to retrieve research project analytics
        return Response({
            'projects': []
        })

class PublicationAnalyticsView(APIView):
    """
    API view to retrieve publication analytics.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Implementation to retrieve publication analytics
        return Response({
            'publications': []
        })

class DatasetAnalyticsView(APIView):
    """
    API view to retrieve dataset analytics.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Implementation to retrieve dataset analytics
        return Response({
            'datasets': []
        })

class ActivityChartView(APIView):
    """
    API view to generate and return Plotly chart data for user activity.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Create sample data for demonstration
        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
        searches = [18, 24, 30, 26, 32, 28, 35, 42]
        publications = [5, 8, 12, 10, 15, 13, 20, 17]
        datasets = [12, 10, 15, 18, 22, 20, 25, 30]
        
        # Create Plotly figure
        fig = go.Figure()
        
        fig.add_trace(go.Scatter(
            x=months,
            y=searches,
            mode='lines+markers',
            name='Searches',
            line=dict(color='#4f46e5', width=2),
            marker=dict(color='#4f46e5', size=8)
        ))
        
        fig.add_trace(go.Scatter(
            x=months,
            y=publications,
            mode='lines+markers',
            name='Publications',
            line=dict(color='#16a34a', width=2),
            marker=dict(color='#16a34a', size=8)
        ))
        
        fig.add_trace(go.Scatter(
            x=months,
            y=datasets,
            mode='lines+markers',
            name='Datasets',
            line=dict(color='#ca8a04', width=2),
            marker=dict(color='#ca8a04', size=8)
        ))
        
        fig.update_layout(
            title='Research Activity Over Time',
            xaxis_title='Month',
            yaxis_title='Count',
            autosize=True,
            margin=dict(l=50, r=20, t=50, b=50),
            legend=dict(orientation='h', y=-0.2),
            template='plotly_white',
            hovermode='closest'
        )
        
        # Convert the figure to JSON
        plot_json = json.loads(json.dumps(fig, cls=PlotlyJSONEncoder))
        
        return Response(plot_json)
