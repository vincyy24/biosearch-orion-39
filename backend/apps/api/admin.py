
from django.contrib import admin
from .models import (
    Publication, DataType, FileUpload, DataCategory,
    Instrument, Electrode, Method, VoltammetryTechnique,
    ResearchPublication, Experiment, ExperimentFile,
    ResearchCollaborator, DoiVerificationLog, UserSetting,
    ResearchLibrary, UserAnalytics, Notification, ContactSupport
)

@admin.register(Publication)
class PublicationAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'year', 'citations')
    search_fields = ('title', 'author')
    list_filter = ('year',)

@admin.register(DataType)
class DataTypeAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name',)

@admin.register(DataCategory)
class DataCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name', 'description')

@admin.register(FileUpload)
class FileUploadAdmin(admin.ModelAdmin):
    list_display = ('file_name', 'data_type', 'category', 'user', 'upload_date', 'is_public', 'downloads_count')
    list_filter = ('data_type', 'category', 'is_public', 'upload_date')
    search_fields = ('file_name', 'description', 'user__username')
    readonly_fields = ('file_size', 'upload_date', 'downloads_count')
    
    fieldsets = (
        ('File Information', {
            'fields': ('file_name', 'file_path', 'file_size', 'description')
        }),
        ('Categorization', {
            'fields': ('data_type', 'category', 'is_public')
        }),
        ('Experiment Details', {
            'fields': ('method', 'electrode_type', 'instrument')
        }),
        ('User and Statistics', {
            'fields': ('user', 'upload_date', 'downloads_count')
        }),
    )

# Register new models
@admin.register(Instrument)
class InstrumentAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(Electrode)
class ElectrodeAdmin(admin.ModelAdmin):
    list_display = ('type',)
    search_fields = ('type',)

@admin.register(Method)
class MethodAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(VoltammetryTechnique)
class VoltammetryTechniqueAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(ResearchPublication)
class ResearchPublicationAdmin(admin.ModelAdmin):
    list_display = ('title', 'doi', 'verified', 'access_level', 'created_at')
    list_filter = ('verified', 'access_level', 'created_at')
    search_fields = ('title', 'description', 'doi')
    readonly_fields = ('created_at',)

@admin.register(Experiment)
class ExperimentAdmin(admin.ModelAdmin):
    list_display = ('title', 'research_id', 'researcher', 'method', 'electrode', 'instrument', 'created_at')
    list_filter = ('method', 'electrode', 'instrument', 'created_at')
    search_fields = ('title', 'description', 'research_id', 'researcher__username')
    readonly_fields = ('created_at',)

@admin.register(ExperimentFile)
class ExperimentFileAdmin(admin.ModelAdmin):
    list_display = ('file_name', 'experiment', 'data_type', 'access_level', 'created_at')
    list_filter = ('data_type', 'access_level', 'created_at')
    search_fields = ('file_name', 'description', 'experiment__title')
    readonly_fields = ('created_at',)

@admin.register(ResearchCollaborator)
class ResearchCollaboratorAdmin(admin.ModelAdmin):
    list_display = ('user', 'research', 'permission_level')
    list_filter = ('permission_level',)
    search_fields = ('user__username', 'research__title')

@admin.register(DoiVerificationLog)
class DoiVerificationLogAdmin(admin.ModelAdmin):
    list_display = ('doi', 'publication', 'verified', 'created_at')
    list_filter = ('verified', 'created_at')
    search_fields = ('doi', 'publication__title')
    readonly_fields = ('created_at',)

@admin.register(UserSetting)
class UserSettingAdmin(admin.ModelAdmin):
    list_display = ('user', 'theme', 'data_visibility')
    list_filter = ('theme', 'data_visibility', 'show_welcome_screen')
    search_fields = ('user__username',)

@admin.register(ResearchLibrary)
class ResearchLibraryAdmin(admin.ModelAdmin):
    list_display = ('research_title', 'user', 'research_doi', 'saved_at')
    list_filter = ('saved_at',)
    search_fields = ('research_title', 'research_doi', 'user__username')
    readonly_fields = ('saved_at',)

@admin.register(UserAnalytics)
class UserAnalyticsAdmin(admin.ModelAdmin):
    list_display = ('user', 'search_count', 'saved_items_count', 'research_hours', 'last_updated')
    search_fields = ('user__username',)
    readonly_fields = ('last_updated',)

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'message', 'is_read', 'created_at')
    list_filter = ('is_read', 'created_at')
    search_fields = ('user__username', 'message')
    readonly_fields = ('created_at',)

@admin.register(ContactSupport)
class ContactSupportAdmin(admin.ModelAdmin):
    list_display = ('subject', 'user', 'created_at', 'processed')
    list_filter = ('processed', 'created_at')
    search_fields = ('subject', 'message', 'user__username')
    readonly_fields = ('created_at',)
