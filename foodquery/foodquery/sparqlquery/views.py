from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
from SPARQLWrapper import SPARQLWrapper, JSON

# Create your views here.

@csrf_exempt
def sparql_query(request):
    if request.method == 'POST':
        # 获取查询
        body = json.loads(request.body)
        query = body.get('query', '')
        print(f"Received query: {query}")
        sparql = SPARQLWrapper("http://localhost:3030/test/sparql")
        sparql.setQuery(query)
        sparql.setReturnFormat(JSON)

        try:
            results = sparql.query().convert()
            return JsonResponse(results, safe=False)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=405)
@csrf_exempt
def query_graph(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        sparql_query = data.get('query')

        sparql = SPARQLWrapper("http://localhost:3030/test/sparql")
        sparql.setQuery(sparql_query)
        sparql.setReturnFormat(JSON)
        # 转换数据
        try:
            results = sparql.query().convert()
            nodes = []
            edges = []

            for result in results["results"]["bindings"]:
                subject = result.get("subject", {}).get("value")
                predicate = result.get("predicate", {}).get("value")
                object = result.get("object", {}).get("value")

                if subject not in [n["id"] for n in nodes]:
                    nodes.append({"id": subject, "label": subject.split("/")[-1]})
                if object not in [n["id"] for n in nodes]:
                    nodes.append({"id": object, "label": object.split("/")[-1]})

                edges.append({
                    "id": f"{subject}-{predicate}-{object}",
                    "source": subject,
                    "target": object,
                    "label": predicate.split("/")[-1]
                })
            node_ids = [node['id'] for node in nodes]
            print(f"Unique node IDs: {len(set(node_ids))}, Total node IDs: {len(node_ids)}")
            for edge in edges:
                if edge['source'] not in node_ids or edge['target'] not in node_ids:
                    print(f"Invalid edge: {edge}")

            print({
                "nodes": nodes,
                "edges": edges
            })
            return JsonResponse({
                "nodes": nodes,
                "edges": edges
            })

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    
    return JsonResponse({"error": "Method not allowed"}, status=405)