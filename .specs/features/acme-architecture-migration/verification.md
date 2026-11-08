# Acme architecture migration verification

**Verdict**: PASS
**Mutations**: 6 - probed C28 (x2), C7, C22, C27, C10; after the fix pass `check_proofs.py --mutations` kills 6 of 6 (the contrived one with a new C10 example)
**Proofs**: `proofs.md` at 3a4e826 (plus the uncommitted working tree)
**Verifier**: independent sub-agent (author != verifier)

Scope: slice S1 (criteria 1-5) only.

## Findings

| Finding | Evidence | Fix | Closed |
| --- | --- | --- | --- |
| C28 "rethrows any other file-system error" is proven on one code only, and the assertion accepts two | mutation `remove image: code !== 'ENOENT' -> code !== 'ENOENT' && code !== 'EPERM'` not killed; `remove-work-order-service-image.use-case.spec.ts:125` matches `/^(EISDIR or EPERM)$/` and the only trigger is unlinking a directory, whose code depends on the OS | make the unlink fail deterministically with a known code (spy on `fs.promises.unlink` rejecting `EACCES` and `EPERM`) and assert that exact code each time | commit acf4b70: spy on `fs.promises.unlink` rejecting `EACCES`, `EPERM`, `EISDIR`, asserted by identity; C28; mutation killed |
| The in-memory `FetchCustomers` fake hides a real `total` defect, so C8 passes for the wrong reason | `api/test/repositories/in-memory-customers-repository.ts` returns `total: this.items.length`; `prisma-customers.repository.ts` `findMany` calls `this.prisma.customer.count({ take, skip })`, so `take` 2 / `skip` 1 over 3 returns `total` 2 against the database, not the 3 that C8 asserts | record the divergence (or fix the Prisma repository to `count()`) and have the fake mirror the real behaviour, or add a note in C8 that `total` is only the fake's | commit acf4b70: fake keeps the contract (full `total`); the Prisma `count({ take, skip })` defect is recorded in plan criterion 13 and belongs to ROADMAP item 7; C8 |
| Other fakes are more permissive than the Prisma repositories | `InMemoryCustomersRepository.save` silently ignores a customer with no stored address (Prisma `save` throws `Address not found`); `InMemoryVesselsRepository.save` persists `imoNumber` and `customerId` (Prisma `save` writes only `name`, `type`, `length`), so C12 "keeps `imoNumber` and `customerId`" cannot fail in the fake; `InMemoryVesselsRepository.findById` keeps `vessel.id` while Prisma's `toDetailDomain` does not pass the id (a random one) | make the vessel fake `save` write only `name`, `type`, `length`; make the customer fake throw when the stored customer has no address; drop the id the real repository drops | commit acf4b70: vessel fake `save` writes only `name`, `type`, `length` and C12 asserts the returned vessel too; customer-fake address throw and the dropped detail id not applied (no use-case claim reaches them; recorded in plan criterion 13) |
| C1 "sibling spec" proves a file exists, not that it tests anything | `api/test/use-case-specs.spec.ts` checks `existsSync` of `<use-case>.spec.ts` only; an empty or all-`it.skip` spec satisfies it, and the plan's AC 1 is about covered rules | also assert each sibling spec contains at least one `[C<n>]` test (the 24 specs already tag them), or say in the claim that C2-C29 carry the coverage | commit acf4b70: `test/use-case-specs.spec.ts` also requires an `it('[C<n>]` in each sibling spec; C1 |
| `EditCustomerUseCase` cannot clear a phone and C7 does not say so | own example: `phone: null` with a stored `555` returns `555` (`phone ?? customer.phone`); C7 claims only "keeps the stored phone when none is given", which holds, but `null` (allowed by the request type `string or null`) is indistinguishable from "none given" | state in C7/the plan that `null` keeps the phone, or have the use case tell `undefined` from `null` | commit acf4b70: C7 now says `null` keeps the phone and a `null` example is asserted; the defect is recorded in plan criterion 13 |

## Probed and holding

- Killed: `remove image: image-belongs-to-service guard dropped` (C28), `edit customer: address merge -> replace` (C7), `edit service: ownership guard dropped` (C22), `get service: ownership guard dropped` (C27).
- Not killed, not reported as a finding: `create vessel: duplicate IMO ignored for empty customerId` - a contrived condition that no input reaches; the order (duplicate before Customer lookup) itself is asserted by C10's unknown-Customer case.
- Own examples (throwaway, deleted): `FetchVessels` with `skip` 5 beyond the 2 stored and with an unknown `customerId` return an empty page and total 0 without throwing; `CreateVessel` with a repeated IMO number and a known Customer throws `Vessel already exists` and stores nothing more. Both hold.
- Tree: the 23 untouched use-case files are identical to `HEAD`; only `edit-customer.use-case.ts` differs (the planned `NotFoundDomainException` change). `mutate.py` byte-compared every restore.
