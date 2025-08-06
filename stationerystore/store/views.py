from django.http import HttpResponse


def index(request):
    return HttpResponse("e-Course App")
