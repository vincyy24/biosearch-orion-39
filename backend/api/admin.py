
from django.contrib import admin
from .models import Publication, DataType, FileUpload

@admin.register(Publication)
class PublicationAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'year', 'citations')
    search_fields = ('title', 'author')
    list_filter = ('year',)

@admin.register(DataType)
class DataTypeAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name',)

@admin.register(FileUpload)
class FileUploadAdmin(admin.ModelAdmin):
    list_display = ('file_name', 'data_type', 'upload_date', 'user')
    list_filter = ('data_type', 'upload_date')
    search_fields = ('file_name', 'description')
