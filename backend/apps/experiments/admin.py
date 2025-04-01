from django.contrib import admin
from .models import Experiment, ExperimentFile, Instrument, Electrode, Method, VoltammetryTechnique

admin.site.register(Instrument)
admin.site.register(Electrode)
admin.site.register(Method)
admin.site.register(VoltammetryTechnique)


@admin.register(Experiment)
class ExperimentAdmin(admin.ModelAdmin):
    list_display = ('research_id', 'title', 'researcher', 'method',
                    'electrode', 'instrument', 'voltammetry_technique', 'created_at')
    list_filter = ('method', 'electrode', 'instrument',
                   'voltammetry_technique')
    search_fields = ('experiment_id', 'research_id',
                     'title', 'researcher__username')


@admin.register(Experiment)
class Admin(admin.ModelAdmin):
    list_display = ('experiment_id', 'title', 'research_id', 'researcher', 'experiment_type',
                    'method', 'electrode', 'instrument', 'voltammetry_technique', 'date_created')
    search_fields = ('experiment_id', 'research_id',
                     'researcher__username' 'title', 'description')
    list_filter = ('method', 'electrode', 'instrument',
                   'voltammetry_technique', 'experiment_type', 'date_created')
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
    date_hierarchy = 'created_at'


@admin.register(ExperimentFile)
class ExperimentFileAdmin(admin.ModelAdmin):
    list_display = ('file_name', 'experiment', 'data_type',
                    'data_category', 'access_level', 'created_at')
    list_filter = ('data_type', 'data_category', 'access_level')
    search_fields = ('file_name', 'experiment__title')
    date_hierarchy = 'created_at'
