# LESSONS - auto-maintained by scripts/lessons.py

> Machine-owned. Do NOT hand-edit. Changes are overwritten on the next `lessons.py` write.
> Canonical state lives in `.specs/lessons.json`. Edit lessons only via the script.
> promote_threshold=2 distinct features · window_days=45 · quarantine_threshold=2

## Confirmed (load these at Plan/Checks)

Corroborated across multiple features. Safe to apply as guidance.

_none_

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

## Quarantined (failed when applied - ignore)

A confirmed lesson that recurred alongside failure. Kept for the maintainer to review.

_none_
