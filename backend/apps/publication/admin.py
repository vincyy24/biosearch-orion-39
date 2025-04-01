from django.contrib import admin
from .models import Publication, PublicationResearcher, DoiVerificationLog

admin.site.register(Publication)
admin.site.register(PublicationResearcher)
admin.site.register(DoiVerificationLog)