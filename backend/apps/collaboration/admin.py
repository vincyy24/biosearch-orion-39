from django.contrib import admin
from .models import ResearchCollaborator, CollaborationInvite


admin.site.register(CollaborationInvite)

@admin.register(ResearchCollaborator)
class ResearchCollaboratorAdmin(admin.ModelAdmin):
    list_display = ('user', 'research_id', 'role', 'joined_at')
    list_filter = ('role',)
    search_fields = ('research__title', 'user__username')
    date_hierarchy = 'joined_at'

