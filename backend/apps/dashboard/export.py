
from django.http import HttpResponse, JsonResponse
import csv
import json
from .models import VoltammetryData
import pandas as pd
from io import BytesIO
import datetime

def export_experiment_csv(request, experiment_id):
    """Export a single experiment as CSV"""
    try:
        experiment = VoltammetryData.objects.get(experiment_id=experiment_id)
    except VoltammetryData.DoesNotExist:
        return JsonResponse({'error': 'Experiment not found'}, status=404)
    
    # Create the HttpResponse object with CSV header
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="{experiment.experiment_id}_{experiment.title.replace(" ", "_")}.csv"'
    
    writer = csv.writer(response)
    
    # Write metadata as header rows
    writer.writerow(['Experiment ID', experiment.experiment_id])
    writer.writerow(['Title', experiment.title])
    writer.writerow(['Description', experiment.description])
    writer.writerow(['Experiment Type', experiment.experiment_type])
    writer.writerow(['Scan Rate (mV/s)', experiment.scan_rate])
    writer.writerow(['Electrode Material', experiment.electrode_material])
    writer.writerow(['Electrolyte', experiment.electrolyte])
    writer.writerow(['Temperature (°C)', experiment.temperature])
    writer.writerow(['Date Created', experiment.date_created])
    writer.writerow([])  # Empty row as separator
    
    # Write data headers
    data_headers = ['Potential (V)', 'Current (μA)', 'Time (s)']
    writer.writerow(data_headers)
    
    # Write data points
    data_points = experiment.data_points
    for point in data_points:
        writer.writerow([
            point.get('potential', ''),
            point.get('current', ''),
            point.get('time', '')
        ])
    
    return response

def export_experiment_json(request, experiment_id):
    """Export a single experiment as JSON"""
    try:
        experiment = VoltammetryData.objects.get(experiment_id=experiment_id)
    except VoltammetryData.DoesNotExist:
        return JsonResponse({'error': 'Experiment not found'}, status=404)
    
    # Create the data dictionary
    data = {
        'experiment_id': experiment.experiment_id,
        'title': experiment.title,
        'description': experiment.description,
        'experiment_type': experiment.experiment_type,
        'scan_rate': experiment.scan_rate,
        'electrode_material': experiment.electrode_material,
        'electrolyte': experiment.electrolyte,
        'temperature': experiment.temperature,
        'date_created': experiment.date_created.isoformat(),
        'date_updated': experiment.date_updated.isoformat(),
        'peak_anodic_current': experiment.peak_anodic_current,
        'peak_cathodic_current': experiment.peak_cathodic_current,
        'peak_anodic_potential': experiment.peak_anodic_potential,
        'peak_cathodic_potential': experiment.peak_cathodic_potential,
        'data_points': experiment.data_points
    }
    
    # Create the HttpResponse object with JSON header
    response = HttpResponse(content_type='application/json')
    response['Content-Disposition'] = f'attachment; filename="{experiment.experiment_id}_{experiment.title.replace(" ", "_")}.json"'
    
    # Write the JSON data
    json.dump(data, response, indent=4)
    
    return response

def export_experiment_excel(request, experiment_id):
    """Export a single experiment as Excel"""
    try:
        experiment = VoltammetryData.objects.get(experiment_id=experiment_id)
    except VoltammetryData.DoesNotExist:
        return JsonResponse({'error': 'Experiment not found'}, status=404)
    
    # Create a pandas DataFrame with the metadata
    metadata = {
        'Property': [
            'Experiment ID', 'Title', 'Description', 'Experiment Type', 
            'Scan Rate (mV/s)', 'Electrode Material', 'Electrolyte', 
            'Temperature (°C)', 'Date Created'
        ],
        'Value': [
            experiment.experiment_id, experiment.title, experiment.description,
            experiment.experiment_type, experiment.scan_rate, experiment.electrode_material,
            experiment.electrolyte, experiment.temperature, experiment.date_created
        ]
    }
    metadata_df = pd.DataFrame(metadata)
    
    # Create a pandas DataFrame with the data points
    data_points = experiment.data_points
    data_df = pd.DataFrame(data_points)
    
    # Create an Excel writer
    output = BytesIO()
    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
        metadata_df.to_excel(writer, sheet_name='Metadata', index=False)
        data_df.to_excel(writer, sheet_name='Data', index=False)
        
        # Get the xlsxwriter workbook and worksheet objects
        workbook = writer.book
        metadata_worksheet = writer.sheets['Metadata']
        data_worksheet = writer.sheets['Data']
        
        # Add some formatting
        header_format = workbook.add_format({'bold': True, 'bg_color': '#D9E1F2', 'border': 1})
        
        # Apply the header format to the metadata sheet
        for col_num, value in enumerate(metadata_df.columns.values):
            metadata_worksheet.write(0, col_num, value, header_format)
            
        # Apply the header format to the data sheet
        for col_num, value in enumerate(data_df.columns.values):
            data_worksheet.write(0, col_num, value, header_format)
    
    # Set up the HTTP response
    output.seek(0)
    response = HttpResponse(output.read(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    response['Content-Disposition'] = f'attachment; filename="{experiment.experiment_id}_{experiment.title.replace(" ", "_")}.xlsx"'
    
    return response
