from django.urls import path

from a_star import views

urlpatterns = [
    path("", views.index),
    # path("a_star_calculate/", views.a_star_calculate)
]
