# Inspection verification

**Verdict**: FAIL
**Proofs**: `proofs.md` at 73a3e90
**Verifier**: independent sub-agent (author != verifier)

## Checks

| Check | Test | Holds |
| --- | --- | --- |
| C1 | `create-inspection-template.use-case.spec.ts` `inspection C1 stores each question's type`; `inspection-template.http.spec.ts` `inspection C1 requires a question type of the four and returns it` | no - create stores and returns all four types, and POST/PUT refuse a missing type and `DATE`, but no test edits a template to a type other than `CONFORMITY`: the edit use case, a valid `PUT` passing `type` through, and the Prisma template repository writing `type` are not asserted |
| C2 | `assign-inspection-template.use-case.spec.ts` `inspection C2 copies each question's type and keeps it after the template changes` | yes |
| C3 | grep on `20261114141853_add_inspections/migration.sql` | yes - `CREATE TYPE "question_type"` and two `ADD COLUMN "type" "question_type" NOT NULL DEFAULT 'CONFORMITY'`, which backfills existing rows |
| C4 | `inspection-template-form.spec.ts` `inspection C4 each question has a Tipo select and the form sends the types in order` | yes |
| C5 | `inspection-template-detail.spec.ts` `inspection C5 shows each question's type label`; `inspection-assignment-section.spec.ts` `inspection C5 shows each copied question's type label` | yes |
| C6 | `docs.spec.ts` `inspection C6 CONTEXT.md describes the question types and the Inspection` | yes |
| C7 | `complete-inspection.use-case.spec.ts` `inspection C7 stores the Inspection with the result, the inspector and every answer`; `inspection.http.spec.ts` `inspection C7 passes the inspector's id and name and answers 201 with the Inspection` | yes at the use case and the route; the Prisma write of each answer to its value column is untested (finding 1) |
| C8 | `complete-inspection.use-case.spec.ts` `inspection C8 accepts a value of each type or not applicable and refuses the rest` | yes - 0, 10, 1000 trimmed, NA pass; 11, -1, 7.5, `"8"`, spaces, 1001, `"sim"`, wrong kinds and NA with a value refuse |
| C9 | `complete-inspection.use-case.spec.ts` `inspection C9 accepts a trimmed note except on free text` | yes |
| C10 | `complete-inspection.use-case.spec.ts` `inspection C10 refuses missing, foreign and repeated answers and stores nothing` | yes |
| C11 | `complete-inspection.use-case.spec.ts` `inspection C11 requires the WorkOrder and the targeted service in progress` | yes - all four plan examples plus `COMPLETED` and `CANCELLED` |
| C12 | `inspection.http.spec.ts` `inspection C12 answers 400 for a missing result or a note over 500 characters` | yes - also 500 at the limit passes |
| C13 | `complete-inspection.use-case.spec.ts` `inspection C13 adds an Inspection each time and keeps the earlier ones` | yes |
| C14 | `inspection-assignment.repository.spec.ts` `inspection C14 ...`; `fetch-inspection-assignments.use-case.spec.ts` `inspection C14 ...`; `inspection-assignment.http.spec.ts` `inspection C14 ...` | yes - the Prisma `where: { discardedAt: null }`, `orderBy [completedAt desc, id desc]` and unfiltered `_count` are asserted |
| C15 | `discard-inspection.use-case.spec.ts` `inspection C15 marks who and when, hides it and keeps the others`; `inspection.http.spec.ts` `inspection C15 answers 204 to a discard with the inspector's id` | yes at the use case and route; the WorkOrder-`COMPLETED` example is met by construction (the use case reads no status) |
| C16 | `discard-inspection.use-case.spec.ts` `inspection C16 throws NotFoundDomainException and changes nothing` | yes at the use case; "already discarded" rests on `findVisibleById`'s `discardedAt: null`, asserted only in the in-memory fake (finding 1) |
| C17 | `inspection.http.spec.ts` `inspection C17 refuses complete and discard to administrator and operator with 403 before validation` | yes |
| C18 | `complete-inspection.use-case.spec.ts` `inspection C18 ...`; `inspection.http.spec.ts` `inspection C18 answers 404 when the use case finds nothing` | yes |
| C19 | `remove-inspection-assignment.use-case.spec.ts` `inspection C19 refuses an assignment with any Inspection`; `inspection-assignment.repository.spec.ts` `inspection C19 turns the database refusal into ConflictDomainException` | yes at the use case and repository; the route's 409 is untested (finding 2) |
| C20 | `layout.spec.ts` `template C12 every POST, PUT and DELETE handler ... declares its Roles`; `layout.spec.ts` `[C32] exposes the routes of today ...`; `docs.spec.ts` `inspection C6 ...` | yes |
| C21 | `inspection-history.spec.ts` `inspection C21 the summary counts the Inspections and shows the latest result` | yes |
| C22 | `inspection-history.spec.ts` `inspection C22 lists the Inspections with result, inspector and date` | yes |
| C23 | `inspection-history.spec.ts` `inspection C23 the Inspeção sheet shows every answer by type and the notes` | no - the fixture reads 4 of the 7 answer forms (text, "Não", "Não se aplica", score 7); "Sim", "Conforme" and "Não conforme" are never rendered |
| C24 | `inspection-checklist.spec.ts` `inspection C24 Inspecionar is for inspectors and disabled with the reason outside the work in progress` | yes |
| C25 | `inspection-checklist.spec.ts` `inspection C25 renders the control of each type, Não se aplica and Observação` | yes |
| C26 | `inspection-checklist.spec.ts` `inspection C26 shows the question's error and sends nothing` | yes |
| C27 | `inspection-checklist.spec.ts` `inspection C27 the confirmation shows the counts and waits for a result` | yes |
| C28 | `inspection-checklist.spec.ts` `inspection C28 sends the result and every answer and reloads` | yes |
| C29 | `inspection-history.spec.ts` `inspection C29 an inspector discards after confirming; cancel sends nothing; others see no Descartar` | yes |
| C30 | `inspection-history.spec.ts` `inspection C30 an inspected assignment shows no Remover` | yes |
| C31 | `inspection-checklist.spec.ts` `inspection C31 a failed complete shows the API message and keeps the answers`; `inspection-history.spec.ts` `inspection C31 a failed discard shows the API message and keeps the history` | yes |
| C32 | `inspection-layout.spec.ts` `inspection C32 the header is sticky from sm only` | yes |
| C33 | `walk` | yes (plausible from markup) - sheet `w-full` below `sm` with a `grid-cols-1` body, answer rows `flex-wrap`, options `h-10 min-w-10`, textareas `min-h-20`, history rows `min-h-10`, "Descartar" `h-10`, result choices `grid-cols-2` |
| C34 | `delete-work-order.use-case.spec.ts` `inspection C34 refuses a WorkOrder with an Inspection under it`; `work-order.repository.spec.ts` `inspection C34 turns the database refusal into ConflictDomainException` | yes at the use case; "discarded included" in Prisma's `countByWorkOrderId` is untested (finding 1); the route's 409 is untested (finding 2) |
| C35 | `delete-work-order-service.use-case.spec.ts` `inspection C35 refuses a service targeted by an inspected assignment`; `work-order-service.repository.spec.ts` `inspection C35 turns the database refusal into ConflictDomainException` | yes at the use case; same gaps as C34 (findings 1 and 2) |
| C36 | `delete-work-order.use-case.spec.ts` `inspection C36 ...`; `delete-work-order-service.use-case.spec.ts` `inspection C36 ...` | yes - the cascade of the assignments is the database's, as before this change |
| C37 | `vessel-detail.inspection.spec.ts` `inspection C37 a refused WorkOrder delete explains the inspections and keeps the row` | yes |
| C38 | `resolve-session.use-case.spec.ts` `inspection C38 resolves the User's name into the session` | yes |
| C39 | grep on `20261114141853_add_inspections/migration.sql` | yes - both tables, assignment FK and item FK `ON DELETE RESTRICT`, inspection FK `ON DELETE CASCADE`, unique `(inspectionId, itemId)` |
| C40 | `inspection.http.spec.ts` `inspection C40 answers 401 without a token` | yes |
| C41 | `inspection.http.spec.ts` `inspection C41 answers 409 with the message when the answers or the work are refused`, `inspection-assignment.http.spec.ts` and `roles.guard.spec.ts` `inspection C41 ...` | added by the builder in `692558c` to close finding 2, not judged by the Verifier |

Own examples, run at HEAD as throwaway tests and deleted (all passed): a one-character text padded with spaces stores `"a"`; `-0` passes as a score; every question "Não se aplica" passes; four answers that repeat one question and omit another answer 409; `YES_NO` with `0`, `SCORE` with `true`, `SCORE` 10.000001, and a note on a "Não se aplica" free-text answer answer 409; a `CANCELLED` WorkOrder refuses; a discard with the WorkOrder `COMPLETED` works and the history breaks a `completedAt` tie by id descending; over HTTP a `ConflictDomainException` from complete answers 409, `value: null` answers 400, and a note of 500 characters padded with spaces passes validation. On the web, a score of 0 is sent as `value: 0`, a "Não" switched to "Não se aplica" leaves the "Não" count at 0 and is sent as `notApplicable: true`.

## Findings

| Finding | Evidence | Fix | Closed |
| --- | --- | --- | --- |
| `PrismaInspectionsRepository` has no spec, so three rules hold only in the in-memory fake: `countByWorkOrderId` and `countByServiceId` count discarded Inspections (C34, C35 "discarded included"), `findVisibleById` excludes discarded ones within the Organization (C16 "already discarded"), and `create` writes each answer to `textValue`, `booleanValue` or `scoreValue` (C7). Adding `discardedAt: null` to a count, or dropping it from `findVisibleById`, leaves every test green | `api/src/package/work-order/inspection/inspection.repository.ts` - no `__test__/inspection.repository.spec.ts`; the use-case specs run on `api/test/repositories/in-memory-inspections-repository.ts` | add `inspection.repository.spec.ts` asserting the Prisma arguments: both counts with `organizationId` and no `discardedAt`, `findFirst` with `{ id, organizationId, discardedAt: null }`, `create` with one value column per type and the others null, `saveDiscard` scoped to `discardedAt: null` | `692558c` - `inspection.repository.spec.ts` asserts both counts without a `discardedAt` filter (C34), `findFirst` with `discardedAt: null` (C16), each answer's value column and `saveDiscard` (C7) |
| The new 409 statuses in the Surface table rest on controller `catch` branches that no test exercises: `POST .../inspections`, `DELETE .../inspection-assignments/:id`, `DELETE /work-orders/:id` and `DELETE .../services/:id`. Without the `ConflictDomainException` branch each would answer 500 and every check stays green | `inspection.http.spec.ts` covers 201, 400, 401, 403 and 404 only; no `*.http.spec.ts` asserts 409 on the other three routes; checks.md's Coverage lists 409 via use-case checks C8, C10, C11, C19, C34, C35 | in each route's HTTP spec, have the faked use case throw `ConflictDomainException` and assert 409 with its message | `692558c` - check C41: 409 with its message on complete, assignment remove, WorkOrder delete and service delete over HTTP |
| C1 says creating or editing stores and returns each item's `type`, but only creation is tested with types other than `CONFORMITY` | `edit-inspection-template.use-case.spec.ts` only uses `conformity([...])`; `inspection-template.http.spec.ts` C1 asserts `fakes.edit.handle` is never called; no test asserts the Prisma template repository writes `type` | edit a template to mixed types in the edit use-case spec, and assert that a valid `PUT` passes `{ label, type }` to the edit use case | `692558c` - C1 also proves an edit with mixed types (use case), a `PUT` passing `{ label, type }` through, and the template repository writing `type` on create and edit |
| C23 reads 4 of the 7 answer forms; "Sim", "Conforme" and "Não conforme" are never rendered, so swapping the `true`/`false` labels in `answerLabel` for `CONFORMITY`, or for `YES_NO` on true, passes | `web/src/package/work-order/inspection/__test__/testing.ts` `inspection()` answers: text, `false` on `YES_NO`, NA on `CONFORMITY`, 7 on `SCORE` | add an Inspection with `YES_NO` true and `CONFORMITY` true and false (or a second fixture) and assert "Sim", "Conforme" and "Não conforme" | `4005c7c` - C23's second test reads "Sim", "Conforme", "Não conforme" and a score of 0 |
