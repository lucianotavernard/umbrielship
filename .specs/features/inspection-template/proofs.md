# inspection-template proofs

**HEAD**: 8fe1a47
**Tree**: clean
**Shell**: /bin/sh
**Result**: 53 pass, 0 fail

| Check | Proof | Result |
| --- | --- | --- |
| C1 | `run api / ✓ create-inspection-template.use-case.spec.ts > template C1 stores the template and its items at pos` | pass |
| C2 | `run api / ✓ inspection-template.http.spec.ts > template C2 trims the name and each label before validating` | pass |
| C3 | `run api / ✓ inspection-template.http.spec.ts > template C3 answers 400 outside the limits and passes at them` | pass |
| C4 | `run api / ✓ create-inspection-template.use-case.spec.ts > template C4 accepts two items with the same label` | pass |
| C5 | `run api / ✓ create-inspection-template.use-case.spec.ts > template C5 refuses PINTURA when Pintura exists and ` | pass |
| C5 | `run api / ✓ edit-inspection-template.use-case.spec.ts > template C5 keeps its own name and refuses the name of` | pass |
| C5 | `run api / ✓ inspection-template.http.spec.ts > template C5 answers 409 when the name is taken` | pass |
| C6 | `run api / ✓ edit-inspection-template.use-case.spec.ts > template C6 replaces the items with the ones sent, ren` | pass |
| C7 | `run api / ✓ delete-inspection-template.use-case.spec.ts > template C7 deletes the template and its items` | pass |
| C7 | `run api / ✓ inspection-template.http.spec.ts > template C7 answers 204 to a delete` | pass |
| C8 | `run api / ✓ inspection-template.repository.spec.ts > template C8 asks for the Organization's templates newest ` | pass |
| C8 | `run api / ✓ fetch-inspection-templates.use-case.spec.ts > template C8 returns 10 then 1 of 11 templates with t` | pass |
| C8 | `run api / ✓ fetch-inspection-templates.use-case.spec.ts > template C8 returns no template and total 0 for an e` | pass |
| C8 | `run api / ✓ inspection-template.http.spec.ts > template C8 answers each template with id, name, itemCount and ` | pass |
| C9 | `run api / ✓ inspection-template.repository.spec.ts > template C9 reads a template with its items ordered by po` | pass |
| C9 | `run api / ✓ get-inspection-template-by-id.use-case.spec.ts > template C9 returns the template with its items` | pass |
| C10 | `run api / ✓ get-inspection-template-by-id.use-case.spec.ts > template C10 throws NotFoundDomainException for a` | pass |
| C10 | `run api / ✓ edit-inspection-template.use-case.spec.ts > template C10 throws NotFoundDomainException for anothe` | pass |
| C10 | `run api / ✓ delete-inspection-template.use-case.spec.ts > template C10 throws NotFoundDomainException for anot` | pass |
| C10 | `run api / ✓ inspection-template.http.spec.ts > template C10 answers 404 to get, put and delete of an unknown i` | pass |
| C11 | `run api / ✓ inspection-template.http.spec.ts > template C11 refuses the 3 write routes to operator and inspect` | pass |
| C12 | `run api / ✓ layout.spec.ts > template C12 every POST, PUT and DELETE handler under customer and work-order dec` | pass |
| C12 | `run api / ✓ layout.spec.ts > [C32] exposes the routes of today, /me and the identity routes, one controller cl` | pass |
| C13 | `run api / ✓ docs.spec.ts > template C13 CONTEXT.md has the InspectionTemplate entry` | pass |
| C30 | `grep -q 'CREATE UNIQUE INDEX "inspection_templates_organizationId_name_key"' api/src/package/shared/module/pri` | pass |
| C31 | `run api / ✓ inspection-template.repository.spec.ts > template C31 turns the unique name violation into Already` | pass |
| C31 | `run api / ✓ inspection-template.repository.spec.ts > template C31 locks the template before replacing its item` | pass |
| C32 | `run api / ✓ inspection-template.http.spec.ts > template C32 answers 401 without a token and lets every Role re` | pass |
| C14 | `run web / ✓ inspection-template-menu.spec.ts > template C14 the menu links Modelos de inspeção for every Role` | pass |
| C15 | `run web / ✓ inspection-template-list.spec.ts > template C15 lists name and question count, links each row and ` | pass |
| C16 | `run web / ✓ inspection-template-list.spec.ts > template C16 an empty list says Nenhum modelo de inspeção encon` | pass |
| C17 | `run web / ✓ inspection-template-detail.spec.ts > template C17 shows the name and the questions numbered from 1` | pass |
| C18 | `run web / ✓ inspection-template-detail.spec.ts > template C18 a 404 says Modelo de inspeção não encontrado` | pass |
| C19 | `run web / ✓ inspection-template-list.spec.ts > template C19 renders Novo modelo only for administrator` | pass |
| C19 | `run web / ✓ inspection-template-detail.spec.ts > template C19 renders Editar and Excluir only for administrato` | pass |
| C20 | `run web / ✓ inspection-template-form.spec.ts > template C20 Novo modelo opens the sheet with an empty name and` | pass |
| C21 | `run web / ✓ inspection-template-form.spec.ts > template C21 Adicionar pergunta appends an empty question` | pass |
| C22 | `run web / ✓ inspection-template-form.spec.ts > template C22 Subir and Descer swap neighbours and are disabled ` | pass |
| C23 | `run web / ✓ inspection-template-form.spec.ts > template C23 Remover drops a question and the limits disable th` | pass |
| C24 | `run web / ✓ inspection-template-form.spec.ts > template C24 shows the field errors and sends nothing` | pass |
| C24 | `run web / ✓ inspection-template-form.spec.ts > template C24 measures the name and the questions after trimming` | pass |
| C25 | `run web / ✓ inspection-template-list.spec.ts > template C25 creates a template in the order shown and reloads ` | pass |
| C26 | `run web / ✓ inspection-template-detail.spec.ts > template C26 edits the template from a prefilled sheet and re` | pass |
| C27 | `run web / ✓ inspection-template-list.spec.ts > template C27 a 409 keeps the sheet open with the typed name` | pass |
| C27 | `run web / ✓ inspection-template-detail.spec.ts > template C27 a 409 on edit keeps the sheet open with what was` | pass |
| C28 | `run web / ✓ inspection-template-detail.spec.ts > template C28 confirms, deletes and returns to the list; cance` | pass |
| C29 | `walk - open the list, a detail and the form sheet at 375 px wide and check document.documentElement.scrollWidt` | pass (Walked) |
| C34 | `grep -q '"name" CITEXT NOT NULL' api/src/package/shared/module/prisma/migrations/*_add_inspection_templates/mi` | pass |
| C35 | `run web / ✓ inspection-template-list.spec.ts > template C35 a template created from page 2 shows page 1, where` | pass |
| C33 | `run web / ✓ inspection-template-detail.spec.ts > template C33 an edit saved without changes sends back what it` | pass |
| Build | `cd api && npm run lint` | pass |
| Build | `cd api && npm run build` | pass |
| Build | `cd web && npm run build` | pass |

## Output

`Run api` - exit 0

```
 ✓ src/package/shared/module/auth/__test__/roles.guard.spec.ts > Roles guard over HTTP > inspector C10 lets administrator and operator through each of the 14 write routes 36ms
 ✓ src/package/shared/module/auth/__test__/roles.guard.spec.ts > Roles guard over HTTP > inspector C11 lets an inspector through each of the 9 read routes 8ms
 ✓ src/package/shared/module/auth/__test__/roles.guard.spec.ts > Roles guard over HTTP > inspector C12 lets an operator create a Customer 1ms
 ✓ src/package/shared/module/auth/__test__/roles.guard.spec.ts > Roles guard over HTTP > inspector C14 answers 403 with statusCode 403 and message Forbidden 1ms
 ✓ src/package/shared/module/auth/__test__/roles.guard.spec.ts > Roles guard over HTTP > inspector C1 POST /users accepts role inspector and refuses auditor 3ms
 ✓ src/package/shared/module/auth/__test__/roles.guard.spec.ts > Roles guard over HTTP > inspector C3 POST /invitations accepts role inspector 2ms
 ✓ src/package/shared/module/auth/__test__/roles.guard.spec.ts > Roles guard over HTTP > inspector C30 keeps the statuses of /me, /invitations and /organizations/:id/roles 3ms

 Test Files  65 passed (65)
      Tests  229 passed (229)
   Start at  09:11:14
   Duration  1.69s (transform 5.18s, setup 0ms, import 18.21s, tests 1.00s, environment 7ms)

[Nest] 1975612  - 14/11/2026, 09:11:15   ERROR [identity] {"operation":"invitation_enqueue_failed","organizationId":"dest","invitationId":"66fcbff7-de28-4df2-b02f-e8655cd2db38","message":"redis down"}
[Nest] 1975715  - 14/11/2026, 09:11:15   ERROR [identity] {"operation":"invitation_enqueue_failed","organizationId":"organization","invitationId":"06690231-c2eb-4620-99ad-8293da10067b","message":"redis down"}
```

`Run web` - exit 0

```
 ✓  web  src/package/work-order/inspection-template/__test__/inspection-template-detail.spec.ts > InspectionTemplateDetail > template C28 confirms, deletes and returns to the list; cancel sends nothing 18ms
 ✓  web  src/package/work-order/inspection-template/__test__/inspection-template-detail.spec.ts > InspectionTemplateDetail > template C33 an edit saved without changes sends back what it received 27ms
 ✓  web  src/package/work-order/inspection-template/__test__/inspection-template-list.spec.ts > InspectionTemplateList > template C25 creates a template in the order shown and reloads the list 46ms
 ✓  web  src/package/work-order/inspection-template/__test__/inspection-template-list.spec.ts > InspectionTemplateList > template C35 a template created from page 2 shows page 1, where it is first 34ms
 ✓  web  src/package/work-order/inspection-template/__test__/inspection-template-list.spec.ts > InspectionTemplateList > template C27 a 409 keeps the sheet open with the typed name 22ms
 ✓  web  src/package/work-order/inspection-template/__test__/inspection-template-form.spec.ts > InspectionTemplate form > template C21 Adicionar pergunta appends an empty question 29ms
 ✓  web  src/package/work-order/inspection-template/__test__/inspection-template-form.spec.ts > InspectionTemplate form > template C22 Subir and Descer swap neighbours and are disabled at the ends 48ms
 ✓  web  src/package/work-order/inspection-template/__test__/inspection-template-form.spec.ts > InspectionTemplate form > template C23 Remover drops a question and the limits disable the controls 208ms
 ✓  web  src/package/work-order/inspection-template/__test__/inspection-template-form.spec.ts > InspectionTemplate form > template C24 shows the field errors and sends nothing 20ms
 ✓  web  src/package/work-order/inspection-template/__test__/inspection-template-form.spec.ts > InspectionTemplate form > template C24 measures the name and the questions after trimming them 20ms

 Test Files  4 passed (4)
      Tests  20 passed (20)
   Start at  09:11:18
   Duration  1.16s (transform 218ms, setup 685ms, import 748ms, tests 1.02s, environment 1.14s)
```

`grep -q 'CREATE UNIQUE INDEX "inspection_templates_organizationId_name_key"' api/src/package/shared/module/pri` - exit 0

```
(no output)
```

`grep -q '"name" CITEXT NOT NULL' api/src/package/shared/module/prisma/migrations/*_add_inspection_templates/mi` - exit 0

```
(no output)
```
