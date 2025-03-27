
from django.contrib import admin
from .models import Publication, DataType, FileUpload, DataCategory

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
