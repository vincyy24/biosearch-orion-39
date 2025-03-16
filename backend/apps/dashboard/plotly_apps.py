
import dash
from dash import dcc, html, callback, Input, Output
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
import numpy as np
from django_plotly_dash import DjangoDash

# Keep existing PublicationsViz app
# ... keep existing code (PublicationsViz app)

# Create a new Dash app for Voltammetry visualization
voltammetry_app = DjangoDash('VoltammetryViz')

# Generate sample voltammetry data
def generate_voltammetry_data(scan_rate=100, num_points=100):
    """Generate synthetic cyclic voltammetry data."""
    potential_start = -0.5
    potential_end = 0.5
    potential_step = (potential_end - potential_start) / (num_points // 2)
    
    # Forward scan (increasing potential)
    potential_forward = np.arange(potential_start, potential_end + potential_step, potential_step)
    
    # Reverse scan (decreasing potential)
    potential_reverse = np.arange(potential_end, potential_start - potential_step, -potential_step)
    
    # Combine forward and reverse scans
    potential = np.concatenate([potential_forward, potential_reverse])
    
    # Calculate time based on scan rate (mV/s)
    scan_rate_v_per_s = scan_rate / 1000  # Convert from mV/s to V/s
    time_step = potential_step / scan_rate_v_per_s
    time = np.arange(0, len(potential) * time_step, time_step)
    
    # Generate currents with peaks
    current = np.zeros_like(potential)
    for i, p in enumerate(potential):
        # Baseline current with some noise
        baseline = -5 + np.random.normal(0, 0.2)
        
        # Add oxidation peak (forward scan)
        if i < len(potential_forward):
            oxidation_peak = 15 * np.exp(-np.power((p + 0.1) / 0.05, 2)) if -0.2 <= p <= 0.0 else 0
        else:
            oxidation_peak = 0
            
        # Add reduction peak (reverse scan)
        if i >= len(potential_forward):
            reduction_peak = -10 * np.exp(-np.power((p - 0.3) / 0.05, 2)) if 0.2 <= p <= 0.4 else 0
        else:
            reduction_peak = 0
            
        current[i] = baseline + oxidation_peak + reduction_peak
    
    # Create a DataFrame
    df = pd.DataFrame({
        'Potential (V)': potential,
        'Current (μA)': current,
        'Time (s)': time,
        'Scan Rate (mV/s)': scan_rate
    })
    
    return df

# Generate data for multiple scan rates
scan_rates = [50, 100, 200, 500]
voltammetry_data = pd.concat([generate_voltammetry_data(sr) for sr in scan_rates])

# Layout for the voltammetry app
voltammetry_app.layout = html.Div([
    html.H1('Cyclic Voltammetry Analysis'),
    
    html.Div([
        html.Div([
            html.Label('Plot Type:'),
            dcc.RadioItems(
                id='plot-type',
                options=[
                    {'label': 'Potential vs. Current', 'value': 'potential-current'},
                    {'label': 'Time vs. Current', 'value': 'time-current'},
                    {'label': 'Time vs. Potential', 'value': 'time-potential'}
                ],
                value='potential-current',
                labelStyle={'display': 'block', 'margin': '10px 0'}
            ),
        ], style={'width': '30%', 'display': 'inline-block', 'vertical-align': 'top'}),
        
        html.Div([
            html.Label('Scan Rates:'),
            dcc.Checklist(
                id='scan-rates',
                options=[{'label': f"{sr} mV/s", 'value': sr} for sr in scan_rates],
                value=scan_rates,
                labelStyle={'display': 'block', 'margin': '10px 0'}
            ),
        ], style={'width': '30%', 'display': 'inline-block', 'vertical-align': 'top'}),
        
        html.Div([
            html.Label('Normalize Y-Axis:'),
            dcc.RadioItems(
                id='normalize',
                options=[
                    {'label': 'Yes', 'value': 'yes'},
                    {'label': 'No', 'value': 'no'}
                ],
                value='no',
                labelStyle={'display': 'inline-block', 'margin': '0 10px'}
            ),
        ], style={'width': '30%', 'display': 'inline-block', 'vertical-align': 'top'}),
    ], style={'margin': '20px 0'}),
    
    dcc.Graph(id='voltammetry-graph'),
    
    html.Div([
        html.Button("Download CSV", id="btn-download-csv"),
        dcc.Download(id="download-csv"),
    ], style={'margin': '20px 0'}),
])

@callback(
    Output('voltammetry-graph', 'figure'),
    [Input('plot-type', 'value'),
     Input('scan-rates', 'value'),
     Input('normalize', 'value')]
)
def update_graph(plot_type, selected_scan_rates, normalize):
    # Filter data based on selected scan rates
    filtered_data = voltammetry_data[voltammetry_data['Scan Rate (mV/s)'].isin(selected_scan_rates)]
    
    # Create figure
    fig = go.Figure()
    
    # Group by scan rate
    for scan_rate, group in filtered_data.groupby('Scan Rate (mV/s)'):
        # Sort by appropriate column based on plot type
        if plot_type == 'potential-current':
            group = group.sort_values('Potential (V)')
            x = group['Potential (V)']
            y = group['Current (μA)']
            x_title = 'Potential (V)'
            y_title = 'Current (μA)'
        elif plot_type == 'time-current':
            group = group.sort_values('Time (s)')
            x = group['Time (s)']
            y = group['Current (μA)']
            x_title = 'Time (s)'
            y_title = 'Current (μA)'
        elif plot_type == 'time-potential':
            group = group.sort_values('Time (s)')
            x = group['Time (s)']
            y = group['Potential (V)']
            x_title = 'Time (s)'
            y_title = 'Potential (V)'
        
        # Normalize current if selected
        if normalize == 'yes' and 'Current' in y_title:
            y = y / np.max(np.abs(y))
            y_title = 'Normalized Current'
        
        # Add trace for this scan rate
        fig.add_trace(go.Scatter(
            x=x,
            y=y,
            mode='lines',
            name=f"{scan_rate} mV/s",
            line=dict(width=2)
        ))
    
    # Update layout
    fig.update_layout(
        title=f'Voltammetry Visualization: {plot_type.replace("-", " vs. ").title()}',
        xaxis_title=x_title,
        yaxis_title=y_title,
        legend_title="Scan Rate",
        template='plotly_white'
    )
    
    return fig

@callback(
    Output("download-csv", "data"),
    Input("btn-download-csv", "n_clicks"),
    [Input('scan-rates', 'value')],
    prevent_initial_call=True,
)
def download_csv(n_clicks, selected_scan_rates):
    if n_clicks:
        filtered_data = voltammetry_data[voltammetry_data['Scan Rate (mV/s)'].isin(selected_scan_rates)]
        return dcc.send_data_frame(filtered_data.to_csv, "voltammetry_data.csv", index=False)
