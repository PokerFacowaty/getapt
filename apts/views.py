from django.shortcuts import render
from apts.models import (Apartment, Cost, CostType, PredefinedAttribute,
                         Attribute)
import json
from django.http import JsonResponse


def index(request):
    apartments = Apartment.objects.all()
    predefinied_attrs = PredefinedAttribute.objects.all()
    for apt in apartments:
        apt.total = apt.total_cost()
        apt.costs = apt.COSTS.all()
        apt.attrs = sorted(list(apt.ATTRIBUTES.all()),
                           key=lambda x: [True, None, False].index(x.IS))
    sorted_by = request.GET.get("sortby", "pk")
    rev = request.GET.get("reverse", "False") == "True"

    # ifs since only 3 cases
    if sorted_by == "Total":
        apartments = sorted(list(apartments), key=lambda x: x.total_cost(),
                            reverse=rev)
    elif sorted_by == "Rooms":
        apartments = sorted(list(apartments), key=lambda x: getattr(
                            x, "ROOMS"), reverse=rev)
    elif sorted_by == "m2":
        apartments = sorted(list(apartments), key=lambda x: getattr(
                            x, "SQUARE_METERS"), reverse=rev)
    elif sorted_by == "Attributes":
        apartments = sorted(list(apartments),
                            key=lambda x: len(x.ATTRIBUTES.filter(IS=True)),
                            reverse=rev)
    context = {"apts": apartments,
               "predefinied_attrs": predefinied_attrs}
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
            new_apt.ATTRIBUTES.add(*apt["attrs"])
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


def create_attr(request):
    j = json.load(request)
    pl = j.get("payload")
    if request.method == "POST":
        is_ajax = request.headers.get("X-Requested-With") == "XMLHttpRequest"
        if is_ajax:
            if pl.get("attr", None):
                attr = pl["attr"]
                new_attr = Attribute.objects.create(
                    NAME=attr["name"],
                    IS=attr["is"]
                )
                new_attr.save()
                print(new_attr.pk)
                return JsonResponse({"attr_id": new_attr.pk})
            return JsonResponse({"context": "Data invalid"}, status=400)
        return JsonResponse({"context": "Not AJAX"}, status=400)
    return JsonResponse({"context": "Not POST"}, status=400)
