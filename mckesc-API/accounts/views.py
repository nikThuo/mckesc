from django.shortcuts import render
from .serializers import *
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.status import (
	HTTP_200_OK, 
	HTTP_400_BAD_REQUEST, 
	HTTP_401_UNAUTHORIZED, 
	HTTP_201_CREATED
)
from django.contrib.auth.hashers import check_password
from django.contrib.auth import get_user_model
User = get_user_model()
from django.core.mail import send_mail
from django.db.models import Q 

class UserCreateAPIView(generics.CreateAPIView):
	serializer_class = UserCreateSerializer
	queryset = User.objects.all()

class UserList(generics.ListAPIView):
	serializer_class = UserSerializer
	def get_queryset(self):
		try:
			queryset = User.objects.filter().exclude(user_type=0).order_by('id')
			return queryset
		except Exception as e:
			raise e

class UserDetail(generics.RetrieveUpdateDestroyAPIView):
	queryset = User.objects.all()
	serializer_class = UserSerializer

class EmailSearchAPIView(generics.ListAPIView):
	def get(self, request, format=None):
		try:
			res = User.objects.filter(email=self.request.query_params['q']).count()
			if not res:
				res = True
			else:
				res = False
			if self.request.query_params['q'] == '':
				res = False
		except Exception as e:
			return Response(data={"Error": e}, status=status.HTTP_404_NOT_FOUND)
		return Response(data=res, status=status.HTTP_200_OK)

class UsernameSearchAPIView(generics.ListAPIView):
	def get(self, request, format=None):
		try:
			res = User.objects.filter(username=self.request.query_params['q']).count()
			if not res:
				res = True
			else:
				res = False
			if self.request.query_params['q'] == '':
				res = False
		except Exception as e:
			return Response(data={"Error": e}, status=status.HTTP_404_NOT_FOUND)
		return Response(data=res, status=status.HTTP_200_OK)

class ForgotPasswordAPIView(generics.CreateAPIView):
	def post(self, request, format=None):
		try:
			email = request.data['email']
			user_obj = User.objects.get(email=email)
			password = User.objects.make_random_password(length=10, allowed_chars='abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789')
			first_name = user_obj.first_name
			last_name = user_obj.last_name
			subject = 'MultiChoice Kenya Updates Tool Password reset'
			message = 'Hello '+first_name+' '+last_name+', please use this password '+ password +' , to log in and reset it.'
			mail_sent_to_org = send_mail(
				subject,
				message,
				'Bpo Admin <no-reply@technobrainbpo.com>',
				[email]
			)
			user_obj.set_password(password)
			user_obj.save()
		except Exception as e:
			return Response(data={"Error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
		return Response(data={ "Successful": "Successful" }, status=status.HTTP_200_OK)

class PasswordResetAPIView(generics.CreateAPIView):
	serializer_class = PasswordResetSerializer
	queryset = User.objects.all()
	def post(self, request, format=None):
		try:
			password = request.data['password']
			password_reset = request.data['password_reset']
			user = User.objects.get(username=request.data["username"])
			if check_password(request.data["password"], user.password):
				user.set_password(password_reset)
				user.save()
		except Exception as e:
			return Response(data={"Error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
		return Response(status=status.HTTP_200_OK)

class UserLoginAPIView(generics.ListCreateAPIView):
	queryset = User.objects.all()
	serializer_class = UserLoginSerializer
	def post(self, request, format=None):
		try:
			if '@' in request.data['username']:
				kwargs = {'email': request.data['username']}
			else:
				kwargs = {'username': request.data['username']}
			try:
				user = User.objects.get(**kwargs)
			except Exception as e:
				return Response(data={"Error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
		except Exception as e:
			return Response(data={"Error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
		if check_password(request.data["password"], user.password):
			return Response(data={
							"id": user.id, 
							"username": user.username, 
							"first_name": user.first_name, 
							"last_name": user.last_name, 
							"email": user.email, 
							"user_type": user.user_type, 
						}, status=status.HTTP_200_OK)
		else:
			return Response(data={"Info": "Invalid login credentials"}, status=status.HTTP_400_BAD_REQUEST)

class DeleteUserAPIView(APIView):
	def post(self, request, format=None):
		try:
			user_id = request.data['user_id']
			# user = User.objects.get(id=user_id)
			# user.delete()
			# or
			user = User.objects.filter(id=user_id).delete()
		except Exception as e:
			print("Error::", str(e))
			return Response(data={"Error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
		return Response(status=status.HTTP_200_OK)

class searchByNameAPIView(APIView):
	def get(self, request, format=None):
		try:
			query_name = self.request.query_params['q']
			qs = User.objects.all()
			for term in query_name.split():
				qs = qs.filter( Q(first_name__icontains = term) | Q(last_name__icontains = term)).values('username', 'first_name', 'last_name')
		except Exception as e:
			print("Error::", str(e))
			return Response(data={"Error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
		return Response(data=qs, status=status.HTTP_200_OK)
