#TODO: melhorar a doc.
Passos para executar:
1. iniciar hapi server
2. cadastrar uma observation

Bater com o curl
curl -X POST \
  -H "Content-Type: application/fhir+json" \
  -d @teste-json.json \
  http://localhost:8080/fhir/Bundle