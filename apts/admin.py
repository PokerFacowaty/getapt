from django.contrib import admin
from apts.models import Apartment, Attribute, Cost, PredefinedAttribute

admin.site.register(Apartment)
admin.site.register(Attribute)
admin.site.register(Cost)
admin.site.register(PredefinedAttribute)
