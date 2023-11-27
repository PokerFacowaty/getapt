from django.shortcuts import render
from apts.models import Apartment


def index(request):
    apartments = Apartment.objects.all()
    context = {"apts": apartments}
    return render(request, "apts/index.html", )
