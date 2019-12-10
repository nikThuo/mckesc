from rest_framework import serializers
from .models import *
from rest_framework.serializers import (
	CharField,
	EmailField,
	ModelSerializer,
	SerializerMethodField,
	ValidationError,
)
from django.contrib.auth import get_user_model
User = get_user_model()
from django.template.response import TemplateResponse
from django.template.loader import get_template
from django.core.mail import EmailMessage
from rest_framework.response import Response
from rest_framework.status import HTTP_400_BAD_REQUEST
from rest_framework import status

class UserCreateSerializer(ModelSerializer):
	email = EmailField(label='Email Address')
	class Meta:
		model = User
		fields = [
				'first_name',
				'last_name',
				'username',
				'user_type',
				'email',
		]
		
	def validate_email(self, value):
		data = self.get_initial()
		email = data.get("email")
		user_qs = User.objects.filter(email=email)
		if user_qs.exists():
			raise ValidationError("This email address is already registered.")
			return Response({"Error": "This email address is already registered."}, status=status.HTTP_400_BAD_REQUEST)
		return value

	def create(self, validated_data):
		data = self.get_initial()
		first_name = validated_data['first_name']
		last_name = validated_data['last_name']
		username = validated_data['username']
		user_type = validated_data['user_type']
		email = validated_data['email']
		
		user_obj = User(
			first_name = first_name,
			last_name = last_name,
			username = username,
			user_type = user_type,
			email = email,
		)
		password = User.objects.make_random_password(length=10, allowed_chars='abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789')
		to = [email]
		info = {
			'first_name': first_name,
			'last_name': last_name,
			'password': password,
			'email': email,
			'username': username,
		}
		sendInvite(to, info)
		user_obj.set_password(password)
		user_obj.save()
		return validated_data

def sendInvite(to, info, format=None):
	try:
		response = TemplateResponse('invite_user.html', { 'info': info })
		message = get_template('invite_user.html').render({ 'info': info })
		subject = 'MultiChoice Kenya Updates Tool Credentials'
		from_email = 'Bpo Admin <no-reply@technobrainbpo.com>'
		msg = EmailMessage(subject, message, to=to, from_email=from_email)
		msg.content_subtype = 'html'
		msg.send()
		return response
	except Exception as e:
		raise e

class UserLoginSerializer(serializers.ModelSerializer):
	username = serializers.CharField()
	class Meta:
		model = User
		fields = [
			'username',
			'password',
		]

		extra_kwargs =  {"password": {"write_only": True}}

	def validate(self, data):
		return data

class PasswordResetSerializer(ModelSerializer):
	class Meta:
		model = User
		fields = [
			'username',
			'password',
		]

	def update(self, instance, validated_data):
		instance.username = validated_data.get('username', instance.username)
		password = validated_data['password']
		instance.set_password(password)
		instance.save()
		return instance

class UserSerializer(serializers.ModelSerializer):
	class Meta:
		model = User
		fields = '__all__'

class UserNamesSerializer(serializers.ModelSerializer):
	class Meta:
		model = User
		fields = ['id', 'first_name', 'last_name']
