import time
from json import dumps

from django.http import HttpResponse
from django.shortcuts import render

from PathFinding.Node import NodeEncoder
from PathFinding.aStar import mapRouteToList


# Create your views here.


def index(request):
    context = {}

    if request.method == "POST":
        startTime = time.perf_counter()
        map = []

        for key in request.POST.keys():
            if key != "csrfmiddlewaretoken" and key != "diagonalMoves":
                map.append(request.POST.getlist(key))

        result = mapRouteToList(map, request.POST.get("diagonalMoves"))
        route = result[0]

        if route is None:
            context['error'] = "No route found to the destination!"

        else:
            print("\n\nRoute:")
            for t in route:
                print(t)

            jsonString = []

            for a in route:
                jsonString.append(NodeEncoder().encode(a))

            context['route'] = jsonString

        stopTime = time.perf_counter()
        elapsed = stopTime - startTime

        context['executeTime'] = elapsed

        closedJsonString = []
        for t in result[1]:
            closedJsonString.append(NodeEncoder().encode(t))

        context['closedList'] = closedJsonString

        return HttpResponse(dumps({'data': context}), content_type="application/json")

    else:
        return render(request, 'index.html')
