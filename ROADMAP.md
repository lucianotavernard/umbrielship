# Roadmap

Umbrielship manages the work a naval service company does for its customers: Customers own Vessels, a Vessel receives WorkOrders, and a WorkOrder is made of services documented with images.

Each item ends with a **Status** line that records what the code in `api` and `web` has today. Items 1 to 6 describe what exists. Item 7 is a **proposal** written by the agent that created this file, not a commitment: the owner confirms, edits or deletes it before it is built.

## 1. Identity and access

A User signs in with email and password and works with a token. Every route except sign-in needs it.

**Status:** built in `identity`. `POST /sessions` returns an access token, and `GET /me` returns the authenticated User with its active Organization and Memberships; `JwtAuthGuard` is global and `@Public()` opens a route. Users belong to Organizations through Memberships with a Role (`administrator`, `operator`); an internal Administrator creates Organizations, Users and Invitations, and `npx prisma db seed` creates the first Administrator. Web: the authentication page, `authGuard`, and the token interceptor (the web still calls the old route that `/me` replaced, and slice S4 of `.specs/features/acme-architecture-migration/plan.md` moves it).

## 2. Customers

A Customer is a person or company that owns Vessels, with a contact and an address.

**Status:** built in `customer`. Customers are created, listed, read and edited (no delete); email is unique within the Organization. Web: the Customers list with a form in a sheet, and the Customer detail page.

## 3. Vessels

A Vessel belongs to one Customer and is identified in the business by its IMO number.

**Status:** built in `customer`. Vessels are created, listed (all, or by Customer), read, edited and deleted; the IMO number is unique within the Organization. Web: the Vessels list, the Vessel detail page, and the Vessel form.

## 4. Work orders, services and images

A WorkOrder is a job on one Vessel over a period. It holds services, and each service holds the images that document it.

**Status:** built in `work-order`. WorkOrders are created, listed, read, edited and deleted for an existing Vessel. Services are created, listed, read, edited and deleted under a WorkOrder. Images are uploaded (multipart, stored under `api/uploads/work-order-service-images/`), listed and deleted per service. Web: the WorkOrder detail page with its services and image upload; the dashboard (`analytics`) shows summary cards.

## 5. Tests foundation

The API has a unit-test tier: one Vitest spec per use case on in-memory repositories, and no database is needed.

**Status:** built. `npm run test` in `api/` runs the specs in `src/package/<context>/<aggregate>/__test__/` and the layout specs in `api/test/`; the leftover Nest e2e scaffold is gone. Absorbed by `.specs/features/acme-architecture-migration/plan.md` (S1).

## 6. Error mapping cleanup

Controllers map the known domain exceptions to 404 and 409 and rethrow the rest, so an unexpected failure answers 500.

**Status:** built. Every controller's `catch` ends with `throw error`. Absorbed by the same plan (S2).

## 7. Pagination fix (proposal)

List controllers compute `take = page * 10` with `skip = (page - 1) * 10`, so page 2 returns up to 20 rows, and `customer-list` in the web requests `/api/customers` without a `page` parameter. Make the page size consistent (`take = 10`), pass `page` from the web list screens that have a paginator, and align `total` with the page filter.
