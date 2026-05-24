#!/usr/bin/env bash
set -euo pipefail
BASE_URL="${BASE_URL:-http://localhost:8080}"
curl -fsS "$BASE_URL/health" && echo
curl -fsS "$BASE_URL/api/users" && echo
curl -fsS "$BASE_URL/api/tasks" && echo
TASK_ID="$(curl -fsS -X POST "$BASE_URL/api/tasks" -H 'content-type: application/json' -d '{"title":"Smoke test ACA","assignedTo":"user-1"}' | sed -n 's/.*"id":"\([^"]*\)".*//p')"
curl -fsS -X PATCH "$BASE_URL/api/tasks/$TASK_ID/status" -H 'content-type: application/json' -d '{"status":"done"}' && echo
curl -fsS "$BASE_URL/api/notifications" && echo
