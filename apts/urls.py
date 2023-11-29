from django.urls import path
from . import views

urlpatterns = [
    path('', views.index),
    path('add_cost/', views.create_cost),
    path('add_apt/', views.create_apt)
]
