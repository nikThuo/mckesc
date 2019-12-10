from django.shortcuts import render
from .serializers import *
from rest_framework.response import Response
from django.http import HttpResponse
from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.status import (
	HTTP_200_OK,
	HTTP_201_CREATED,
	HTTP_400_BAD_REQUEST,
	HTTP_401_UNAUTHORIZED,
	HTTP_404_NOT_FOUND
)
from datetime import timedelta, datetime, date, time
from django.views.generic import TemplateView
from rest_framework.parsers import FileUploadParser, MultiPartParser, FormParser
from django.utils.datastructures import MultiValueDictKeyError
import os
import csv
import json
import uuid
from django.conf import settings
import pusher

pusher_client = pusher.Pusher(
  app_id='787667',
  key='88e089bdad7cd752de3d',
  secret='6949b4686a398e4eeae6',
  cluster='ap2',
  ssl=True
)

class HomePageView(TemplateView):
	def get(self, request, **kwargs):
		return render(request, 'index.html', context=None)

def generateUID():
	uid = uuid.uuid4().hex[:10]
	try:
		UserUpdateView.objects.get(uid=uid)
	except UserUpdateView.DoesNotExist:
		return uid
	else:
		return generateUID()

class EscNameSearchAPIView(APIView):
	def get(self, request, format=None):
		try:
			name = self.request.query_params['q'].upper()
			res = Escalation.objects.filter(name__icontains=name).values('name').distinct()
		except Exception as e:
			return Response(data={"Error": e}, status=status.HTTP_404_NOT_FOUND)
		return Response(data=res, status=status.HTTP_200_OK)

class CreateEscalationAPIView(generics.CreateAPIView):
	serializer_class = EscalationSerializer
	parser_class = FileUploadParser
	def post(self, request, format=None):
		try:
			user_id = int(request.data['user_id'])
			user = User.objects.get(id=user_id)

			name = request.data['name'].upper()
			date_received = request.data['date_received']
			time_received = request.data['time_received']
			contents = request.data['contents']
			channel_received = request.data['channel_received']
			from_name = request.data['from_name']
			if 'from_email' in request.data:
				if str(request.data['from_email']) == 'undefined':
					from_email = None
				else:
					from_email = request.data['from_email']
			else:
				from_email = None
			new_escalation = Escalation(
												date_received=date_received,
												time_received=time_received,
												from_email=from_email,
												from_name=from_name,
												name=name,
												contents=contents,
												channel_received=channel_received,
												user=user
											)
			new_escalation.save()
			try:
				filepath = request.FILES['files']
				for i in request.FILES.getlist('files'):
					new_file = Attachment(
									escalation=new_escalation,
									file=i
								)
					new_file.save()
			except MultiValueDictKeyError:
				pass
			
			# uid = generateUID()
			viewed_update = UserUpdateView.objects.get_or_create(
																							escalation=new_escalation,
																							user=user,
																							viewed=True,
																							# uid=uid,
																						)
			pusher_client.trigger(
														'newupdate-channel', 
														'newupdate-event', 
														{
															'id': new_escalation.id,
															'date_received': new_escalation.date_received,
															'time_received': new_escalation.time_received,
															'from_email': new_escalation.from_email,
															'from_name': new_escalation.from_name,
															'name': new_escalation.name,
															'contents': new_escalation.contents,
															'channel_received': new_escalation.channel_received,
															# 'time_cascaded': new_escalation.time_cascaded,
															# 'channel_communicated': new_escalation.channel_communicated,
															'user__first_name': user.first_name,
															'user__last_name': user.last_name,
															'user_id': user.id,
															'created_at': new_escalation.created_at.strftime("%d %B %Y %H:%M:%S"),
														})

			return Response(status=status.HTTP_201_CREATED)
		except Exception as e:
			print('Error:', e)
			raise e

class EditEscalationAPIView(generics.CreateAPIView):
	serializer_class = EscalationSerializer
	parser_class = FileUploadParser
	def post(self, request, format=None):
		try:
			user_id = int(request.data['user_id'])
			user = User.objects.get(id=user_id)
			update_id = request.data['id']
			kwargs = {}

			if 'name' in request.data:	
				kwargs['name'] = request.data['name'].upper()
			if 'date_received' in request.data:	
				kwargs['date_received'] = request.data['date_received']
			if 'time_received' in request.data:	
				kwargs['time_received'] = request.data['time_received']
			if 'from_name' in request.data:	
				kwargs['from_name'] = request.data['from_name']
			if 'contents' in request.data:	
				kwargs['contents'] = request.data['contents']
			# if 'time_cascaded' in request.data:	
			# 	kwargs['time_cascaded'] = request.data['time_cascaded']
			if 'channel_received' in request.data:	
				kwargs['channel_received'] = request.data['channel_received']
			# if 'channel_communicated' in request.data:	
			# 	kwargs['channel_communicated'] = request.data['channel_communicated']
			if 'user_id' in request.data:	
				kwargs['user'] = user
			if 'from_email' in request.data:
				if str(request.data['from_email']) == 'undefined':
					kwargs['from_email'] = None
				else:
					kwargs['from_email'] = request.data['from_email']
			else:
				kwargs['from_email'] = None

			update_escalation = Escalation.objects.filter(id=update_id).update(**kwargs)
			update_escalation_instance = Escalation.objects.get(id=update_id) 
			try:
				filepath = request.FILES['files']
				for i in request.FILES.getlist('files'):
					new_file = Attachment(
									escalation=update_escalation_instance,
									file=i
								)
					new_file.save()
			except MultiValueDictKeyError:
				pass
			# pusher_client.trigger(
			# 											'newupdate-channel', 
			# 											'newupdate-event', 
			# 											**kwargs)

			return Response(status=status.HTTP_201_CREATED)
		except Exception as e:
			print('Error:', e)
			raise e

def getEscalation(datefrom, dateto, user_id):
	try:
			queryset = Escalation.objects.filter(created_at__range=[datefrom, dateto]).values(
																																									'id',
																																									'date_received',
																																									'time_received',
																																									'from_email',
																																									'from_name',
																																									'name',
																																									'contents',
																																									'channel_received',
																																									'user__first_name',
																																									'user__last_name',
																																									'user_id',
																																									'created_at',
																																								).order_by('-id')
			# 'time_cascaded',
			# 'channel_communicated',
			if not queryset:
				pass
			else:
				for x in queryset:
					try:
						check = UserUpdateView.objects.get(escalation_id=x['id'], user_id=user_id, viewed=True)
						x['viewed'] = True
					except (UserUpdateView.DoesNotExist, UserUpdateView.MultipleObjectsReturned) as e:
						if str(e) == 'UserUpdateView matching query does not exist.':
							x['viewed'] = False
						else:
							x['viewed'] = True

	except Exception as e:
		print('Error:', e)
		raise e
	return queryset

class GetEscalationAPIView(APIView):
	def get(self, request, datefrom, dateto, user_id, format=None):
		try:
			datefrom = datetime.strptime(datefrom, '%Y-%m-%d').date()
			dateto = datetime.strptime(dateto, '%Y-%m-%d').date() + timedelta(+1)
			queryset = getEscalation(datefrom, dateto, user_id)
		except Exception as e:
			return Response(data={"Error": e}, status=status.HTTP_404_NOT_FOUND)
		return Response(data=queryset, status=status.HTTP_200_OK)

class DownloadEscalationsView(APIView):
	def get(self, request, datefrom, dateto, user_id, format=None):
		try:
			datefrom = datetime.strptime(datefrom, '%Y-%m-%d').date() 
			dateto = datetime.strptime(dateto, '%Y-%m-%d').date() + timedelta(+1)
			report_data = getEscalation(datefrom, dateto, user_id)

			try:
				timestamp = datetime.now().time().strftime("%H:%M")
				dateToday = datetime.now().date()
				response = HttpResponse(content_type='text/csv')
				response['Content-Disposition'] = 'attachment; filename="MCK-Escalation '+str(dateToday)+'.csv"'
				writer = csv.writer(response)

				writer.writerow([
					'name',
					'Channel received',
					'Date received',
					'Time received',
					'From Name',
					'Email',
					'Contents',
					# 'Channel communicated',
					# 'Time cascaded',
					'Created at',
					'User',
					'Attachments',
				])
				for element in report_data:
					attachments = Attachment.objects.filter(escalation_id=element['id']).values('file')
					fileurls = ''
					for x in attachments:
						fileurls = fileurls + 'https://lv.technobrainbpo.com/mckesc/media/'+x['file'] + ',\n'
					writer.writerow([
						element['name'],
						element['channel_received'],
						element['date_received'],
						element['time_received'],
						element['from_name'],
						element['from_email'],
						element['contents'],
						# element['channel_communicated'],
						# element['time_cascaded'],
						element['created_at'].strftime("%d %B %Y %H:%M:%S"),
						element['user__first_name'] + element['user__last_name'],
						fileurls
					])
				return response
			except Exception as e:
				return Response({"ErrorReportCsv": str(e)}, status = status.HTTP_400_BAD_REQUEST)
		except Exception as e:
			return Response({"Error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
		return Response(data=report_data, status=status.HTTP_200_OK)

class AttachmentsAPIView(APIView):
	def get(self, request, pk, format=None):
		try:
			attachments = Attachment.objects.filter(escalation_id=pk).values()
		except Exception as e:
			return Response(data={"Error": e}, status=status.HTTP_400_BAD_REQUEST)
		return Response(data=attachments, status=status.HTTP_200_OK)

class DeleteAttachmentAPIView(APIView):
	def post(self, request, format=None):
		try:
			attachment = Attachment.objects.get(id=request.data)
			attachment.delete()
		except Exception as e:
			return Response(data={"Error": e}, status=status.HTTP_400_BAD_REQUEST)
		return Response(status=status.HTTP_200_OK)

class viewdUpdateAPIView(APIView):
	def post(self, request, format=None):
		try:
			update = request.data['update']
			user_id = request.data['user_id']
			# uid = generateUID()
			escalation = Escalation.objects.get(id=update)
			user = User.objects.get(id=user_id)
			viewed_update = UserUpdateView.objects.get_or_create(
																							escalation=escalation,
																							user=user,
																							viewed=True,
																							# uid=uid,
																						)
		except Exception as e:
			return Response(data={"Error": e}, status=status.HTTP_400_BAD_REQUEST)
		return Response(status=status.HTTP_201_CREATED)

class UpdateViewDetailsAPIView(APIView):
	def get(self, request, pk, format=None):
		try:
			users = User.objects.all()
			has_viewed = []
			hasnot_viewed = []
			if not users:
				pass
			else:
				for user in users:
					try:
						user_view = UserUpdateView.objects.get(escalation_id=pk, user_id=user.id)
						has_viewed.append({'user': user.first_name+' '+user.last_name, 'datetime': user_view.created_at })
					except (UserUpdateView.DoesNotExist, UserUpdateView.MultipleObjectsReturned) as e:
						if str(e) == 'UserUpdateView matching query does not exist.':
							hasnot_viewed.append({'user': user.first_name+' '+user.last_name, 'datetime': None })
						else:
							user_view = UserUpdateView.objects.filter(escalation_id=pk, user_id=user.id).values().order_by('-id')[0]
							has_viewed.append({'user': user.first_name+' '+user.last_name, 'datetime': user_view['created_at'] })
			res = {
						'has_viewed': has_viewed,
						'hasnot_viewed': hasnot_viewed,
					}
		except Exception as e:
			return Response(data={"Error": e}, status=status.HTTP_400_BAD_REQUEST)
		return Response(data=res, status=status.HTTP_200_OK)

class CreateHuddleAPIView(generics.CreateAPIView):
	# parser_class = FileUploadParser
	parser_classes = (MultiPartParser, FormParser)
	def post(self, request, format=None):
		try:
			user_id = int(request.data['user_id'])
			user = User.objects.get(id=user_id)
			shift_name = request.data['shift_name']
			agenda = json.loads(request.data['agenda'])
			action = json.loads(request.data['action'])
			date = request.data['date']
			attendees = json.loads(request.data['attendees'])
			conducted_by = json.loads(request.data['conducted_by'])
			if 'file' in request.FILES:
				image = request.FILES['file']
			else:
				image = None

			new_huddle = Huddle(
												shift_name=shift_name,
												image=image,
												date=date,
												user=user
											)
			new_huddle.save()
			try:
				for v in attendees:
					print(v)
					attendee = User.objects.get(id=int(v["id"]))
					HuddleAttendanceView.objects.create(
																				huddle=new_huddle,
																				user=attendee
																			)
				for w in conducted_by:
					conductor = User.objects.get(id=int(w))
					HuddleAttendanceView.objects.create(
																				huddle=new_huddle,
																				user=conductor
																			)
				for x in agenda:
					new_agenda = HuddleAgenda(
									agenda=x,
									user=user,
									huddle=new_huddle,
								)
					new_agenda.save()
				for y in action:
					new_action = HuddleAction(
									huddle=new_huddle,
									user=user,
									action=y,
								)
					new_action.save()
			except Exception as e:
				raise e
			return Response(status=status.HTTP_201_CREATED)
		except Exception as e:
			print('Error:', e)
			raise e

def getHuddle(datefrom, dateto):
	try:
			huddles = Huddle.objects.filter(created_at__range=[datefrom, dateto]).values(
																																							'id',
																																							'shift_name',
																																							'date',
																																							'image',
																																							'user__first_name',
																																							'user__last_name',
																																							'created_at',
																																						).order_by('-id')
	except Exception as e:
		print('Error:', e)
		raise e
	return huddles

class GetHuddleAPIView(APIView):
	def get(self, request, datefrom, dateto, format=None):
		try:
			datefrom = datetime.strptime(datefrom, '%Y-%m-%d').date()
			dateto = datetime.strptime(dateto, '%Y-%m-%d').date() + timedelta(+1)
			huddles = getHuddle(datefrom, dateto)
		except Exception as e:
			return Response(data={"Error": e}, status=status.HTTP_404_NOT_FOUND)
		return Response(data=huddles, status=status.HTTP_200_OK)

class HuddleDetailsAPIView(APIView):
	def get(self, request, pk, format=None):
		try:
			agenda = HuddleAgenda.objects.filter(huddle_id=pk).values().order_by('id')
			action = HuddleAction.objects.filter(huddle_id=pk).values().order_by('id')
			conducted_by = HuddleAttendanceView.objects.filter(huddle_id=pk, user__user_type=1).values('user__first_name', 'user__last_name')
			attendees = HuddleAttendanceView.objects.filter(huddle_id=pk, user__user_type=2).values('user__first_name', 'user__last_name')
			res = {
				'agenda': agenda,
				'action': action,
				'conducted_by': conducted_by,
				'attendees': attendees,
			}
		except Exception as e:
			return Response(data={"Error": e}, status=status.HTTP_400_BAD_REQUEST)
		return Response(data=res, status=status.HTTP_200_OK)

class CreateClarificationAPIView(generics.CreateAPIView):
	def post(self, request, format=None):
		try:
			clarification = request.data['clarification']
			subject = request.data['subject'].upper()
			sender = request.data['sender']
			sender = User.objects.get(id=sender)
			
			try:
				subject_set = ClarificationSubject.objects.get(subject=subject, sender_id=sender)
			except (ClarificationSubject.DoesNotExist, ClarificationSubject.MultipleObjectsReturned) as e:
				if str(e) == 'ClarificationSubject matching query does not exist.':
					subject_set = ClarificationSubject(
													subject=subject,
													sender=sender
												)
					subject_set.save()
			new_clarification = Clarification.objects.create(
																									subject=subject_set,
																									clarification=clarification,
																									sender=sender
																								)
			return Response(status=status.HTTP_201_CREATED)
		except Exception as e:
			print('Error:', e)
			raise e

class RespondClarificationAPIView(generics.CreateAPIView):
	def post(self, request, format=None):
		try:
			clarification = request.data['clarification']
			subject = request.data['subject']
			responder = request.data['responder']
			responder = User.objects.get(id=responder)
			subject_set = ClarificationSubject.objects.get(id=subject)
			subject_set.clarification_status = 1
			subject_set.save()
			new_clarification = Clarification.objects.create(
																									subject=subject_set,
																									clarification=clarification,
																									responder=responder,
																								)
			return Response(status=status.HTTP_201_CREATED)
		except Exception as e:
			print('Error:', e)
			raise e

class	GetClarificationAPIView(generics.ListAPIView):
	serializer_class = ClarificationSubjectSerializer
	def get_queryset(self):
		try:
			pk = self.kwargs['pk']
			queryset = ClarificationSubject.objects.filter(sender_id=pk).order_by('-id')
			return queryset
		except Exception as e:
			raise e

class	GetToClarifyAPIView(generics.ListAPIView):
	serializer_class = ClarificationSubjectSerializer
	def get_queryset(self):
		try:
			queryset = ClarificationSubject.objects.filter(responder=None).order_by('-id')
			return queryset
		except Exception as e:
			raise e

class SubjectSearchAPIView(APIView):
	def get(self, request, format=None):
		try:
			name = self.request.query_params['q'].upper()
			res = ClarificationSubject.objects.filter(subject__icontains=name).values('subject').distinct()
		except Exception as e:
			return Response(data={"Error": e}, status=status.HTTP_404_NOT_FOUND)
		return Response(data=res, status=status.HTTP_200_OK)

class	GetMessagesAPIView(generics.ListAPIView):
	serializer_class = ClarificationSerializer
	def get_queryset(self):
		try:
			pk = self.kwargs['pk']
			queryset = Clarification.objects.filter(subject_id=pk).order_by('id')
			return queryset
		except Exception as e:
			raise e
