from django.contrib import admin
from .models import *

admin.site.register(Escalation)
admin.site.register(Attachment)
admin.site.register(Huddle)
admin.site.register(HuddleAgenda)
admin.site.register(HuddleAction)
admin.site.register(UserUpdateView)
admin.site.register(HuddleAttendanceView)

