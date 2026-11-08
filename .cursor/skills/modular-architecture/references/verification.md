# Verification

Run from the repository root. Each command should print nothing unless noted.

```bash
# Prisma only in persistence (and shared/module/prisma)
grep -rln "PrismaService\|generated/prisma" api/src --include=*.ts | grep -v "/persistence/\|shared/module/prisma"

# core imports no Nest HTTP/Prisma (use cases may use @Injectable from @nestjs/common)
grep -rn "from '@nestjs/\(common\)'" api/src/*/core/entity api/src/*/core/interface
grep -rn "prisma" api/src/*/core

# cross-context imports: list them and check each is an abstract repository or a persistence module
grep -rn "from '@/\(customer\|work-order\|identity\)/" api/src --include=*.ts \
  | grep -v "^api/src/customer/.*'@/customer/" | grep -v "^api/src/work-order/.*'@/work-order/" \
  | grep -v "^api/src/identity/.*'@/identity/"

# one handler per controller (counts above 1 need a reason)
grep -c "@\(Get\|Post\|Put\|Patch\|Delete\)(" api/src/*/http/rest/controller/*.ts | grep -v ":1$"

# every use case and controller is registered in its module (compare counts)
ls api/src/<context>/core/use-case | wc -l; grep -c "UseCase," api/src/<context>/<context>.module.ts
ls api/src/<context>/http/rest/controller | wc -l; grep -c "Controller," api/src/<context>/<context>.module.ts

# deviations listed in SKILL.md
grep -rln "BadRequestException(error.message)" api/src
```

Then `npm run lint` and `npm run build` in `api/` (`npm run test` once specs exist).

Report findings as P0 (a layer or boundary broken: Prisma in a use case, a foreign repository
class imported), P1 (naming, missing registration, error mapping), P2 (style, the listed
deviations).
