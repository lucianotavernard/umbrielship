# LESSONS - auto-maintained by scripts/lessons.py

> Machine-owned. Do NOT hand-edit. Changes are overwritten on the next `lessons.py` write.
> Canonical state lives in `.specs/lessons.json`. Edit lessons only via the script.
> promote_threshold=2 distinct features · window_days=45 · quarantine_threshold=2

## Confirmed (load these at Plan/Checks)

Corroborated across multiple features. Safe to apply as guidance.

### L-029 - A claim about what is stored needs a test on the real repository's write call; a use-case spec on the in-memory fake proves only the fake.
- signal: `weak_test` · recurrence: 2 feature(s) · scope: `api` · harmful: 0
- features: inspection-assignment, inspection
- evidence: verification.md finding 1, C2 C30 (api) (+1 more)
- last seen: 2026-11-14T15:13:52Z

## Candidates (under observation - do NOT load as guidance yet)

Seen once or not yet corroborated. Tracked, not trusted.

### L-001 - Make a file-system failure deterministic with a spy rejecting each error code, and assert the exact error, not an OS-dependent code set
- signal: `weak_test` · recurrence: 1 feature(s) · scope: `use-case` · harmful: 0
- features: acme-architecture-migration
- evidence: C28 remove-work-order-service-image.use-case.spec.ts (use-case)
- last seen: 2026-11-08T04:36:44Z

### L-002 - Make an in-memory fake mirror the real repository's behaviour, or record the divergence, so a test cannot pass on a fake-only result
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `repo-layer` · harmful: 0
- features: acme-architecture-migration
- evidence: C8 in-memory-customers-repository.ts (repo-layer)
- last seen: 2026-11-08T04:36:44Z

### L-003 - Make a fake save write only the fields the real repository writes, so a keeps-this-field claim can fail
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `repo-layer` · harmful: 0
- features: acme-architecture-migration
- evidence: C12 in-memory-vessels-repository.ts (repo-layer)
- last seen: 2026-11-08T04:36:44Z

### L-004 - Prove a spec exists by its content (at least one tagged test), not by the file existing
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `use-case` · harmful: 0
- features: acme-architecture-migration
- evidence: C1 use-case-specs.spec.ts (use-case)
- last seen: 2026-11-08T04:36:44Z

### L-005 - State in the claim what a null input does when the request type allows null, and assert it
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `use-case` · harmful: 0
- features: acme-architecture-migration
- evidence: C7 edit-customer.use-case.ts (use-case)
- last seen: 2026-11-08T04:36:44Z

### L-006 - An in-memory fake that enforces the same rule as the use case hides a dropped use-case guard; spy on the repository write and assert it is not called.
- signal: `weak_test` · recurrence: 1 feature(s) · scope: `api/test` · harmful: 0
- features: acme-architecture-migration
- evidence: C54 (api/test)
- last seen: 2026-11-08T12:56:13Z

### L-007 - A route behind a global auth guard needs a real-stack request to prove @Public(); unit specs on use cases do not see a missing decorator, so assert the public routes list in a layout spec.
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `api/identity` · harmful: 0
- features: acme-architecture-migration
- evidence: C64 (api/identity)
- last seen: 2026-11-08T12:56:13Z

### L-008 - Assert a compiler flag in every config the build reads, not only the base tsconfig.
- signal: `weak_test` · recurrence: 1 feature(s) · scope: `api/platform` · harmful: 0
- features: acme-architecture-migration
- evidence: C67 (api/tsconfig.build.json) (api/platform)
- last seen: 2026-11-08T13:28:15Z

### L-009 - A doc ban list must cover every stale path and phrase of the old layout and match without regard to letter case.
- signal: `weak_test` · recurrence: 1 feature(s) · scope: `docs` · harmful: 0
- features: acme-architecture-migration
- evidence: C73 (AGENTS.md) (docs)
- last seen: 2026-11-08T13:28:15Z

### L-010 - An import-specifier scan must cover dot-only paths, vi.doMock and vi.importActual, and demand the exact extension the claim names.
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `api/platform` · harmful: 0
- features: acme-architecture-migration
- evidence: C68 (api/test/platform.spec.ts) (api/platform)
- last seen: 2026-11-08T13:28:16Z

### L-011 - Spot-check each factual sentence of a rewritten doc against the code; a presence check on tokens does not prove a sentence true.
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `docs` · harmful: 0
- features: acme-architecture-migration
- evidence: S3 modular-architecture skill, EditWorkOrderUseCase (docs)
- last seen: 2026-11-08T13:28:16Z

### L-012 - State a database rule in a glossary only when the schema enforces it; otherwise name the code that upholds it.
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `docs` · harmful: 0
- features: acme-architecture-migration
- evidence: S3 CONTEXT.md, internal Organization (docs)
- last seen: 2026-11-08T13:28:16Z

### L-013 - Assert the attribute selector the screen criterion names, not a bare element.
- signal: `weak_test` · recurrence: 1 feature(s) · scope: `web` · harmful: 0
- features: acme-architecture-migration
- evidence: C87 organization-list.spec.ts (web)
- last seen: 2026-11-08T20:07:41Z

### L-014 - Assert the HTTP method together with the path, not only that the path string occurs.
- signal: `weak_test` · recurrence: 1 feature(s) · scope: `web` · harmful: 0
- features: acme-architecture-migration
- evidence: C82 authentication.service.ts (web)
- last seen: 2026-11-08T20:07:41Z

### L-015 - Assert a reload is absent while the request is outstanding and present once after the success status.
- signal: `weak_test` · recurrence: 1 feature(s) · scope: `web` · harmful: 0
- features: acme-architecture-migration
- evidence: C85 internal-layout.spec.ts (web)
- last seen: 2026-11-08T20:07:41Z

### L-016 - Run a sign-in failure with the app interceptor installed, and rethrow the 401 from that request.
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `web` · harmful: 0
- features: acme-architecture-migration
- evidence: C84 auth.interceptor.ts (web)
- last seen: 2026-11-08T20:07:42Z

### L-017 - Keep submit disabled while a form is invalid, and assert each length bound on its own.
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `web` · harmful: 0
- features: acme-architecture-migration
- evidence: C97 user-form.spec.ts (web)
- last seen: 2026-11-08T20:07:42Z

### L-018 - Assert the multipart field name the server reads, not only that the body is form data.
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `web` · harmful: 0
- features: acme-architecture-migration
- evidence: C91 work-order-detail.spec.ts (web)
- last seen: 2026-11-08T20:07:42Z

### L-019 - Assert an attribute prefix as the words immediately followed by the backticked value.
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `web` · harmful: 0
- features: acme-architecture-migration
- evidence: C96 layout.spec.mjs (web) (+1 more)
- last seen: 2026-11-08T20:07:42Z

### L-020 - Assert the element and its attribute together, not a substring a nested class also contains.
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `web` · harmful: 0
- features: acme-architecture-migration
- evidence: C83 layout.spec.mjs (web)
- last seen: 2026-11-08T20:07:42Z

### L-021 - Assert the HTTP method on every request a screen criterion names.
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `web` · harmful: 0
- features: acme-architecture-migration
- evidence: C88 organization-detail.spec.ts (web)
- last seen: 2026-11-08T20:07:42Z

### L-022 - Assert the fields sit inside the container the criterion names.
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `web` · harmful: 0
- features: acme-architecture-migration
- evidence: C87 organization-list.spec.ts t-sheet (web)
- last seen: 2026-11-08T20:07:42Z

### L-023 - Enforce a stated length bound on the form that posts it, and assert the first value past that bound does not emit.
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `web` · harmful: 0
- features: acme-architecture-migration
- evidence: C87 organization-form.ts (web)
- last seen: 2026-11-08T20:07:42Z

### L-024 - When the web hides controls by Role, derive it from the same allow-list the API enforces and hide while the session Role is not loaded; a deny-list shows every control to an unknown or not-yet-loaded Role.
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `web` · harmful: 0
- features: inspector-role
- evidence: verification.md finding 1-2, AC 25 (web)
- last seen: 2026-11-14T04:08:04Z

### L-025 - A criterion that says the web sends a value is proven by asserting the HTTP request body, not the value a form component emits.
- signal: `weak_test` · recurrence: 1 feature(s) · scope: `web` · harmful: 0
- features: inspector-role
- evidence: verification.md finding 3, C19 (web)
- last seen: 2026-11-14T04:08:04Z

### L-026 - A rule the database enforces (citext, a unique index) needs a proof on the column or migration itself; an in-memory fake that imitates it proves only the fake.
- signal: `weak_test` · recurrence: 1 feature(s) · scope: `api` · harmful: 0
- features: inspection-template
- evidence: verification.md finding 1, C5 (api)
- last seen: 2026-11-14T11:35:58Z

### L-027 - A criterion that names several gestures (create or edit) gets one test per gesture when each page handles the response in its own handler.
- signal: `weak_test` · recurrence: 1 feature(s) · scope: `web` · harmful: 0
- features: inspection-template
- evidence: verification.md finding 2, C27 (web)
- last seen: 2026-11-14T11:35:58Z

### L-028 - Behaviour the build adds beyond the criteria, such as resetting the page after a create, gets its own check in the same commit.
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `web` · harmful: 0
- features: inspection-template
- evidence: verification.md finding 3, inspection-template-list.ts (web)
- last seen: 2026-11-14T11:35:58Z

### L-030 - A test of an order rule feeds the data out of order, so the order the response already has cannot make it pass.
- signal: `weak_test` · recurrence: 1 feature(s) · scope: `web` · harmful: 0
- features: inspection-assignment
- evidence: verification.md finding 4, C19 (web)
- last seen: 2026-11-14T12:45:09Z

### L-031 - A criterion that names two entities (WorkOrder and WorkOrderService) gets a check over the values of each.
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `api` · harmful: 0
- features: inspection-assignment
- evidence: verification.md finding 3, AC 3 (api)
- last seen: 2026-11-14T12:45:09Z

### L-032 - A status a route newly answers needs an HTTP test of the controller's mapping; a use-case test that throws the exception leaves the mapping unproven.
- signal: `weak_test` · recurrence: 1 feature(s) · scope: `api` · harmful: 0
- features: inspection
- evidence: verification.md finding 2, Surface 409 (api)
- last seen: 2026-11-14T15:13:52Z

### L-033 - A mapping with several outputs (answer labels by type and value) gets a fixture that renders every output.
- signal: `weak_test` · recurrence: 1 feature(s) · scope: `web` · harmful: 0
- features: inspection
- evidence: verification.md finding 4, C23 (web)
- last seen: 2026-11-14T15:13:52Z

### L-034 - Test an edit drawer by opening, typing, cancelling and opening the same record again; one opening cannot catch typed values that survive Cancelar.
- signal: `weak_test` · recurrence: 1 feature(s) · scope: `web` · harmful: 0
- features: customer-ui-redesign
- evidence: verification.md finding 1; C22, C42, C48 (web)
- last seen: 2026-11-17T16:05:50Z

### L-035 - After deleting the last row of a page, assert the list lands on the last page that still has rows.
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `web` · harmful: 0
- features: customer-ui-redesign
- evidence: verification.md finding 2; C52 (web)
- last seen: 2026-11-17T16:05:50Z

### L-036 - Test a displayed date with a fixture near local midnight; a midday UTC fixture shows the same day in every time zone.
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `web` · harmful: 0
- features: customer-ui-redesign
- evidence: verification.md finding 3; C49 (web)
- last seen: 2026-11-17T16:05:50Z

### L-037 - Test picking the menu item of the page already open; navigating to the same URL emits no NavigationEnd.
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `web` · harmful: 0
- features: customer-ui-redesign
- evidence: verification.md finding 4; C9 (web)
- last seen: 2026-11-17T16:05:50Z

### L-038 - A proof of design tokens checks every token of the literal shape inside its own selector block, not a sample anywhere in the file.
- signal: `weak_test` · recurrence: 1 feature(s) · scope: `web` · harmful: 0
- features: customer-ui-redesign
- evidence: verification.md finding 5; C3, C4 (web)
- last seen: 2026-11-17T16:05:50Z

### L-039 - A spec deleted with the markup it tested is replaced by one that holds the same rule on the new markup.
- signal: `weak_test` · recurrence: 1 feature(s) · scope: `web` · harmful: 0
- features: customer-ui-redesign
- evidence: verification.md finding 6; C57 (web)
- last seen: 2026-11-17T16:05:50Z

### L-040 - Check every label, count form and control a criterion fixes against the binding source's text before approval, and list each departure in Differences from the source
- signal: `spec_deviation` · recurrence: 1 feature(s) · scope: `web` · harmful: 0
- features: work-order-ui-redesign
- evidence: verification.md finding 1 (C16 vs captures/inspection-run.png) (web) (+5 more)
- last seen: 2026-11-17T19:09:24Z

### L-041 - A value a test helper injects needs its own test on the layer that really sets it, or the page test stays green when that layer breaks
- signal: `weak_test` · recurrence: 1 feature(s) · scope: `web` · harmful: 0
- features: work-order-ui-redesign
- evidence: verification.md finding 7 (C47 helper sets authentication.name) (web)
- last seen: 2026-11-17T19:09:24Z

### L-042 - Prove a transaction rolls back with a write the database itself refuses after validation passes; a request the validator rejects never reaches the transaction
- signal: `weak_test` · recurrence: 1 feature(s) · scope: `api` · harmful: 0
- features: work-order-ui-redesign
- evidence: verification.md finding 8 (C22 400 stops at Zod) (api)
- last seen: 2026-11-17T19:09:24Z

### L-043 - Prove an if-any-read-fails rule by failing each read in turn; one failing read leaves the others unproven
- signal: `weak_test` · recurrence: 1 feature(s) · scope: `web` · harmful: 0
- features: work-order-ui-redesign
- evidence: verification.md finding 9 (C11, C46, C70) (web)
- last seen: 2026-11-17T19:09:24Z

### L-044 - An ordering claim needs a proof on the real repository's orderBy; the in-memory fake's order proves only the fake
- signal: `weak_test` · recurrence: 1 feature(s) · scope: `api` · harmful: 0
- features: work-order-ui-redesign
- evidence: verification.md finding 10 (C36 order via the in-memory fake) (api)
- last seen: 2026-11-17T19:09:24Z

### L-045 - A component reused by several pages needs each page to feed every input it shows; a field left empty on one page is a gap no single-page test sees
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `web` · harmful: 0
- features: work-order-ui-redesign
- evidence: verification.md finding 11 (Editar drawer on the WorkOrder detail) (web)
- last seen: 2026-11-17T19:09:24Z

### L-046 - When a shared component gains a branch for one kind of caller, give the promise that every other caller keeps today's behaviour its own check on a real other caller.
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `web` · harmful: 0
- features: drawer-standard
- evidence: .specs/features/drawer-standard/verification.md finding 1 (closed by C39) (web)
- last seen: 2026-11-18T01:45:31Z

### L-047 - An edit form that sends every child's state on save opens with that state only after its read has answered, or a pending or failed read clears it.
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `web` · harmful: 0
- features: workforce
- evidence: verification.md finding 1 (web)
- last seen: 2026-11-18T05:16:36Z

### L-048 - When another field narrows a select's allowed options, put its value back to an allowed one, or the hidden value is still sent.
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `web` · harmful: 0
- features: workforce
- evidence: verification.md finding 2 (web)
- last seen: 2026-11-18T05:16:36Z

### L-049 - Copy the binding source's resets after a save: a create that keeps the list filters on can hide the new row.
- signal: `spec_deviation` · recurrence: 1 feature(s) · scope: `web` · harmful: 0
- features: workforce
- evidence: verification.md finding 3 (web)
- last seen: 2026-11-18T05:16:36Z

### L-050 - A concurrency proof asserts each request's status and message, not only the rows left.
- signal: `weak_test` · recurrence: 1 feature(s) · scope: `api` · harmful: 0
- features: workforce
- evidence: verification.md finding 4 (api)
- last seen: 2026-11-18T05:16:36Z

### L-051 - Prove a uniqueness rule on update as well as on create.
- signal: `weak_test` · recurrence: 1 feature(s) · scope: `api` · harmful: 0
- features: workforce
- evidence: verification.md finding 5 (api)
- last seen: 2026-11-18T05:16:36Z

### L-052 - Prove a status filter on every value of the enum, not on two.
- signal: `weak_test` · recurrence: 1 feature(s) · scope: `web` · harmful: 0
- features: workforce
- evidence: verification.md finding 6 (web)
- last seen: 2026-11-18T05:16:36Z

### L-053 - A rule that several pages open must be proven on each page the criterion names.
- signal: `weak_test` · recurrence: 1 feature(s) · scope: `web` · harmful: 0
- features: workforce
- evidence: verification.md finding 7 (web)
- last seen: 2026-11-18T05:16:36Z

### L-054 - Prove the page's handling of a form's output, not only the form on a test host.
- signal: `weak_test` · recurrence: 1 feature(s) · scope: `web` · harmful: 0
- features: workforce
- evidence: verification.md finding 8 (web)
- last seen: 2026-11-18T05:16:36Z

### L-055 - Prove that related records stay on every delete path the rule names.
- signal: `weak_test` · recurrence: 1 feature(s) · scope: `api` · harmful: 0
- features: workforce
- evidence: verification.md finding 9 (api)
- last seen: 2026-11-18T05:16:36Z

### L-056 - Prove each page's loading and failure states and the known-message mapping, not one page's fallback.
- signal: `weak_test` · recurrence: 1 feature(s) · scope: `web` · harmful: 0
- features: workforce
- evidence: verification.md finding 10 (web)
- last seen: 2026-11-18T05:16:36Z

### L-057 - Assert every column the criterion names, not a subset.
- signal: `weak_test` · recurrence: 1 feature(s) · scope: `web` · harmful: 0
- features: workforce
- evidence: verification.md finding 11 (web)
- last seen: 2026-11-18T05:16:36Z

### L-058 - A gate over several reads is proven with each read pending or failed in turn.
- signal: `weak_test` · recurrence: 1 feature(s) · scope: `web` · harmful: 0
- features: workforce
- evidence: verification.md finding 12 (web)
- last seen: 2026-11-18T05:16:36Z

## Quarantined (failed when applied - ignore)

A confirmed lesson that recurred alongside failure. Kept for the maintainer to review.

_none_
