# from rest_framework.urlpatterns import format_suffix_patterns
from mckescapp import views
from django.views.decorators.cache import cache_page
from django.urls import path

urlpatterns = [
  path('', views.HomePageView.as_view(), name='index'),
	path('escalation/', views.CreateEscalationAPIView.as_view(), name='create-escalation'),
	path('edit_escalation/', views.EditEscalationAPIView.as_view(), name='edit-escalation'),
	path('escalations/<slug:datefrom>/<slug:dateto>/<slug:user_id>/', views.GetEscalationAPIView.as_view(), name='get-escalation'),
	path('download_escalations/<slug:datefrom>/<slug:dateto>/<slug:user_id>/', views.DownloadEscalationsView.as_view(), name='get-escalation'),
	path('search_esc_name/', views.EscNameSearchAPIView.as_view(), name='search-escalation'),
	path('attachments/<int:pk>/', views.AttachmentsAPIView.as_view(), name='attachments'),
	path('delete_attachment/', views.DeleteAttachmentAPIView.as_view(), name='delete-attachment'),
	path('updateview_details/<int:pk>/', views.UpdateViewDetailsAPIView.as_view(), name='huddle-details'),

	path('huddle/', views.CreateHuddleAPIView.as_view(), name='create-huddle'),
	path('huddles/<slug:datefrom>/<slug:dateto>/', views.GetHuddleAPIView.as_view(), name='get-huddle'),
	path('huddle_details/<int:pk>/', views.HuddleDetailsAPIView.as_view(), name='huddle-details'),
	path('viewed_update/', views.viewdUpdateAPIView.as_view(), name='viewed-update'),

	path('create_clarification/', views.CreateClarificationAPIView.as_view(), name='create-clarification'),
	path('respond_clarification/', views.RespondClarificationAPIView.as_view(), name='respond-clarification'),
	path('get_clarification/<int:pk>/', views.GetClarificationAPIView.as_view(), name='get-clarification'),
	path('to_clarify/', views.GetToClarifyAPIView.as_view(), name='to-clarify'),
	path('search_subject/', views.SubjectSearchAPIView.as_view(), name='earch-subject'),
	path('get_messages/<int:pk>/', views.GetMessagesAPIView.as_view(), name='get-messages'),

]
