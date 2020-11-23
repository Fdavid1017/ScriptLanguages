import time
import timeit
from json import dumps

from django.http import JsonResponse, HttpResponse
from django.shortcuts import render

# Create your views here.
from PathFinding.aStar import calculateRoute, Node, mapRouteToList, NodeEncoder


def index(request):
    context = {}

    if request.method == "POST":
        startTime = time.perf_counter()
        map = []

        for key in request.POST.keys():
            if key != "csrfmiddlewaretoken":
                map.append(request.POST.getlist(key))

        route = mapRouteToList(map)

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

        # TODO: return and add option to visualize data (fCost, gCost, hCost)
        # TODO: return and add option to visualize checked tiles (closed list)

        return HttpResponse(dumps({'data': context}), content_type="application/json")

    else:
        return render(request, 'index.html')
