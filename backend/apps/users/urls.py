from . import views
from django.urls import path

urlpatterns = [
    # User profile and settings
    path('notifications/', views.UserNotificationsView.as_view(), name='user_notifications'),
    path('notifications/settings/', views.NotificationSettingsView.as_view(), name='notification_settings'),
    path('profile/<str:username>/', views.UserPublicProfileView.as_view(), name='user_profile'),
    path('search/', views.UserSearchView.as_view(), name='user_search'),
    path('settings/', views.UserSettingsView.as_view(), name='user_settings'),

    # User profile routes
    path('me/', views.UserProfileView.as_view(), name='user_profile'),
    path('me/password/', views.UpdatePasswordView.as_view(), name='update_password'),
    path('me/username/', views.UpdateUsernameView.as_view(), name='update_username'),
]
