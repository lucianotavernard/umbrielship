# Acme architecture migration verification

**Verdict**: FAIL
**Mutations**: 6 - probed C48, C50, C52, C54, C55, C56
**Proofs**: `proofs.md` at 3601caa
**Verifier**: independent sub-agent (author != verifier)

## Findings

| Finding | Evidence | Fix | Closed |
| --- | --- | --- | --- |
| `AcceptInvitationUseCase`'s own "already accepted" 409 is not proven: the in-memory `accept` throws `ConflictDomainException('Invitation already accepted')` itself, so the C54 second-accept test passes whether or not the use case checks the status | mutation `accept invitation: already-accepted 409 guard dropped` (`invitation.status === 'accepted'` -> `false`) not killed; `api/test/repositories/in-memory-invitations-repository.ts:85-89` | make the fake `accept` not guard status (or add a C54 case that asserts `accept` is not called for an accepted Invitation), so the use case rule is what the test sees | `f198c46`: C54 spies `accept` and asserts it is not called on a second accept; mutation now killed |
| Organization scoping in the Prisma repositories (the `organizationId` filter, scoped IMO and email uniqueness, citext) has no unit proof: every tenancy spec (C35-C39) runs on in-memory fakes that carry their own scope rule, so a dropped `where: { organizationId }` in `Prisma*Repository` is caught only by the one-shot docker walk (C64) | `vessel.repository.ts` `findById` filters in code after a `findUnique({ where: { id } })`; no spec or mutation reaches any `Prisma*Repository`; C64 is the only proof and I did not rerun it | name in C64 which step fails per repository, or add a mutation-friendly proof (a repository contract spec run against the in-memory and a throwaway PostgreSQL) | `2c77df9` (no new code): C64 already walks each Prisma scope (customers list `1`, vessel of B 404 from A, IMO in A and B 201/201, `abc123`/`ABC123` 409, customer email other case 409) against real PostgreSQL |
