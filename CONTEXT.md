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

**InspectionTemplate**:
A named, ordered checklist of 1 to 100 questions that belongs to one Organization; shown in the app as "Modelo de inspeção". Only an `administrator` creates, edits or deletes it, and every Role reads it. Its name is unique within its Organization, compared without case. Each question has a type: free text (`TEXT`), yes/no (`YES_NO`), conforming/non-conforming (`CONFORMITY`) or a score from 0 to 10 (`SCORE`). Editing replaces its whole question list; deleting it deletes its questions.
*Avoid*: checklist, form, template (unqualified)

**InspectionAssignment**:
A copy of an InspectionTemplate's name and questions placed on one WorkOrder, with or without a target WorkOrderService of that WorkOrder; the target is the WorkOrderService when it has one, otherwise the WorkOrder. Only an `administrator` assigns or removes it, and every Role reads it. Editing or deleting the InspectionTemplate does not change it. It is deleted with its WorkOrder or its WorkOrderService, and a WorkOrder may hold the same template more than once.
*Avoid*: inspection (for the assignment itself), task

**Inspection**:
One answer sheet of an InspectionAssignment, completed by an `inspector` while the WorkOrder, and the target WorkOrderService when there is one, are `IN_PROGRESS`. Every question is answered with a value of its type or "not applicable", with an optional note except on free text; on closing, the inspector confirms the result, `APPROVED` or `REPROVED`. It keeps the inspector's name and the time, and is never edited. An inspector may discard it: it is hidden from the app and kept in the database. An InspectionAssignment holds any number of Inspections, and a WorkOrder, WorkOrderService or InspectionAssignment with an Inspection, discarded ones included, cannot be deleted.
*Avoid*: vistoria (in identifiers), report, check

**Staff**:
A person the Organization allocates to WorkOrderServices, shown in the app as "Profissional"; not a User, it never signs in. It has a name, a specialty (free text), an email and a phone, all required, and at most one Team. The name and the email are each unique within its Organization, compared without case. Only an `administrator` creates, edits or deletes it, and every Role reads it. A Staff that is the Responsável of a WorkOrderService cannot be deleted. Its status is derived, never stored: "Em serviço" while it, or its Team, is the Responsável of a WorkOrderService `IN_PROGRESS` whose WorkOrder is `PENDING` or `IN_PROGRESS`, otherwise "Disponível".
*Avoid*: technician, user, employee

**Team**:
A group of Staff with a name, unique within its Organization (compared without case), and a specialty; shown in the app as "Equipe". Only an `administrator` creates, edits or deletes it. Deleting it leaves its Staff with no Team; a Team that is the Responsável of a WorkOrderService cannot be deleted. Its status is "Em serviço" while the Team itself is the Responsável of a WorkOrderService `IN_PROGRESS` whose WorkOrder is `PENDING` or `IN_PROGRESS`.
*Avoid*: crew, squad, time

**Assignment**:
The Responsável of one WorkOrderService: one Staff or one Team, never both, and at most one per WorkOrderService; shown in the app as "Responsável". It has no period of its own (it lasts as the service's) and nothing checks overlaps between services. An `administrator` sets, changes or clears it in the WorkOrder forms, and a new one is accepted only while the WorkOrder is `PENDING` or `IN_PROGRESS` and the service is not `COMPLETED`. It is deleted with its WorkOrder or its WorkOrderService, and it keeps its Staff or Team from being deleted.
*Avoid*: allocation (in identifiers), InspectionAssignment (a different thing)
