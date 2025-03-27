
from django.contrib import admin
from .models import Publication, DataType, DataCategory, FileUpload
from .models import Instrument, Electrode, Method, VoltammetryTechnique
from .models import ResearchPublication, Experiment, ExperimentFile, ResearchCollaborator
from .models import DoiVerificationLog, UserSetting, ResearchLibrary, UserAnalytics, Notification, ContactSupport
from .models_research import OrcidProfile, ResearchProject, ResearchProjectCollaborator, DatasetComparison

# Register your models here
admin.site.register(Publication)
admin.site.register(DataType)
admin.site.register(DataCategory)
admin.site.register(FileUpload)
admin.site.register(Instrument)
admin.site.register(Electrode)
admin.site.register(Method)
admin.site.register(VoltammetryTechnique)
admin.site.register(ResearchPublication)
admin.site.register(Experiment)
admin.site.register(ExperimentFile)
admin.site.register(ResearchCollaborator)
admin.site.register(DoiVerificationLog)
admin.site.register(UserSetting)
admin.site.register(ResearchLibrary)
admin.site.register(UserAnalytics)
admin.site.register(Notification)
admin.site.register(ContactSupport)

# Register new research models
@admin.register(OrcidProfile)
class OrcidProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'orcid_id', 'is_verified', 'verified_at')
    list_filter = ('is_verified',)
    search_fields = ('user__username', 'user__email', 'orcid_id')

@admin.register(ResearchProject)
class ResearchProjectAdmin(admin.ModelAdmin):
    list_display = ('project_id', 'title', 'head_researcher', 'status', 'is_public', 'created_at')
    list_filter = ('status', 'is_public')
    search_fields = ('project_id', 'title', 'head_researcher__username')
    date_hierarchy = 'created_at'

@admin.register(ResearchProjectCollaborator)
class ResearchProjectCollaboratorAdmin(admin.ModelAdmin):
    list_display = ('user', 'project', 'role', 'joined_at')
    list_filter = ('role',)
    search_fields = ('user__username', 'project__title')

@admin.register(DatasetComparison)
class DatasetComparisonAdmin(admin.ModelAdmin):
    list_display = ('comparison_id', 'title', 'created_by', 'is_public', 'created_at')
    list_filter = ('is_public',)
    search_fields = ('comparison_id', 'title', 'created_by__username')
    date_hierarchy = 'created_at'
