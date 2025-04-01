from django.contrib import admin
from .models import OrcidProfile, Notification, UserSetting

@admin.register(OrcidProfile)
class OrcidProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'orcid_id', 'is_verified', 'verified_at')
    list_filter = ('is_verified',)
    search_fields = ('user__username', 'user__email', 'orcid_id')

admin.site.register(Notification)
admin.site.register(UserSetting)