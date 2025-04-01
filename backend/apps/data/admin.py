from django.contrib import admin
from .models import Dataset, DatasetComparison, DataCategory, FileUpload, DataType

@admin.register(DatasetComparison)
class DatasetComparisonAdmin(admin.ModelAdmin):
    list_display = ('comparison_id', 'title', 'created_by', 'is_public', 'created_at')
    list_filter = ('is_public',)
    search_fields = ('comparison_id', 'title', 'created_by__username')
    date_hierarchy = 'created_at'

@admin.register(Dataset)
class DatasetAdmin(admin.ModelAdmin):
    list_display = ('title', 'file_type', 'file_size', 'is_public', 'created_at')
    list_filter = ('is_public',)
    search_fields = ('title', 'file_type')
    date_hierarchy = 'created_at'

admin.register(DataCategory)
admin.register(FileUpload)
admin.register(DataType)