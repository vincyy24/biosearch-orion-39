from django.contrib import admin
from .models import Research, Researcher, ResearchLibrary


@admin.register(Research)
class ResearchAdmin(admin.ModelAdmin):
    list_display = ('research_id', 'title', 'head_researcher', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('research_id', 'title', 'head_researcher__username')
    date_hierarchy = 'created_at'

@admin.register(Researcher)
class ResearcherAdmin(admin.ModelAdmin):
    list_display = ('name', 'institution', 'email', 'orcid_id')
    search_fields = ('name', 'institution', 'email', 'orcid_id')

@admin.register(ResearchLibrary)
class ResearchLibraryAdmin(admin.ModelAdmin):
    list_display = ('research_title', 'user', 'saved_at')
    search_fields = ('research_title', 'user__username')
    date_hierarchy = 'saved_at'