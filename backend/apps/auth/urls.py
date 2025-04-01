from .views import LoginView, LogoutView, SignupView, PasswordResetRequestView, PasswordResetConfirmView, DeleteAccountView
from django.urls import path

urlpatterns = [
    # Authentication routes
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('password/reset/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('password/reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('signup/', SignupView.as_view(), name='signup'),
    path("delete/", DeleteAccountView.as_view(), name="delete_account"),
]