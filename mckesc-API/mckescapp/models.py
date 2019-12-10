from django.db import models
from accounts.models import *

class Escalation(models.Model):
	date_received 				= models.CharField(max_length=999, null=False, blank=False)
	time_received 				= models.CharField(max_length=999, null=False, blank=False)
	from_email 						= models.CharField(max_length=999, null=True, blank=True)
	from_name 						= models.CharField(max_length=999, null=True, blank=True)
	name 									= models.CharField(max_length=999, null=True, blank=True)
	contents 							= models.CharField(max_length=9999, null=False, blank=False)
	channel_received 			= models.CharField(max_length=999, null=False, blank=False)
	user									= models.ForeignKey(User, null=False, blank=False, on_delete=models.CASCADE)

	updated_at	= models.DateTimeField(null=False, blank=False, auto_now=True)
	created_at	= models.DateTimeField(null=True, blank=True, auto_now_add=True)

	class Meta:
		db_table = "Escalation"
		verbose_name = "Escalation"
		verbose_name_plural = "Escalations"

	def __str__(self):
		return u'%s %s' % (self.id, self.name)

class Attachment(models.Model):
	escalation	= models.ForeignKey(Escalation, null=False, blank=False, on_delete=models.CASCADE)
	file				= models.FileField(null=False, blank=False)
	updated_at	= models.DateTimeField(null=False, blank=False, auto_now=True)
	created_at	= models.DateTimeField(null=True, blank=True, auto_now_add=True)

	class Meta:
		db_table = "Attachment"
		verbose_name = "Attachment"
		verbose_name_plural = "Attachments"

	def __str__(self):
		return u'%s %s' % (self.id, self.file)

class Huddle(models.Model):
	shift_name		= models.CharField(max_length=999, null=False, blank=False)
	date					= models.CharField(max_length=999, null=False, blank=False)
	user					= models.ForeignKey(User, null=False, blank=False, on_delete=models.CASCADE)
	image					= models.FileField(null=True, blank=True)
	updated_at		= models.DateTimeField(null=False, blank=False, auto_now=True)
	created_at		= models.DateTimeField(null=True, blank=True, auto_now_add=True)

	class Meta:
		db_table = "Huddle"
		verbose_name = "Huddle"
		verbose_name_plural = "Huddles"

	def __str__(self):
		return u'%s %s' % (self.id, self.user)

class HuddleAgenda(models.Model):
	agenda		= models.CharField(max_length=999, null=False, blank=False)
	huddle		= models.ForeignKey(Huddle, null=False, blank=False, on_delete=models.CASCADE)
	user			= models.ForeignKey(User, null=False, blank=False, on_delete=models.CASCADE)
	updated_at= models.DateTimeField(null=False, blank=False, auto_now=True)
	created_at= models.DateTimeField(null=True, blank=True, auto_now_add=True)

	class Meta:
		db_table = "HuddleAgenda"
		verbose_name = "HuddleAgenda"
		verbose_name_plural = "HuddleAgendas"

	def __str__(self):
		return u'%s %s' % (self.agenda, self.huddle)

class HuddleAction(models.Model):
	action		= models.CharField(max_length=999, null=False, blank=False)
	huddle		= models.ForeignKey(Huddle, null=False, blank=False, on_delete=models.CASCADE)
	user			= models.ForeignKey(User, null=False, blank=False, on_delete=models.CASCADE)
	updated_at= models.DateTimeField(null=False, blank=False, auto_now=True)
	created_at= models.DateTimeField(null=True, blank=True, auto_now_add=True)

	class Meta:
		db_table = "HuddleAction"
		verbose_name = "HuddleAction"
		verbose_name_plural = "HuddleActions"

	def __str__(self):
		return u'%s %s' % (self.huddle, self.action)

class UserUpdateView(models.Model):
	escalation	= models.ForeignKey(Escalation, null=False, blank=False, on_delete=models.CASCADE)
	viewed			= models.BooleanField(default=False)
	# uid					= models.CharField(max_length=10, null=False, blank=False)
	user				= models.ForeignKey(User, null=False, blank=False, on_delete=models.CASCADE)
	updated_at	= models.DateTimeField(null=False, blank=False, auto_now=True)
	created_at	= models.DateTimeField(null=True, blank=True, auto_now_add=True)
	
	class Meta:
		db_table = "UserUpdateView"
		verbose_name = "UserUpdateView"
		verbose_name_plural = "UserUpdateViews"

	def __str__(self):
		return u'%s, %s' % (self.viewed, self.user)

class HuddleAttendanceView(models.Model):
	huddle			= models.ForeignKey(Huddle, null=False, blank=False, on_delete=models.CASCADE)
	user				= models.ForeignKey(User, null=False, blank=False, on_delete=models.CASCADE)
	updated_at	= models.DateTimeField(null=False, blank=False, auto_now=True)
	created_at	= models.DateTimeField(null=True, blank=True, auto_now_add=True)
	
	class Meta:
		db_table = "HuddleAttendanceView"
		verbose_name = "HuddleAttendanceView"
		verbose_name_plural = "HuddleAttendanceViews"

	def __str__(self):
		return u'%s, %s' % (self.huddle, self.user)

class ClarificationSubject(models.Model):
	CLARIFICATON_STATUS = (
		(0, ('Open')),
		(1, ('Pending')),
		(2, ('Closed')),
	)
	subject		= models.CharField(max_length=255, null=False, blank=False)
	sender		= models.ForeignKey(User, null=False, blank=False, on_delete=models.CASCADE, related_name='sender')
	responder	= models.ForeignKey(User, null=True, blank=True, on_delete=models.CASCADE, related_name='responder')
	viewed		= models.BooleanField(default=False)
	clarification_status = models.IntegerField(choices=CLARIFICATON_STATUS, null=False, blank=False, default=0)
	updated_at= models.DateTimeField(null=False, blank=False, auto_now=True)
	created_at= models.DateTimeField(null=True, blank=True, auto_now_add=True)
	
	class Meta:
		db_table = "ClarificationSubject"
		verbose_name = "ClarificationSubject"
		verbose_name_plural = "ClarificationSubjects"

	def __str__(self):
		return u'%s, %s' % (self.subject, self.sender)

class Clarification(models.Model):
	clarification	= models.CharField(max_length=255, null=False, blank=False)
	viewed				= models.BooleanField(default=False)
	subject				= models.ForeignKey(ClarificationSubject, null=False, blank=False, on_delete=models.CASCADE)
	sender				= models.ForeignKey(User, null=True, blank=True, on_delete=models.CASCADE, related_name='clarification_sender')
	responder			= models.ForeignKey(User, null=True, blank=True, on_delete=models.CASCADE, related_name='clarification_responder')
	updated_at		= models.DateTimeField(null=False, blank=False, auto_now=True)
	created_at		= models.DateTimeField(null=True, blank=True, auto_now_add=True)
	
	class Meta:
		db_table = "Clarification"
		verbose_name = "Clarification"
		verbose_name_plural = "Clarifications"

	def __str__(self):
		return u'%s, %s' % (self.clarification, self.sender)
