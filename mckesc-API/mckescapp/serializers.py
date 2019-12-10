from rest_framework import serializers
from accounts.serializers import *
from .models import *
from django.contrib.auth import get_user_model
User = get_user_model()

class EscalationSerializer(serializers.ModelSerializer):
	user = UserSerializer(read_only=True)
	class Meta:
		model = Escalation
		fields = '__all__'

class AttachmentSerializer(serializers.ModelSerializer):
	escalation = EscalationSerializer(read_only=True)
	class Meta:
		model = Attachment
		fields = '__all__'

class HuddleSerializer(serializers.ModelSerializer):
	user = UserSerializer(read_only=True)
	class Meta:
		model = Huddle
		fields = '__all__'

class HuddleAgendaSerializer(serializers.ModelSerializer):
	user = UserSerializer(read_only=True)
	huddle = EscalationSerializer(read_only=True)
	class Meta:
		model = HuddleAgenda
		fields = '__all__'

class HuddleActionSerializer(serializers.ModelSerializer):
	user = UserSerializer(read_only=True)
	huddle = EscalationSerializer(read_only=True)
	class Meta:
		model = HuddleAction
		fields = '__all__'

class ClarificationSubjectSerializer(serializers.ModelSerializer):
	sender = UserNamesSerializer(read_only=True)
	responder = UserNamesSerializer(read_only=True)
	class Meta:
		model = ClarificationSubject
		fields = '__all__'

class ClarificationSerializer(serializers.ModelSerializer):
	subject = ClarificationSubjectSerializer(read_only=True)
	responder = UserNamesSerializer(read_only=True)
	sender	= UserNamesSerializer(read_only=True)
	class Meta:
		model = Clarification
		fields = '__all__'
