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
                SQUARE_METERS=apt["squareMeters"],
                ROOMS=apt["rooms"],
                LOCATION=apt["location"],
                NOTES=apt["notes"],
                LINK=apt["link"])
            new_apt.save()
            new_apt.COSTS.add(*apt["costs"])
            return JsonResponse({"context": "Added the apartment!"})
        return JsonResponse({"context": "Not ajax"}, status=400)
    return JsonResponse({"context": "Not POST"}, status=400)


def create_cost(request):
    j = json.load(request)
    cost = j.get("payload")
    if request.method == "POST":
        is_ajax = request.headers.get("X-Requested-With") == "XMLHttpRequest"
        if is_ajax:
            if cost.get("name", None):
                new_cost = Cost.objects.create(
                    NAME=cost["name"],
                    PRICE=cost["price"],
                    PRICE_IS_ESTIMATED=cost["priceIsEstimated"]
                )
            else:
                new_cost = Cost.objects.create(
                    TYPE=CostType.objects.get(NAME=cost["type"]),
                    PRICE=cost["price"],
                    PRICE_IS_ESTIMATED=cost["priceIsEstimated"]
                )
            new_cost.save()
            return JsonResponse({"cost_id": new_cost.pk})
        return JsonResponse({"context": "Not AJAX"}, status=400)
    return JsonResponse({"context": "Not POST"}, status=400)
