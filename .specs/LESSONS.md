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
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `use-case` · harmful: 0
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

## Quarantined (failed when applied - ignore)

A confirmed lesson that recurred alongside failure. Kept for the maintainer to review.

_none_
