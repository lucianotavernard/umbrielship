# Umbrielship

Umbrielship supports naval service companies: each one is an Organization that records its Customers, their Vessels, and the WorkOrders performed on those Vessels, with the services done and photos of them. Identifiers and documents are English; screen copy in `web` is Portuguese.

## Language

**Organization**:
A naval service company that uses the app. It has a unique name and a unique email (compared without case) and owns every Customer, Vessel and WorkOrder, so one Organization never sees another's records. The internal Organization (`isInternal`, named "Umbrielship") is created by the seed and the app never creates another: its Administrators create the other Organizations, their Users and their Invitations.
*Avoid*: company, tenant, account

**User**:
A person who signs in to the app, identified by a unique email (compared without case), with a bcrypt-hashed password. A User holds one Membership in each Organization it works for and has one active Organization, the one its requests act on. A User is not a Customer.
*Avoid*: Customer (for the person who signs in), account

**Membership**:
The link between a User and an Organization, with a Role. A User has at most one Membership per Organization; deleting the Organization or the User deletes it.
*Avoid*: member, seat

**Role**:
What a User may do in an Organization, set on its Membership: `administrator`, `operator` or `inspector`. An `administrator` and an `operator` read and write the Organization's Customers, Vessels and WorkOrders. An `inspector` reads every record of its Organization and writes none of them; it is the Role that will record inspections. Only an Administrator of the internal Organization may manage Organizations, Users and Invitations.
*Avoid*: permission, privilege level

**Invitation**:
An offer, made by an internal Administrator, for an existing User to join a non-internal Organization with a Role. It carries a random secret sent in an email link; it is `pending` until accepted, and its email delivery is `queued`, `delivered` or `failed`. Accepting it adds the Membership.
*Avoid*: invite, signup link

**Customer**:
A person or company that owns Vessels, with an email unique within its Organization (compared without case), a phone and one address (address, city, state). It belongs to exactly one Organization. Deleting it deletes its address. A Customer that still has a Vessel is not deleted.
*Avoid*: client, owner (as a separate entity)

**Vessel**:
A ship that belongs to exactly one Customer. It has a name, a type (`CARGO`, `TANKER`, `PASSENGER`, `FISHING`, `BULK_CARRIER`, `CONTAINER`, `OTHER`) and a length (a positive number).
*Avoid*: ship, boat

**IMO number**:
The Vessel's identification code, unique within its Organization (compared without case): two Organizations may register the same code. It is stored as `imoNumber` text and is how the business recognizes a Vessel; other records name the Vessel by its id.
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
