from django.urls import include, path
from . import views

urlpatterns = [
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('signup/', views.SignupView.as_view(), name='signup'),
    path('delete-account/', views.DeleteAccountView.as_view(), name='delete_account'),
    path('reset-password/', views.PasswordResetRequestView.as_view(), name='reset_password'),
    path('reset-password/confirm/', views.PasswordResetConfirmView.as_view(), name='reset_password_confirm'),
    # Split email verification into two distinct endpoints
    path('send-verification-email/', views.SendEmailVerificationView.as_view(), name='send_verification_email'),
    path('verify-email/', views.EmailVerificationView.as_view(), name='verify_email'),
]
