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
