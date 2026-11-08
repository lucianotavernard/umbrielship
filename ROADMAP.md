# Roadmap

Umbrielship manages the work a naval service company does for its customers: Customers own Vessels, a Vessel receives WorkOrders, and a WorkOrder is made of services documented with images.

Each item ends with a **Status** line that records what the code in `api` and `web` has today. Items 1 to 4 describe what exists. Items 5 to 7 are **proposals** written by the agent that created this file, not commitments: the owner confirms, edits or deletes them before they are built.

## 1. Identity and access

A User signs in with email and password and works with a token. Every route except sign-in needs it.

**Status:** built in `identity`. `POST /sessions` returns an access token, and `GET /whoami` returns the authenticated User; `JwtAuthGuard` is global and `@Public()` opens a route. Users have a role (`USER`, `MANAGER`, `DEVELOPER`) that no route checks yet. There is no User creation: Users are inserted by hand. Web: the authentication page, `authGuard`, and the token interceptor.

## 2. Customers

A Customer is a person or company that owns Vessels, with a contact and an address.

**Status:** built in `customer`. Customers are created, listed, read and edited (no delete); email is unique. Web: the Customers list with a form in a sheet, and the Customer detail page.

## 3. Vessels

A Vessel belongs to one Customer and is identified in the business by its IMO number.

**Status:** built in `customer`. Vessels are created, listed (all, or by Customer), read, edited and deleted; the IMO number is unique. Web: the Vessels list, the Vessel detail page, and the Vessel form.

## 4. Work orders, services and images

A WorkOrder is a job on one Vessel over a period. It holds services, and each service holds the images that document it.

**Status:** built in `work-order`. WorkOrders are created, listed, read, edited and deleted for an existing Vessel. Services are created, listed, read, edited and deleted under a WorkOrder. Images are uploaded (multipart, stored under `api/uploads/work-order-service-images/`), listed and deleted per service. Web: the WorkOrder detail page with its services and image upload; the dashboard (`analytics`) shows summary cards.

## 5. Tests foundation (proposal)

The API has Jest configured and no spec. Cover the use cases first, with in-memory fakes of the repository abstract classes, then fix the leftover `test/app.e2e-spec.ts` or remove it.

## 6. Error mapping cleanup (proposal)

Controllers end with `throw new BadRequestException(error.message)`, so any unexpected failure answers 400 with its message. Map the known domain exceptions and let the rest propagate to Nest's 500. Remove the unused `@Param('customerId')` in `create-vessel.controller.ts`.

## 7. Pagination fix (proposal)

List controllers compute `take = page * 10` with `skip = (page - 1) * 10`, so page 2 returns up to 20 rows, and `customer-list` in the web requests `/api/customers` without a `page` parameter. Make the page size consistent (`take = 10`), pass `page` from the web list screens that have a paginator, and align `total` with the page filter.
