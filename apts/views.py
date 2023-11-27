from django.shortcuts import render
from apts.models import Apartment, Cost, CostType
import json
from django.http import JsonResponse


def index(request):
    apartments = Apartment.objects.all()
    for apt in apartments:
        apt.total = apt.total_cost()
        apt.costs = apt.COSTS.all()
    context = {"apts": apartments}
    return render(request, "apts/index.html", context)


def create_apt(request):
    j = json.load(request)
    apt = j.get("payload")
    if request.method == "POST":
        is_ajax = request.headers.get("X-Requested-With") == "XMLHttpRequest"
        if is_ajax:
            new_apt = Apartment.objects.create(
                SQUARE_METERS=apt["SQUARE_METERS"],
                ROOMS=apt["ROOMS"],
                LOCATION=apt["LOCATION"],
                NOTES=apt["NOTES"],
                LINK=apt["LINK"])
            new_apt.save()
            new_apt.add(x for x in apt["COSTS"])
            return JsonResponse({"context": "Added the apartment!"})
        return JsonResponse({"context": "Not ajax"}, status=400)
    return JsonResponse({"context": "Not POST"}, status=400)


def create_cost(request, apt_id):
    j = json.load(request)
    cost = j.get("payload")
    if request.method == "POST":
        is_ajax = request.headers.get("X-Requested-With") == "XMLHttpRequest"
        if is_ajax:
            if cost.get("NAME", None):
                new_cost = Cost.objects.create(
                    NAME=cost["NAME"],
                    PRICE=cost["PRICE"],
                    PRICE_IS_ESTIMATED=cost["PRICE_IS_ESTIMATED"]
                )
            else:
                new_cost = Cost.objects.create(
                    TYPE=CostType.objects.get(NAME=cost["TYPE"]),
                    PRICE=cost["PRICE"],
                    PRICE_IS_ESTIMATED=cost["PRICE_IS_ESTIMATED"]
                )
            new_cost.save()
