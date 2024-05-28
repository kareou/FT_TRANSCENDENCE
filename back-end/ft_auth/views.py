from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.

def signin(request):
    return HttpResponse('Signin page')

def signup(request):
    return HttpResponse('Signup page')