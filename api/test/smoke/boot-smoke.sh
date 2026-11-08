#!/usr/bin/env bash
# Boots the built API (`npm run start:prod`) and the dev server (`npm run start:dev`) against real
# PostgreSQL, Redis and Mailpit (Docker), and reads an uploaded image back from /uploads.
# Needs docker, curl, jq.
set -uo pipefail

API_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
SUFFIX="$$"
PG="umb-boot-pg-$SUFFIX"; RD="umb-boot-redis-$SUFFIX"; MP="umb-boot-mailpit-$SUFFIX"
API_PORT="${BOOT_API_PORT:-3398}"
API_LOG="$(mktemp)"
WORK="$(mktemp -d)"
API_PID=""
FAILS=0

stop_api() {
  if [ -n "$API_PID" ]; then
    kill -- "-$API_PID" 2>/dev/null || kill "$API_PID" 2>/dev/null
    wait "$API_PID" 2>/dev/null
    API_PID=""
  fi
}
cleanup() {
  stop_api
  docker rm -f "$PG" "$RD" "$MP" >/dev/null 2>&1 || true
  rm -rf "$API_LOG" "$WORK"
}
trap cleanup EXIT

say() { echo "  $*"; }
check() { # check <name> <expected> <actual>
  if [ "$2" = "$3" ]; then say "ok   $1 ($3)"; else say "FAIL $1: expected '$2' got '$3'"; FAILS=$((FAILS + 1)); fi
}

docker run -d --name "$PG" -e POSTGRES_PASSWORD=pw -e POSTGRES_DB=umb -p 127.0.0.1::5432 postgres:17 >/dev/null
docker run -d --name "$RD" -p 127.0.0.1::6379 redis:7.4-alpine >/dev/null
docker run -d --name "$MP" -p 127.0.0.1::1025 axllent/mailpit >/dev/null
port() { docker port "$1" "$2/tcp" | head -1 | sed 's/.*://'; }
PG_PORT="$(port "$PG" 5432)"; RD_PORT="$(port "$RD" 6379)"; SMTP_PORT="$(port "$MP" 1025)"
for _ in $(seq 1 60); do docker exec "$PG" pg_isready -U postgres >/dev/null 2>&1 && break; sleep 1; done
sleep 2

cd "$API_DIR"
export NODE_ENV=development PORT="$API_PORT" JWT_SECRET=boot-secret JWT_EXPIRATION_IN=1d
export DATABASE_URL="postgresql://postgres:pw@127.0.0.1:$PG_PORT/umb"
export REDIS_URL="redis://127.0.0.1:$RD_PORT" WEB_ORIGIN="http://localhost:4200"
export MAIL_HOST=127.0.0.1 MAIL_PORT="$SMTP_PORT" MAIL_FROM="no-reply@umbrielship.local"
export SEED_ADMIN_EMAIL=admin@umbrielship.test SEED_ADMIN_PASSWORD=change-me-123

npm run build >/dev/null 2>&1 || { echo "build failed"; exit 1; }
npx prisma migrate deploy >/dev/null 2>&1 || { echo "migrate failed"; exit 1; }
npx prisma db seed >/dev/null 2>&1 || { echo "seed failed"; exit 1; }

# `setsid` gives the server its own process group, so stop_api ends npm and node together.
start_api() { # start_api <npm script>
  setsid npm run "$1" >>"$API_LOG" 2>&1 &
  API_PID=$!
  for _ in $(seq 1 120); do
    curl -s -o /dev/null "http://127.0.0.1:$API_PORT/me" && return 0
    sleep 0.5
  done
  echo "API did not start with npm run $1"; cat "$API_LOG"; exit 1
}

BODY=""
req() { # req METHOD PATH [TOKEN] [JSON]
  local method="$1" path="$2" token="${3:-}" data="${4:-}"
  local args=(-s -o "$WORK/body" -w '%{http_code}' -X "$method" "http://127.0.0.1:$API_PORT$path" -H 'Content-Type: application/json')
  [ -n "$token" ] && args+=(-H "Authorization: Bearer $token")
  [ -n "$data" ] && args+=(-d "$data")
  STATUS="$(curl "${args[@]}")"
  BODY="$(cat "$WORK/body")"
}

printf 'PNG-S3' >"$WORK/image.png"

echo "npm run start:prod"
start_api start:prod
req GET /me; check "prod: /me without token" 401 "$STATUS"
req POST /sessions "" '{"email":"admin@umbrielship.test","password":"change-me-123"}'; check "prod: sign in" 201 "$STATUS"
T="$(echo "$BODY" | jq -r '.access_token')"
req POST /customers "$T" '{"name":"Cust","email":"cust@x.test","phone":"1","address":{"address":"r","state":"SP","city":"Santos"}}'; check "prod: customer" 201 "$STATUS"
C="$(echo "$BODY" | jq -r '.customer.id // .id')"
req POST /vessels "$T" "{\"imoNumber\":\"9074729\",\"name\":\"V\",\"type\":\"CARGO\",\"length\":10,\"customerId\":\"$C\"}"; check "prod: vessel" 201 "$STATUS"
V="$(echo "$BODY" | jq -r '.vessel.id // .id')"
req POST /work-orders "$T" "{\"vesselId\":\"$V\",\"startDate\":\"2026-01-01\",\"endDate\":\"2026-01-02\",\"status\":\"PENDING\"}"; check "prod: work order" 201 "$STATUS"
W="$(echo "$BODY" | jq -r '.workOrder.id // .id')"
req POST "/work-orders/$W/services" "$T" '{"name":"S","description":"d","startDate":"2026-01-01","endDate":"2026-01-02","status":"PENDING"}'; check "prod: service" 201 "$STATUS"
S="$(echo "$BODY" | jq -r '.service.id // .id')"
STATUS="$(curl -s -o "$WORK/body" -w '%{http_code}' -X POST "http://127.0.0.1:$API_PORT/work-orders/$W/services/$S/images" -H "Authorization: Bearer $T" -F "file=@$WORK/image.png;type=image/png")"
check "prod: upload image" 201 "$STATUS"
URL="$(jq -r '.image.url' "$WORK/body")"
STATUS="$(curl -s -o "$WORK/served" -w '%{http_code}' "http://127.0.0.1:$API_PORT$URL")"
check "prod: GET $URL" 200 "$STATUS"
check "prod: served bytes" "PNG-S3" "$(cat "$WORK/served")"
stop_api

echo "npm run start:dev"
start_api start:dev
req GET /me; check "dev: /me without token" 401 "$STATUS"
STATUS="$(curl -s -o "$WORK/served" -w '%{http_code}' "http://127.0.0.1:$API_PORT$URL")"
check "dev: GET $URL" 200 "$STATUS"
check "dev: served bytes" "PNG-S3" "$(cat "$WORK/served")"
stop_api

echo
if [ "$FAILS" -eq 0 ]; then echo "boot-smoke: all checks passed"; else echo "boot-smoke: $FAILS failed"; echo "--- API log tail"; tail -30 "$API_LOG"; exit 1; fi
