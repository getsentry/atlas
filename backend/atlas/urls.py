from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path
from django.views.decorators.csrf import csrf_exempt

from atlas.views import EnhancedGraphQLView

urlpatterns = [
    path("healthz/", include("health_check.urls")),
    path("graphql/", csrf_exempt(EnhancedGraphQLView.as_view(graphiql=settings.DEBUG))),
]
if settings.MEDIA_ROOT:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
