# Verification

Run from the repository root. Each command should print nothing unless noted.

```bash
# Prisma only in the Prisma repositories (and shared/module/prisma)
grep -rln "PrismaService\|generated/prisma" api/src --include=*.ts | grep -v "\.repository\.ts\|shared/module/prisma\|/generated/"

# entities and contracts import no Nest or Prisma
grep -rn "@nestjs/\|prisma" api/src/package/*/*/*.entity.ts api/src/package/*/*/contracts

# cross-context imports: only a facade or a module may cross a context
grep -rn "from '@/package/\(customer\|work-order\|identity\)/\|from '\.\./\.\./\(customer\|work-order\|identity\)/" api/src --include=*.ts \
  | grep -v "__test__" | grep -v "customer.facade\|\.module\.js"

# relative and alias imports end in .js
grep -rnE "from '(\.|@/)[^']*[^s]'" api/src api/test --include=*.ts | grep -v "\.js'\|\.json'\|/generated/"

# every tenant repository method takes organizationId first
grep -rn "abstract .*(" api/src/package/customer api/src/package/work-order --include=*-repository.contract.ts | grep -v "organizationId\|create(\|save(\|delete("

# every use case has a spec, every controller a Zod schema (the suite checks the first)
npm run test --prefix api -- test/use-case-specs.spec.ts

# every use case is registered in its module (compare counts)
ls api/src/package/<context>/*/*.use-case.ts | wc -l; grep -c "UseCase," api/src/package/<context>/<context>.module.ts
```

Then `npm run lint`, `npm run test` and `npm run build` in `api/`; `bash api/test/smoke/boot-smoke.sh`
boots `start:prod` and `start:dev` against real PostgreSQL, Redis and Mailpit when Docker is
available.

Report findings as P0 (a boundary broken: a query with no `organizationId`, Prisma in a use case,
another context's repository imported), P1 (naming, a missing registration or spec, error mapping,
an import without `.js`), P2 (style, the listed deviations).
