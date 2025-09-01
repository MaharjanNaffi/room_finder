from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.RegisterAPI.as_view(), name='register'),
    path('login/', views.LoginAPI.as_view(), name='login'),
    path('verify-otp/', views.VerifyOTPAPI.as_view(), name='verify_otp'),
    path('profile/', views.UserProfileAPI.as_view(), name='profile'),
    path('my-reviews/', views.MyReviewsAPI.as_view(), name='my_reviews'),
    path('forgot-password/', views.ForgotPasswordAPI.as_view(), name='forgot_password'),
    path('reset-password/', views.ResetPasswordAPI.as_view(), name='reset_password'),
]