from django.urls import path

from a_star import views

urlpatterns = [
    path("", views.index)
]
