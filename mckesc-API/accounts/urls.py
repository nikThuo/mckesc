from rest_framework.urlpatterns import format_suffix_patterns
from accounts import views
from django.views.decorators.cache import cache_page
from django.urls import path

urlpatterns = [
  path('register/', views.UserCreateAPIView.as_view(), name="register"),
	# path('users/', cache_page(60*5)(views.UserList.as_view()), name="users"),
	path('users/', views.UserList.as_view(), name="users"),
	path('users/<int:pk>/', views.UserDetail.as_view(), name="users"),
	path('search/email/', views.EmailSearchAPIView.as_view(), name="search_email"),
	path('search/username/', views.UsernameSearchAPIView.as_view(), name="search_username"),
	path('forgot_password/', views.ForgotPasswordAPIView.as_view(), name="forgot_password"),
	path('resetpass/', views.PasswordResetAPIView.as_view(), name="resetpass"),
  	path('login/', views.UserLoginAPIView.as_view(), name="login"),
	path('delete_user/', views.DeleteUserAPIView.as_view(), name="delete_user"),
	path('search/name/', views.searchByNameAPIView.as_view(), name="search_username"),
]