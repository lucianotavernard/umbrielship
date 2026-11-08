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
