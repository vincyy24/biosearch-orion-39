
from django.contrib import admin
from .models import VoltammetryData

@admin.register(VoltammetryData)
class VoltammetryDataAdmin(admin.ModelAdmin):
    list_display = ('experiment_id', 'title', 'experiment_type', 'date_created')
    search_fields = ('experiment_id', 'title', 'description')
    list_filter = ('experiment_type', 'date_created')
    fieldsets = (
        ('Experiment Information', {
            'fields': ('experiment_id', 'title', 'description', 'experiment_type')
        }),
        ('Experimental Parameters', {
            'fields': ('scan_rate', 'electrode_material', 'electrolyte', 'temperature')
        }),
        ('Data', {
            'fields': ('data_points',)
        }),
        ('Calculated Metrics', {
            'fields': ('peak_anodic_current', 'peak_cathodic_current', 
                      'peak_anodic_potential', 'peak_cathodic_potential')
        }),
    )
