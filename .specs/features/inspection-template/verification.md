# InspectionTemplate verification

**Verdict**: FAIL
**Proofs**: `proofs.md` at 8f0f467
**Verifier**: independent sub-agent (author != verifier)

## Checks

| Check | Test | Holds |
| --- | --- | --- |
| C1 | `create-inspection-template.use-case.spec.ts` `template C1 stores the template and its items at positions 0 and 1 in the order sent` | yes - asserts stored template, `createdAt`, labels with positions 0 and 1 in order |
| C2 | `inspection-template.http.spec.ts` `template C2 trims the name and each label before validating` | yes - trimmed values reach both use cases; the label of spaces is sent to `POST` only, but `PUT` uses the same schema object |
| C3 | `inspection-template.http.spec.ts` `template C3 answers 400 outside the limits and passes at them` | yes - all 7 plan examples on `POST` and `PUT`, no use case called on the refused ones |
| C4 | `create-inspection-template.use-case.spec.ts` `template C4 accepts two items with the same label` | yes |
| C5 | `create-inspection-template.use-case.spec.ts` `template C5 refuses PINTURA when Pintura exists and accepts a name of another Organization`; `edit-inspection-template.use-case.spec.ts` `template C5 keeps its own name and refuses the name of another template`; `inspection-template.http.spec.ts` `template C5 answers 409 when the name is taken` | partly - the case rule is proved only on the in-memory fake (`toLowerCase`); the Prisma `findByName` and the unique index rely on the `name` column being `CITEXT`, which no check asserts (see Findings) |
| C6 | `edit-inspection-template.use-case.spec.ts` `template C6 replaces the items with the ones sent, renumbered from 0` | yes - 3 to 2 items and a swap, positions asserted |
| C7 | `delete-inspection-template.use-case.spec.ts` `template C7 deletes the template and its items`; `inspection-template.http.spec.ts` `template C7 answers 204 to a delete` | yes - item removal in the database rests on the cascade C30 greps |
| C8 | `inspection-template.repository.spec.ts` `template C8 asks for the Organization's templates newest first, ties by id`; `fetch-inspection-templates.use-case.spec.ts` `template C8 returns 10 then 1 of 11 templates with total 11` and `template C8 returns no template and total 0 for an empty Organization`; `inspection-template.http.spec.ts` `template C8 answers each template with id, name, itemCount and createdAt` | yes - `where`, `orderBy`, `take`, `skip`, page split and row shape all asserted |
| C9 | `inspection-template.repository.spec.ts` `template C9 reads a template with its items ordered by position`; `get-inspection-template-by-id.use-case.spec.ts` `template C9 returns the template with its items` | yes - asserts the `orderBy: { position: 'asc' }` include on out-of-order rows |
| C10 | `get-inspection-template-by-id.use-case.spec.ts`, `edit-inspection-template.use-case.spec.ts`, `delete-inspection-template.use-case.spec.ts` `template C10 ...`; `inspection-template.http.spec.ts` `template C10 answers 404 to get, put and delete of an unknown id` | yes - unknown and other-Organization ids, nothing changed |
| C11 | `inspection-template.http.spec.ts` `template C11 refuses the 3 write routes to operator and inspector with 403 before validation` | yes - invalid body still 403, exact body, zero use case calls, administrator passes |
| C12 | `layout.spec.ts` `template C12 every POST, PUT and DELETE handler under customer and work-order declares its Roles`; `layout.spec.ts` `[C32] exposes the routes of today, /me and the identity routes, one controller class per file` | yes - 14 `(...WRITERS)` and 3 `('administrator')`, five new routes listed |
| C13 | `docs.spec.ts` `template C13 CONTEXT.md has the InspectionTemplate entry` | yes |
| C14 | `inspection-template-menu.spec.ts` `template C14 the menu links Modelos de inspeção for every Role` | yes |
| C15 | `inspection-template-list.spec.ts` `template C15 lists name and question count, links each row and pages` | yes - title, rows in order received, hrefs, page 2 request |
| C16 | `inspection-template-list.spec.ts` `template C16 an empty list says Nenhum modelo de inspeção encontrado` | yes |
| C17 | `inspection-template-detail.spec.ts` `template C17 shows the name and the questions numbered from 1` | yes - items flushed out of order, numbered list asserted |
| C18 | `inspection-template-detail.spec.ts` `template C18 a 404 says Modelo de inspeção não encontrado` | yes |
| C19 | `inspection-template-list.spec.ts` `template C19 renders Novo modelo only for administrator`; `inspection-template-detail.spec.ts` `template C19 renders Editar and Excluir only for administrator` | yes - administrator, operator, inspector and `null` |
| C20 | `inspection-template-form.spec.ts` `template C20 Novo modelo opens the sheet with an empty name and one question` | yes |
| C21 | `inspection-template-form.spec.ts` `template C21 Adicionar pergunta appends an empty question` | yes |
| C22 | `inspection-template-form.spec.ts` `template C22 Subir and Descer swap neighbours and are disabled at the ends` | yes |
| C23 | `inspection-template-form.spec.ts` `template C23 Remover drops a question and the limits disable the controls` | yes |
| C24 | `inspection-template-form.spec.ts` `template C24 shows the field errors and sends nothing` | yes - empty, spaces, 101 and 201 characters; `expectNone` plus `verify()` |
| C25 | `inspection-template-list.spec.ts` `template C25 creates a template in the order shown and reloads the list` | yes - reordered body, toast, sheet closed, list requested again and shown first; the page-2 branch is untested (see Findings) |
| C26 | `inspection-template-detail.spec.ts` `template C26 edits the template from a prefilled sheet and reloads it` | yes |
| C27 | `inspection-template-list.spec.ts` `template C27 a 409 keeps the sheet open with the typed name` | no - proves the 409 on create only; AC 27 names create and edit, and the edit 409 runs through the detail page's own `error` handler, which no test reaches |
| C28 | `inspection-template-detail.spec.ts` `template C28 confirms, deletes and returns to the list; cancel sends nothing` | yes |
| C29 | `walk` | yes (markup) - list table sits in `overflow-x-auto` with a wrapping name cell, headers and the detail action row use `flex-wrap`, labels use `break-words`, the sheet is full width below `sm`, the nav wraps |
| C30 | `grep` on `*_add_inspection_templates/migration.sql` | yes for the unique index and the cascade; it does not assert `"name" CITEXT` |
| C31 | `inspection-template.repository.spec.ts` `template C31 turns the unique name violation into AlreadyExistsDomainException` | yes - `create` and `save`, and another error passes through |
| C32 | `inspection-template.http.spec.ts` `template C32 answers 401 without a token and lets every Role read` | yes |
| C33 | `inspection-template-detail.spec.ts` `template C33 an edit saved without changes sends back what it received` | yes - includes a repeated label |
| C34 | lone proof `grep -q '"name" CITEXT NOT NULL'` on the migration | added by the builder in `769f932` to close finding 1, not judged by the Verifier |
| C35 | `inspection-template-list.spec.ts` `template C35 a template created from page 2 shows page 1, where it is first` | added by the builder in `769f932` to close finding 3, not judged by the Verifier |

## Findings

| Finding | Evidence | Fix | Closed |
| --- | --- | --- | --- |
| The name rule "unique without case" has no check at the layer that decides it: the Prisma repository's `findByName` (`findUnique` on `organizationId_name`) and the unique index are case-insensitive only because `name` is `CITEXT`; with a `TEXT` column every proof stays green and `PINTURA` is stored beside `Pintura` | C5 proves case only on `InMemoryInspectionTemplatesRepository.findByName` (`toLowerCase`); C30 greps the index and the cascade, not the column type; no spec mentions `citext` | extend C30 to also `grep -q '"name" CITEXT NOT NULL'` in the migration (or assert `@db.Citext` on `InspectionTemplate.name` in `schema.prisma`) | `769f932` - C34 greps `"name" CITEXT NOT NULL` in the migration |
| C27 holds the 409 on create only; the edit 409 (AC 27 "to a create or edit") has no test | `inspection-template-list.spec.ts:117` flushes 409 on `POST` only; `inspection-template-detail.ts:89-98` handles the `PUT` 409 separately. A throwaway example at 8f0f467 shows the edit path behaves correctly today | add a detail-page case: edit, flush 409 on `PUT /api/inspection-templates/t1`, assert the `NAME_TAKEN` toast, the sheet still open, and the typed name and questions kept | `769f932` - C27's second proof, `template C27 a 409 on edit keeps the sheet open with what was typed` |
| A rule the diff added has no check: a create while on page 2 or later sets the page back to 1 instead of reloading the current page | `inspection-template-list.ts:68-73` (`// The newest template is first, on page 1.`); C25 only covers page 1 | add a case to C25 (or a new check): go to page 2, create, expect `GET /api/inspection-templates?page=1` | `769f932` - C35, `template C35 a template created from page 2 shows page 1, where it is first` |

Own examples at 8f0f467 (throwaway, deleted, all passed): API - a name of 100 and a label of 200 characters padded with spaces pass and reach the use case trimmed, 101 after trim answers 400, a second label of spaces answers 400, `page=abc` answers 400; exactly 10 templates with one `createdAt` give 10 (highest id first) then `[]` with `total: 10`; an edit to a name used only in another Organization passes and 1 item edited to 100 renumbers 0..99. Web - a 100-character name and a padded 199-character question post trimmed; a 409 on edit keeps the sheet open with the typed name and questions.
