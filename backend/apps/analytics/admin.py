from http.client import UNAVAILABLE_FOR_LEGAL_REASONS
from click import UsageError
from django.contrib import admin
from .models import UserAnalytics


admin.site.register(UserAnalytics)