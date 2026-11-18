#!/usr/bin/env bash
# Walks the built API against real PostgreSQL, Redis and Mailpit (Docker). Needs docker, curl, jq.
set -uo pipefail

API_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
SUFFIX="$$"
PG="umb-smoke-pg-$SUFFIX"; RD="umb-smoke-redis-$SUFFIX"; MP="umb-smoke-mailpit-$SUFFIX"
API_PORT="${SMOKE_API_PORT:-3399}"
API_LOG="$(mktemp)"
API_PID=""
FAILS=0

cleanup() {
  [ -n "$API_PID" ] && kill "$API_PID" 2>/dev/null
  docker rm -f "$PG" "$RD" "$MP" >/dev/null 2>&1 || true
  rm -f "$API_LOG"
}
trap cleanup EXIT

say() { echo "  $*"; }
check() { # check <name> <expected> <actual>
  if [ "$2" = "$3" ]; then say "ok   $1 ($3)"; else say "FAIL $1: expected '$2' got '$3'"; FAILS=$((FAILS + 1)); fi
}

docker run -d --name "$PG" -e POSTGRES_PASSWORD=pw -e POSTGRES_DB=umb -p 127.0.0.1::5432 postgres:17 >/dev/null
# Redis is stopped and started again, so it needs a host port that survives the restart.
RD_PORT="$(python3 -c 'import socket; s = socket.socket(); s.bind(("127.0.0.1", 0)); print(s.getsockname()[1])')"
docker run -d --name "$RD" -p "127.0.0.1:$RD_PORT:6379" redis:7.4-alpine >/dev/null
docker run -d --name "$MP" -p 127.0.0.1::1025 -p 127.0.0.1::8025 axllent/mailpit >/dev/null
port() { docker port "$1" "$2/tcp" | head -1 | sed 's/.*://'; }
PG_PORT="$(port "$PG" 5432)"; SMTP_PORT="$(port "$MP" 1025)"; MAIL_HTTP="$(port "$MP" 8025)"
for _ in $(seq 1 60); do docker exec "$PG" pg_isready -U postgres >/dev/null 2>&1 && break; sleep 1; done
sleep 2

cd "$API_DIR"
export NODE_ENV=development PORT="$API_PORT" JWT_SECRET=smoke-secret JWT_EXPIRATION_IN=1d
export DATABASE_URL="postgresql://postgres:pw@127.0.0.1:$PG_PORT/umb"
export REDIS_URL="redis://127.0.0.1:$RD_PORT" WEB_ORIGIN="http://localhost:4200"
export MAIL_HOST=127.0.0.1 MAIL_PORT="$SMTP_PORT" MAIL_FROM="no-reply@umbrielship.local"
export SEED_ADMIN_EMAIL=admin@umbrielship.test SEED_ADMIN_PASSWORD=change-me-123

npm run build >/dev/null 2>&1 || { echo "build failed"; exit 1; }
npx prisma migrate deploy >/dev/null 2>&1 || { echo "migrate failed"; exit 1; }
npx prisma db seed >/dev/null 2>&1 || { echo "seed failed"; exit 1; }

start_api() {
  node dist/main.js >>"$API_LOG" 2>&1 &
  API_PID=$!
  for _ in $(seq 1 40); do
    curl -s -o /dev/null "http://127.0.0.1:$API_PORT/me" && return 0
    sleep 0.5
  done
  echo "API did not start"; cat "$API_LOG"; exit 1
}

BODY=""
req() { # req METHOD PATH [TOKEN] [JSON]
  local method="$1" path="$2" token="${3:-}" data="${4:-}"
  local args=(-s -o /tmp/smoke-body-$SUFFIX -w '%{http_code}' -X "$method" "http://127.0.0.1:$API_PORT$path" -H 'Content-Type: application/json')
  [ -n "$token" ] && args+=(-H "Authorization: Bearer $token")
  [ -n "$data" ] && args+=(-d "$data")
  STATUS="$(curl "${args[@]}")"
  BODY="$(cat /tmp/smoke-body-$SUFFIX)"
}
login() { req POST /sessions "" "{\"email\":\"$1\",\"password\":\"$2\"}"; echo "$BODY" | jq -r '.access_token'; }
mail_count() { curl -s "http://127.0.0.1:$MAIL_HTTP/api/v1/messages" | jq '.total'; }
wait_mail() { # wait_mail <count>
  for _ in $(seq 1 40); do [ "$(mail_count)" -ge "$1" ] && return 0; sleep 0.5; done
  return 1
}

start_api
echo "sessions and /me"
req POST /sessions "" '{"email":"admin@umbrielship.test","password":"wrong"}'; check "wrong password" 401 "$STATUS"
req POST /sessions "" '{"email":"admin@umbrielship.test","password":"change-me-123"}'; check "sign in" 201 "$STATUS"
T="$(echo "$BODY" | jq -r '.access_token')"
req GET /me "$T"; check "/me" 200 "$STATUS"
check "/me organization" "Umbrielship/true/administrator" "$(echo "$BODY" | jq -r '.user.organization.name + "/" + (.user.organization.isInternal|tostring) + "/" + .user.role')"
req GET /whoami "$T"; check "/whoami is gone" 404 "$STATUS"
req GET /me; check "/me without token" 401 "$STATUS"

echo "organizations and users"
req POST /organizations "$T" '{"name":"Org A","email":"a@orga.test"}'; check "create A" 201 "$STATUS"; A="$(echo "$BODY" | jq -r '.id')"
req POST /organizations "$T" '{"name":"Org B","email":"b@orgb.test"}'; check "create B" 201 "$STATUS"; B="$(echo "$BODY" | jq -r '.id')"
req POST /organizations "$T" '{"name":"org a","email":"other@orga.test"}'; check "repeat name in another case" 409 "$STATUS"
req POST /users "$T" "{\"name\":\"Ua\",\"email\":\"ua@x.test\",\"password\":\"password-a1\",\"role\":\"administrator\",\"organizationId\":\"$A\"}"; check "user A" 201 "$STATUS"
req POST /users "$T" "{\"name\":\"Ub\",\"email\":\"ub@x.test\",\"password\":\"password-b1\",\"role\":\"administrator\",\"organizationId\":\"$B\"}"; check "user B" 201 "$STATUS"; UB="$(echo "$BODY" | jq -r '.id')"
req POST /users "$T" "{\"name\":\"Uc\",\"email\":\"uc@x.test\",\"password\":\"password-c1\",\"role\":\"operator\",\"organizationId\":\"$B\"}"; check "user C" 201 "$STATUS"; UC="$(echo "$BODY" | jq -r '.id')"
req POST /users "$T" "{\"name\":\"Ud\",\"email\":\"UC@x.test\",\"password\":\"password-d1\",\"role\":\"operator\",\"organizationId\":\"$B\"}"; check "user email in another case" 409 "$STATUS"
req POST /users "$T" "{\"name\":\"Ud\",\"email\":\"ud@x.test\",\"password\":\"password-d1\",\"role\":\"operator\",\"organizationId\":\"$B\"}"; UD="$(echo "$BODY" | jq -r '.id')"
TA="$(login ua@x.test password-a1)"; TB="$(login ub@x.test password-b1)"

echo "tenancy"
CUST='{"name":"Cust","email":"cust@x.test","phone":"1","address":{"address":"r","state":"SP","city":"Santos"}}'
req POST /customers "$TA" "$CUST"; check "customer in A" 201 "$STATUS"; CA="$(echo "$BODY" | jq -r '.customer.id // .id')"
req POST /customers "$TB" "$CUST"; check "same customer email in B" 201 "$STATUS"; CB="$(echo "$BODY" | jq -r '.customer.id // .id')"
req POST /customers "$TA" "$(echo "$CUST" | sed 's/cust@/CUST@/')"; check "customer email in another case" 409 "$STATUS"
req GET /customers "$TA"; check "A lists only its customer" 1 "$(echo "$BODY" | jq '.customers | length')"
req POST /vessels "$TA" "{\"imoNumber\":\"9074729\",\"name\":\"V\",\"type\":\"CARGO\",\"length\":10,\"customerId\":\"$CA\"}"; check "IMO in A" 201 "$STATUS"
req POST /vessels "$TB" "{\"imoNumber\":\"9074729\",\"name\":\"V\",\"type\":\"CARGO\",\"length\":10,\"customerId\":\"$CB\"}"; check "same IMO in B" 201 "$STATUS"; VB="$(echo "$BODY" | jq -r '.vessel.id // .id')"
req POST /vessels "$TA" "{\"imoNumber\":\"abc123\",\"name\":\"V\",\"type\":\"CARGO\",\"length\":10,\"customerId\":\"$CA\"}"; check "abc123 in A" 201 "$STATUS"
req POST /vessels "$TA" "{\"imoNumber\":\"ABC123\",\"name\":\"V\",\"type\":\"CARGO\",\"length\":10,\"customerId\":\"$CA\"}"; check "ABC123 in A" 409 "$STATUS"
req GET "/vessels/$VB" "$TA"; check "GET vessel of B from A" 404 "$STATUS"
req POST /work-orders "$TA" "{\"vesselId\":\"$VB\",\"startDate\":\"2026-01-01\",\"endDate\":\"2026-01-02\",\"status\":\"PENDING\"}"; check "work order with B's vessel" 404 "$STATUS"
check "work order message" "Vessel not found" "$(echo "$BODY" | jq -r '.message')"

echo "vessel count"
req POST /customers "$TA" '{"name":"Count","email":"count@x.test","phone":"1","address":{"address":"r","state":"SP","city":"Santos"}}'; CC="$(echo "$BODY" | jq -r '.customer.id')"
count_of() { req GET /customers "$TA"; echo "$BODY" | jq -r --arg id "$1" '.customers[] | select(.id == $id) | .vesselCount'; }
check "customer-ui C14 vesselCount with no vessel" 0 "$(count_of "$CC")"
req POST /vessels "$TA" "{\"imoNumber\":\"7000001\",\"name\":\"C1\",\"type\":\"CARGO\",\"length\":10,\"customerId\":\"$CC\"}"; VC1="$(echo "$BODY" | jq -r '.vessel.id')"
req POST /vessels "$TA" "{\"imoNumber\":\"7000002\",\"name\":\"C2\",\"type\":\"CARGO\",\"length\":10,\"customerId\":\"$CC\"}"
check "customer-ui C14 vesselCount with two vessels" 2 "$(count_of "$CC")"
req DELETE "/vessels/$VC1" "$TA"
check "customer-ui C14 vesselCount after a vessel delete" 1 "$(count_of "$CC")"

echo "work order list, create with services, templates and assignments"
req POST /vessels "$TA" "{\"imoNumber\":\"7000003\",\"name\":\"W1\",\"type\":\"CARGO\",\"length\":10,\"customerId\":\"$CC\"}"; VW="$(echo "$BODY" | jq -r '.vessel.id')"
PERIOD='"startDate":"2026-11-17T09:12:00.000Z","endDate":"2026-11-20T10:00:00.000Z"'
req POST /work-orders "$TA" "{\"vesselId\":\"$VW\",$PERIOD,\"status\":\"PENDING\"}"; WO1="$(echo "$BODY" | jq -r '.workOrder.id')"
services_of() { req GET /work-orders "$TA"; echo "$BODY" | jq -r --arg id "$1" '.workOrders[] | select(.id == $id) | .services | length'; }
check "work-order-ui C3 services with no service" 0 "$(services_of "$WO1")"
req POST "/work-orders/$WO1/services" "$TA" "{\"name\":\"Pintura\",\"description\":\"Casco\",$PERIOD,\"status\":\"PENDING\"}"; SV1="$(echo "$BODY" | jq -r '.service.id')"
check "work-order-ui C3 services after a service create" 1 "$(services_of "$WO1")"
req DELETE "/work-orders/$WO1/services/$SV1" "$TA"
check "work-order-ui C3 services after a service delete" 0 "$(services_of "$WO1")"
req POST /work-orders "$TA" "{\"vesselId\":\"$VW\",\"startDate\":\"2026-12-01T08:00:00.000Z\",\"endDate\":\"2026-12-05T17:30:00.000Z\",\"status\":\"IN_PROGRESS\",\"services\":[{\"name\":\"Pintura\",\"description\":\"Casco\"},{\"name\":\"Motor\",\"description\":\"Revisão\"}]}"; WO2="$(echo "$BODY" | jq -r '.workOrder.id')"
req GET "/work-orders/$WO2" "$TA"; WO2_START="$(echo "$BODY" | jq -r '.workOrder.startDate')"; WO2_END="$(echo "$BODY" | jq -r '.workOrder.endDate')"
req GET "/work-orders/$WO2/services" "$TA"
check "work-order-ui C22 services stored with the work order" 2 "$(echo "$BODY" | jq '.services | length')"
check "work-order-ui C22 services take the work order period and PENDING" ok "$(echo "$BODY" | jq -r --arg s "$WO2_START" --arg e "$WO2_END" 'if (.services | length) > 0 and all(.services[]; .startDate == $s and .endDate == $e and .status == "PENDING") then "ok" else "not" end')"
total_of() { req GET /work-orders "$TA"; echo "$BODY" | jq -r '.total'; }
BEFORE="$(total_of)"
req POST /work-orders "$TA" "{\"vesselId\":\"$VW\",$PERIOD,\"status\":\"PENDING\",\"services\":[{\"name\":\"Pintura\",\"description\":\"Casco\"},{\"name\":\"\",\"description\":\"Motor\"}]}"
check "work-order-ui C22 invalid create answers 400" 400 "$STATUS"
AFTER="$(total_of)"
check "work-order-ui C22 invalid create stores nothing" same "$([ -n "$BEFORE" ] && [ "$BEFORE" != null ] && [ "$BEFORE" = "$AFTER" ] && echo same || echo "$BEFORE $AFTER")"
# Zod accepts a NUL in the second service's name and PostgreSQL refuses it: the WorkOrder written
# first in the same transaction must not stay (AD-035).
BEFORE="$(total_of)"
req POST /work-orders "$TA" "{\"vesselId\":\"$VW\",$PERIOD,\"status\":\"PENDING\",\"services\":[{\"name\":\"Pintura\",\"description\":\"Casco\"},{\"name\":\"Motor\\u0000\",\"description\":\"Revisão\"}]}"
check "work-order-ui C73 refused service write fails" 500 "$STATUS"
AFTER="$(total_of)"
check "work-order-ui C73 refused service write stores no work order" same "$([ -n "$BEFORE" ] && [ "$BEFORE" != null ] && [ "$BEFORE" = "$AFTER" ] && echo same || echo "$BEFORE $AFTER")"
for n in $(seq 1 12); do
  req POST /inspection-templates "$TA" "{\"name\":\"Modelo $n\",\"items\":[{\"label\":\"Casco limpo\",\"type\":\"CONFORMITY\"}]}"
done
TPL="$(echo "$BODY" | jq -r '.inspectionTemplate.id')"
req GET /inspection-templates "$TA"; check "work-order-ui C36 templates without page" 12 "$(echo "$BODY" | jq '.inspectionTemplates | length')"
req POST "/work-orders/$WO1/inspection-assignments" "$TA" "{\"templateId\":\"$TPL\"}"; AS1="$(echo "$BODY" | jq -r '.inspectionAssignment.id')"
work_order_status_of() { req GET /inspection-assignments "$TA"; echo "$BODY" | jq -r --arg id "$1" '.inspectionAssignments[] | select(.id == $id) | .workOrder.status'; }
check "work-order-ui C35 assignment carries the work order status" PENDING "$(work_order_status_of "$AS1")"
req PUT "/work-orders/$WO1" "$TA" "{$PERIOD,\"status\":\"IN_PROGRESS\"}"
check "work-order-ui C35 assignment follows the work order edit" IN_PROGRESS "$(work_order_status_of "$AS1")"

echo "workforce"
req POST /users "$T" "{\"name\":\"Uo\",\"email\":\"uo@x.test\",\"password\":\"password-o1\",\"role\":\"operator\",\"organizationId\":\"$A\"}"
TO="$(login uo@x.test password-o1)"
staff_body() { # staff_body <name> <email> [teamId]
  local team=""; [ -n "${3:-}" ] && team=",\"teamId\":\"$3\""
  echo "{\"name\":\"$1\",\"specialty\":\"Mecânico naval\",\"email\":\"$2\",\"phone\":\"(13) 99821-4401\"$team}"
}
req POST /teams "$TA" '{"name":"Equipe Alfa","specialty":"Motor"}'; TEAM_A="$(echo "$BODY" | jq -r '.team.id')"
req POST /teams "$TA" '{"name":"equipe alfa","specialty":"Motor"}'; check "workforce C6 team name in another case" 409 "$STATUS"
req POST /staff "$TA" "{\"name\":\"  Rafael Mendes \",\"specialty\":\" Mecânico naval \",\"email\":\" Rafael@Umbriel.TEST \",\"phone\":\" (13) 99821-4401 \",\"teamId\":\"$TEAM_A\"}"; ST1="$(echo "$BODY" | jq -r '.staff.id')"
req GET "/staff/$ST1" "$TA"
check "workforce C1 staff stored trimmed and lower-cased" "Rafael Mendes|Mecânico naval|rafael@umbriel.test|(13) 99821-4401" "$(echo "$BODY" | jq -r '.staff | [.name, .specialty, .email, .phone] | join("|")')"
req POST /staff "$TA" "$(staff_body 'RAFAEL MENDES' other@umbriel.test)"; check "workforce C2 staff name in another case" 409 "$STATUS"
req POST /staff "$TA" "$(staff_body 'Outro Nome' RAFAEL@umbriel.test)"; check "workforce C2 staff email in another case" 409 "$STATUS"
req POST /staff "$TB" "$(staff_body 'Rafael Mendes' rafael@umbriel.test)"; check "workforce C2 same staff name in another organization" 201 "$STATUS"
req POST /staff "$TA" "$(staff_body 'Camila Rocha' camila@umbriel.test "$TEAM_A")"; ST2="$(echo "$BODY" | jq -r '.staff.id')"
req GET /teams "$TA"; check "workforce C6 team staffCount" 2 "$(echo "$BODY" | jq -r --arg id "$TEAM_A" '.teams[] | select(.id == $id) | .staffCount')"
req PUT "/staff/$ST1" "$TA" "{\"name\":\"Rafael Mendes\",\"specialty\":\"Mecânica naval\",\"email\":\"rafael@umbriel.test\",\"phone\":\"1\",\"teamId\":\"$TEAM_A\"}"
req GET "/staff/$ST1" "$TA"
check "workforce C4 staff edit reads back" "Mecânica naval/team" "$(echo "$BODY" | jq -r --arg t "$TEAM_A" '.staff.specialty + "/" + (if .staff.teamId == $t then "team" else "no team" end)')"
# Two creates of one name at once: the unique index keeps one.
CONCURRENT=()
for email in c1@umbriel.test c2@umbriel.test; do
  curl -s -o /dev/null -X POST "http://127.0.0.1:$API_PORT/staff" -H 'Content-Type: application/json' -H "Authorization: Bearer $TA" -d "$(staff_body 'Concorrente' "$email")" &
  CONCURRENT+=("$!")
done
# Only the two requests: a bare `wait` would also wait for the API process.
wait "${CONCURRENT[@]}"
req GET /staff "$TA"; check "workforce C38 concurrent staff creates store one" 1 "$(echo "$BODY" | jq '[.staff[] | select(.name == "Concorrente")] | length')"
# A team with two members and no Assignment leaves them with no team.
req POST /teams "$TA" '{"name":"Equipe Bravo","specialty":"Hidráulica"}'; TEAM_B="$(echo "$BODY" | jq -r '.team.id')"
req POST /staff "$TA" "$(staff_body 'João Ferreira' joao@umbriel.test "$TEAM_B")"; ST3="$(echo "$BODY" | jq -r '.staff.id')"
req POST /staff "$TA" "$(staff_body 'Marina Alves' marina@umbriel.test "$TEAM_B")"; ST4="$(echo "$BODY" | jq -r '.staff.id')"
req DELETE "/teams/$TEAM_B" "$TA"
team_of() { req GET "/staff/$1" "$TA"; echo "$BODY" | jq -r '.staff.teamId'; }
check "workforce C7 team members left with no team" "null/null" "$(team_of "$ST3")/$(team_of "$ST4")"
# Assignments written with the WorkOrder.
req POST /teams "$TA" '{"name":"Equipe Charlie","specialty":"Elétrica"}'; TEAM_C="$(echo "$BODY" | jq -r '.team.id')"
WOA_PERIOD='"startDate":"2026-11-17T09:00:00.000Z","endDate":"2026-11-20T17:00:00.000Z"'
req POST /work-orders "$TA" "{\"vesselId\":\"$VW\",$WOA_PERIOD,\"status\":\"IN_PROGRESS\",\"services\":[{\"name\":\"Pintura\",\"description\":\"Casco\",\"staffId\":\"$ST1\"},{\"name\":\"Motor\",\"description\":\"Revisão\",\"teamId\":\"$TEAM_A\"},{\"name\":\"Limpeza\",\"description\":\"Convés\"}]}"
WOA="$(echo "$BODY" | jq -r '.workOrder.id')"
req GET "/work-orders/$WOA/services" "$TA"
service_id() { echo "$BODY" | jq -r --arg n "$1" '.services[] | select(.name == $n) | .id'; }
SV_PINTURA="$(service_id Pintura)"; SV_MOTOR="$(service_id Motor)"; SV_LIMPEZA="$(service_id Limpeza)"
req GET /assignments "$TA"
check "workforce C19 assignment stored with the work order" "staff/team" "$(echo "$BODY" | jq -r --arg wo "$WOA" --arg s "$ST1" --arg t "$TEAM_A" '[.assignments[] | select(.workOrderId == $wo)] as $a | (if any($a[]; .staffId == $s and .teamId == null) then "staff" else "-" end) + "/" + (if any($a[]; .teamId == $t and .staffId == null) then "team" else "-" end)')"
BEFORE="$(total_of)"
req POST /work-orders "$TA" "{\"vesselId\":\"$VW\",$WOA_PERIOD,\"status\":\"PENDING\",\"services\":[{\"name\":\"Pintura\",\"description\":\"Casco\",\"staffId\":\"00000000-0000-4000-8000-000000000001\"}]}"
check "workforce C20 unknown staff answers 404" 404 "$STATUS"
AFTER="$(total_of)"
check "workforce C20 unknown staff stores no work order" same "$([ -n "$BEFORE" ] && [ "$BEFORE" != null ] && [ "$BEFORE" = "$AFTER" ] && echo same || echo "$BEFORE $AFTER")"
req POST /work-orders "$TO" "{\"vesselId\":\"$VW\",$WOA_PERIOD,\"status\":\"PENDING\",\"services\":[{\"name\":\"Pintura\",\"description\":\"Casco\",\"staffId\":\"$ST1\"}]}"
check "workforce C21 operator assignee answers 403" 403 "$STATUS"
req DELETE "/staff/$ST1" "$TA"; check "workforce C5 staff with assignment answers 409" 409 "$STATUS"
assignee_of() { req GET /assignments "$TA"; echo "$BODY" | jq -r --arg sv "$1" '[.assignments[] | select(.workOrderServiceId == $sv)] | if length == 0 then "0" elif .[0].teamId != null then "team" else "staff" end'; }
req PUT "/work-orders/$WOA" "$TA" "{$WOA_PERIOD,\"status\":\"IN_PROGRESS\",\"services\":[{\"id\":\"$SV_PINTURA\",\"teamId\":\"$TEAM_C\"}]}"
check "workforce C22 assignee replaced by a team" team "$(assignee_of "$SV_PINTURA")"
req PUT "/work-orders/$WOA" "$TA" "{$WOA_PERIOD,\"status\":\"IN_PROGRESS\",\"services\":[{\"id\":\"$SV_PINTURA\"}]}"
check "workforce C22 assignee cleared" 0 "$(assignee_of "$SV_PINTURA")"
req PUT "/work-orders/$WOA" "$TA" "{$WOA_PERIOD,\"status\":\"IN_PROGRESS\",\"services\":[{\"id\":\"$SV_LIMPEZA\",\"staffId\":\"$ST2\"}]}"
req DELETE "/work-orders/$WOA/services/$SV_LIMPEZA" "$TA"
check "workforce C24 assignments gone with the service" 0 "$(assignee_of "$SV_LIMPEZA")"
req PUT "/work-orders/$WOA/services/$SV_MOTOR" "$TA" "{\"name\":\"Motor\",\"description\":\"Revisão\",$WOA_PERIOD,\"status\":\"COMPLETED\"}"
req DELETE "/teams/$TEAM_A" "$TA"; check "workforce C7 team responsible for a completed service answers 409" 409 "$STATUS"
req DELETE "/work-orders/$WOA" "$TA"
req GET /assignments "$TA"
check "workforce C24 assignments gone with the work order" 0 "$(echo "$BODY" | jq --arg wo "$WOA" '[.assignments[] | select(.workOrderId == $wo)] | length')"
req DELETE "/staff/$ST1" "$TA"; check "workforce C5 staff without assignment answers 204" 204 "$STATUS"

echo "authorization"
req GET /organizations "$TA"; check "non-internal member on GET /organizations" 403 "$STATUS"
req GET /organizations "$T"; check "internal administrator on GET /organizations" 200 "$STATUS"
req GET /organizations; check "GET /organizations without token" 401 "$STATUS"

echo "invitations"
req POST /invitations "$T" "{\"userId\":\"$UC\",\"organizationId\":\"$A\",\"role\":\"operator\"}"; check "send invitation" 201 "$STATUS"
check "no secret in the response" null "$(echo "$BODY" | jq -r '.secret // "null"')"
wait_mail 1; check "email arrived" 0 "$?"
MID="$(curl -s "http://127.0.0.1:$MAIL_HTTP/api/v1/messages" | jq -r '.messages[0].ID')"
SECRET="$(curl -s "http://127.0.0.1:$MAIL_HTTP/api/v1/message/$MID" | jq -r '.Text' | grep -o 'secret=[0-9a-f]*' | head -1 | cut -d= -f2)"
check "link carries a 64 hex secret" 64 "${#SECRET}"
req POST /invitations/accept "" "{\"secret\":\"$SECRET\"}"; check "accept" 200 "$STATUS"
check "accept organization" "Org A" "$(echo "$BODY" | jq -r '.organizationName')"
req POST /invitations/accept "" "{\"secret\":\"$SECRET\"}"; check "second accept" 409 "$STATUS"
req POST /invitations/accept "" '{"secret":"nope"}'; check "unknown secret" 404 "$STATUS"
TC="$(login uc@x.test password-c1)"
req POST /organizations/switch "$TC" "{\"organizationId\":\"$A\"}"; check "switch to a member organization" 204 "$STATUS"
req GET /me "$TC"; check "/me after switch" "Org A" "$(echo "$BODY" | jq -r '.user.organization.name')"
req POST /organizations/switch "$TC" '{"organizationId":"00000000-0000-4000-8000-000000000000"}'; check "switch to a stranger organization" 404 "$STATUS"

echo "redis down, then recovery at boot"
docker stop "$RD" >/dev/null
req POST /invitations "$T" "{\"userId\":\"$UD\",\"organizationId\":\"$A\",\"role\":\"operator\"}"; check "send invitation with Redis down" 201 "$STATUS"
docker start "$RD" >/dev/null; sleep 2
kill "$API_PID"; wait "$API_PID" 2>/dev/null; start_api
wait_mail 2; check "recovered invitation email arrived" 0 "$?"

echo "postgres down"
docker stop "$PG" >/dev/null
req GET /customers "$TA"; check "GET /customers with PostgreSQL down" 500 "$STATUS"

echo
if [ "$FAILS" -eq 0 ]; then echo "smoke: all checks passed"; else echo "smoke: $FAILS failed"; echo "--- API log tail"; tail -20 "$API_LOG"; exit 1; fi
