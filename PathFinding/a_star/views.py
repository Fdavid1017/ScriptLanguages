from json import dumps

from django.http import JsonResponse
from django.shortcuts import render

# Create your views here.
from PathFinding.aStar import calculateRoute, Vector2, Node, mapRouteToList


def index(request):
    context = {}
    context["test"] = 'temp'
    context["test1"] = 'temp1'

    if request.method == "POST":
        map = []

        for key in request.POST.keys():
            map.append(request.POST.getlist(key))

        route = mapRouteToList(map)

        print("\n\nRoute:")
        for t in route:
            print(t.pos.__str__())

        #context['route'] = route

        # return JsonResponse(dumps(context), safe=False, status=400)
    return render(request, "index.html", {'data': dumps(context)})

# def a_star_calculate(request):
#     map = []
#
#     for key in request.GET.keys():
#         map.append(request.GET.getlist(key))
#
#     route = mapRouteToList(map)
#
#     print("\n\nRoute:")
#     for t in route:
#         print(t.pos.__str__())
#
#     context = {
#         'test': 'test value'
#     }
#
#     return render(request, "index.html", context)
