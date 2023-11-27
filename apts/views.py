from django.shortcuts import render
from apts.models import Apartment


def index(request):
    apartments = Apartment.objects.all()
    for apt in apartments:
        apt.total = apt.total_cost()
        apt.costs = apt.COSTS.all()
    context = {"apts": apartments}
    return render(request, "apts/index.html", context)
