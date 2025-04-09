from django.contrib import admin
from .models import Experiment, ExperimentFile, Instrument, Electrode, VoltammetryTechnique

admin.site.register(Instrument)
admin.site.register(Electrode)
admin.site.register(VoltammetryTechnique)


@admin.register(Experiment)
class ExperimentAdmin(admin.ModelAdmin):
    list_display = (
        'experiment_id',
        'title',
        'description',
        'research',
        'researcher',
        'experiment_type',
        'electrode',
        'instrument',
        'voltammetry_technique',
        'created_at',
        'updated_at',
    )

    search_fields = (
        'experiment_id',
        'research_id',
        'researcher__username',
        'title',
        'description',
    )

    list_filter = (
        'electrode',
        'instrument',
        'voltammetry_technique',
        'experiment_type',
        'created_at',
    )

    fieldsets = (
        (
            'Experiment Information', {
                'fields': (
                    'experiment_id',
                    'title',
                    'description',
                    'experiment_type',
                )
            }
        ),
        (
            'Experimental Parameters', {
                'fields': (
                    'scan_rate',
                    'electrode_material',
                    'electrolyte',
                    'temperature',
                )
            }
        ),
        (
            'Data', {
                'fields': ('data_points',),
            }   
        ),
        (
            'Calculated Metrics', {
                'fields': (
                    'peak_anodic_current',
                    'peak_cathodic_current',
                    'peak_anodic_potential',
                    'peak_cathodic_potential',
                )
            }
        ),
    )
    date_hierarchy = 'created_at'


@admin.register(ExperimentFile)
class ExperimentFileAdmin(admin.ModelAdmin):
    list_display = (
        'file_name',
        'experiment',
        'data_type',
        'data_category',
        'access_level',
        'created_at'
    )

    list_filter = (
        'data_type',
        'data_category',
        'access_level'
    )

    search_fields = (
        'file_name',
        'experiment__title'
    )

    date_hierarchy = 'created_at'
