from django.urls import path
from . import views

urlpatterns = [
    path("sparql/", views.sparql_query, name="sparql_query"),  # SPARQL查询接口
    path("graph/", views.query_graph, name="sparql_graph"),  # 图谱接口
]
