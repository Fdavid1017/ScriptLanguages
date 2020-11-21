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
            map.append(request.POST.getlist(key))

        route = mapRouteToList(map)

        print("\n\nRoute:")
        for t in route:
            print(t)

        jsonString = []

        for a in route:
            jsonString.append(NodeEncoder().encode(a))

        stopTime = time.perf_counter()

        elapsed = stopTime - startTime

        context['route'] = jsonString
        context['executeTime'] = elapsed

        # return JsonResponse(dumps(context), safe=False, status=400)
        # return render(request, "index.html")

        return HttpResponse(dumps({'data': context}), content_type="application/json")

    else:
        return render(request, 'index.html')
