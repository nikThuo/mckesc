from django.db import models
from django.conf import settings
from django.contrib.auth.models import ( AbstractUser )

class User(AbstractUser):
	USER_TYPE = (
		(0, ('None')),
		(1, ('administrator')),
		(2, ('agent')),
	)
	user_type = models.IntegerField(choices=USER_TYPE, null=False, blank=False, default=0)
	def __str__(self):
		return u'%s %s %s' % (self.first_name, self.last_name ,self.id)
