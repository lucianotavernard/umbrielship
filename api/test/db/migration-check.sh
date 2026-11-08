#!/usr/bin/env bash
# Checks the tenancy migration against a throwaway PostgreSQL 17 (Docker).
# Usage: migration-check.sh backfill | roles | constraints | drift | seed
set -euo pipefail

MODE="${1:?mode: backfill|roles|constraints|drift|seed}"
API_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
MIG_DIR="$API_DIR/src/package/shared/module/prisma/migrations"
NEW_MIGRATION="20261108120000_add_tenancy"
CONTAINER="umbrielship-migcheck-$$"

docker run -d --rm --name "$CONTAINER" -e POSTGRES_PASSWORD=pw -p 127.0.0.1::5432 postgres:17 >/dev/null
trap 'docker rm -f "$CONTAINER" >/dev/null 2>&1 || true' EXIT
PORT="$(docker port "$CONTAINER" 5432/tcp | head -1 | sed 's/.*://')"
for _ in $(seq 1 60); do
  docker exec "$CONTAINER" pg_isready -U postgres >/dev/null 2>&1 && break
  sleep 1
done
sleep 2

psql_db() { docker exec -i "$CONTAINER" psql -v ON_ERROR_STOP=1 -q -t -A -U postgres -d "$1"; }
q() { echo "$2" | psql_db "$1"; }
fail() { echo "FAIL: $*" >&2; exit 1; }
expect() { [ "$1" = "$2" ] || fail "$3: expected '$2' got '$1'"; }
new_db() { docker exec "$CONTAINER" psql -U postgres -q -c "create database $1" >/dev/null; }
apply_old() {
  for d in $(ls "$MIG_DIR" | grep -v migration_lock | sort); do
    [ "$d" \< "$NEW_MIGRATION" ] && psql_db "$1" < "$MIG_DIR/$d/migration.sql" >/dev/null
  done
  return 0
}
apply_new() { psql_db "$1" < "$MIG_DIR/$NEW_MIGRATION/migration.sql" >/dev/null; }
db_url() { echo "postgresql://postgres:pw@127.0.0.1:$PORT/$1"; }

fixture() {
  q "$1" "
INSERT INTO users (id,name,email,password,role) VALUES
 ('u1','Ana','ana@x.test','h','MANAGER'),('u2','Bia','bia@x.test','h','DEVELOPER'),('u3','Caio','caio@x.test','h','USER');
INSERT INTO customers (id,name,email,phone) VALUES ('c1','C1','c1@x.test','1'),('c2','C2','c2@x.test','2');
INSERT INTO customer_addresses (id,\"customerId\",address,city,state) VALUES ('a1','c1','r','c','s'),('a2','c2','r','c','s');
INSERT INTO vessels (id,\"customerId\",\"imoNumber\",name,type,length) VALUES
 ('v1','c1','1000001','V1','CARGO',10),('v2','c1','1000002','V2','TANKER',20),('v3','c2','1000003','V3','OTHER',30);
INSERT INTO work_orders (id,\"vesselId\",\"startDate\",\"endDate\") VALUES
 ('w1','v1',now(),now()),('w2','v1',now(),now()),('w3','v2',now(),now()),('w4','v3',now(),now());
INSERT INTO work_order_services (id,\"workOrderId\",name,description,\"startDate\",\"endDate\") VALUES
 ('s1','w1','n','d',now(),now()),('s2','w1','n','d',now(),now()),('s3','w2','n','d',now(),now()),('s4','w3','n','d',now(),now()),('s5','w4','n','d',now(),now());
INSERT INTO work_order_service_images (id,\"serviceId\",url) VALUES ('i1','s1','/u/1'),('i2','s2','/u/2');
"
}

TENANT="customers customer_addresses vessels work_orders work_order_services work_order_service_images"

case "$MODE" in
backfill)
  new_db bf; apply_old bf; fixture bf
  declare -A before
  for t in $TENANT users; do before[$t]="$(q bf "select count(*) from $t")"; done
  apply_new bf
  expect "$(q bf "select count(*) from organizations")" 1 "organizations"
  expect "$(q bf "select name||':'||\"isInternal\" from organizations")" "Umbrielship:true" "internal organization"
  for t in $TENANT; do
    expect "$(q bf "select count(*) from $t")" "${before[$t]}" "$t count"
    expect "$(q bf "select count(*) from $t where \"organizationId\" = (select id from organizations where \"isInternal\")")" "${before[$t]}" "$t organizationId"
    expect "$(q bf "select is_nullable from information_schema.columns where table_name='$t' and column_name='organizationId'")" NO "$t NOT NULL"
  done
  expect "${before[customers]}/${before[vessels]}/${before[work_orders]}" "2/3/4" "fixture sizes"
  # empty database: no organization is created, columns are still NOT NULL
  new_db empty; apply_old empty; apply_new empty
  expect "$(q empty "select count(*) from organizations")" 0 "empty database organizations"
  echo "ok backfill"
  ;;
roles)
  new_db rl; apply_old rl; fixture rl; apply_new rl
  expect "$(q rl "select u.id||'='||m.role from users u join memberships m on m.\"userId\"=u.id order by u.id" | tr '\n' ' ')" "u1=administrator u2=administrator u3=operator " "roles"
  expect "$(q rl "select count(*) from memberships")" 3 "one membership each"
  expect "$(q rl "select count(*) from users where \"activeOrganizationId\" = (select id from organizations where \"isInternal\")")" 3 "active organization"
  expect "$(q rl "select count(*) from information_schema.columns where table_name='users' and column_name='role'")" 0 "users.role dropped"
  expect "$(q rl "select count(*) from pg_type where typname='UserRole'")" 0 "UserRole dropped"
  echo "ok roles"
  ;;
constraints)
  new_db ct; apply_old ct; fixture ct; apply_new ct
  q ct "insert into organizations (id,name,email) values ('oA','A','a@x.test'),('oB','B','b@x.test');
        insert into customers (id,\"organizationId\",name,email,phone) values ('ca','oA','n','m@x.test','1'),('cb','oB','n','m@x.test','1');
        insert into vessels (id,\"organizationId\",\"customerId\",\"imoNumber\",name,type,length) values ('va','oA','ca','9074729','n','CARGO',1),('vb','oB','cb','9074729','n','CARGO',1);" >/dev/null
  dup() { if q ct "$1" >/dev/null 2>&1; then fail "$2 should violate a unique index"; fi; }
  dup "insert into vessels (id,\"organizationId\",\"customerId\",\"imoNumber\",name,type,length) values ('vx','oA','ca','abc123','n','CARGO',1),('vy','oA','ca','ABC123','n','CARGO',1)" "imo case"
  dup "insert into customers (id,\"organizationId\",name,email,phone) values ('cx','oA','n','M@X.test','1')" "customer email case"
  dup "insert into users (id,name,email,password) values ('ux','n','Maria@x.test','h'),('uy','n','maria@x.test','h')" "user email case"
  dup "insert into organizations (id,name,email) values ('ox','a','z@x.test')" "organization name case"
  dup "insert into organizations (id,name,email) values ('oy','Z','A@x.test')" "organization email case"
  q ct "insert into work_orders (id,\"organizationId\",\"vesselId\",\"startDate\",\"endDate\") values ('wz','oA','no-such-vessel',now(),now())" >/dev/null || fail "work order without vessel foreign key"
  expect "$(q ct "select count(*) from information_schema.table_constraints where table_name='work_orders' and constraint_type='FOREIGN KEY' and constraint_name like '%vessel%'")" 0 "work_orders vessel FK"
  for t in $TENANT; do
    [ "$(q ct "select count(*) from pg_indexes where tablename='$t' and indexdef like '%(\"organizationId\"%'")" -ge 1 ] || fail "$t has no organizationId index"
  done
  echo "ok constraints"
  ;;
drift)
  new_db dr
  cd "$API_DIR"
  export DATABASE_URL="$(db_url dr)"
  npx prisma migrate deploy >/dev/null 2>&1 || fail "migrate deploy failed"
  second="$(npx prisma migrate deploy 2>&1)"
  echo "$second" | grep -q "No pending migrations" || fail "second deploy applied something"
  npx prisma migrate diff --from-config-datasource --to-schema src/package/shared/module/prisma/schema.prisma --exit-code >/dev/null 2>&1 || fail "drift between migrations and schema.prisma"
  echo "ok drift"
  ;;
seed)
  cd "$API_DIR"
  # empty database
  new_db sd1
  export DATABASE_URL="$(db_url sd1)" SEED_ADMIN_EMAIL=admin@umbrielship.test SEED_ADMIN_PASSWORD=change-me-123
  npx prisma migrate deploy >/dev/null 2>&1
  npx prisma db seed >/dev/null 2>&1 || fail "seed on empty database"
  count() { q "$1" "select (select count(*) from organizations where \"isInternal\")||'/'||(select count(*) from organizations)||'/'||(select count(*) from users where email='admin@umbrielship.test')||'/'||(select count(*) from memberships m join users u on u.id=m.\"userId\" join organizations o on o.id=m.\"organizationId\" where u.email='admin@umbrielship.test' and o.\"isInternal\" and m.role='administrator')||'/'||(select count(*) from users u join organizations o on o.id=u.\"activeOrganizationId\" where u.email='admin@umbrielship.test' and o.\"isInternal\")"; }
  first="$(count sd1)"; expect "$first" "1/1/1/1/1" "seed empty"
  npx prisma db seed >/dev/null 2>&1 || fail "second seed"
  expect "$(count sd1)" "$first" "seed twice"
  # backfilled database
  new_db sd2; apply_old sd2; fixture sd2; apply_new sd2
  export DATABASE_URL="$(db_url sd2)"
  before="$(q sd2 "select count(*) from organizations")/$(q sd2 "select count(*) from users")"
  npx prisma db seed >/dev/null 2>&1 || fail "seed on backfilled database"
  npx prisma db seed >/dev/null 2>&1 || fail "second seed on backfilled database"
  expect "$(q sd2 "select count(*) from organizations")" 1 "backfilled organizations"
  expect "$(q sd2 "select count(*) from users where email='admin@umbrielship.test'")" 1 "backfilled admin user"
  expect "$before" "1/3" "before seed"
  echo "ok seed"
  ;;
*) fail "unknown mode $MODE" ;;
esac
