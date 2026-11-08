# Umbrielship

Umbrielship supports a naval service company: it records its Customers, their Vessels, and the WorkOrders performed on those Vessels, with the services done and photos of them. Identifiers and documents are English; screen copy in `web` is Portuguese.

## Language

**User**:
A person who signs in to the app, identified by a unique email, with a bcrypt-hashed password and a role (`USER`, `MANAGER` or `DEVELOPER`). A User is not a Customer.
*Avoid*: Customer (for the person who signs in), account

**Customer**:
A person or company that owns Vessels, with a unique email, a phone and one address (address, city, state).
*Avoid*: client, owner (as a separate entity)

**Vessel**:
A ship that belongs to exactly one Customer. It has a name, a type (`CARGO`, `TANKER`, `PASSENGER`, `FISHING`, `BULK_CARRIER`, `CONTAINER`, `OTHER`) and a length (a positive number).
*Avoid*: ship, boat

**IMO number**:
The Vessel's identification code, unique across all Vessels. It is stored as `imoNumber` text and is how the business recognizes a Vessel; other records name the Vessel by its id.
*Avoid*: registration, the Vessel id as a business identifier

**WorkOrder**:
A job done on one Vessel, over a period (`startDate` to `endDate`), with a status: `PENDING` (default), `IN_PROGRESS`, `COMPLETED` or `CANCELLED`. It holds WorkOrderServices.
*Avoid*: order, ticket, job

**WorkOrderService**:
One piece of work inside a WorkOrder: a name, a description, its own period, and a status (`PENDING` default, `IN_PROGRESS`, `COMPLETED`). Deleting its WorkOrder deletes it.
*Avoid*: task, service (unqualified)

**WorkOrderServiceImage**:
An image that documents a WorkOrderService, stored as a `url` under `/uploads/work-order-service-images/`. Deleting its WorkOrderService deletes it.
*Avoid*: photo, attachment
