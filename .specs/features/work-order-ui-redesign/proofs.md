# work-order-ui-redesign proofs

**HEAD**: bd7ee26
**Tree**: clean
**Shell**: /bin/sh
**Result**: 116 pass, 8 fail

| Check | Proof | Result |
| --- | --- | --- |
| C1 | `run web / ✓ work-order-list.spec.ts > WorkOrderList > work-order-ui C1 requests work orders, vessels and custo` | pass |
| C1 | `browser - open /work-orders at 1440x1250 as an operator, save captures/work-order-list.running.png` | pass |
| C2 | `run api / ✓ fetch-work-orders.use-case.spec.ts > FetchWorkOrdersUseCase > work-order-ui C2 returns every work ` | pass |
| C2 | `run api / ✓ work-order.repository.spec.ts > PrismaWorkOrdersRepository > work-order-ui C2 reads every work ord` | pass |
| C2 | `run api / ✓ work-order.http.spec.ts > GET /work-orders > work-order-ui C2 answers every work order without tak` | pass |
| C2 | `run api / ✓ work-order.http.spec.ts > GET /work-orders > work-order-ui C2 answers 400 on a bad take and 401 wi` | pass |
| C3 | `run smoke / ok   work-order-ui C3 services with no service (0)` | pass |
| C3 | `run smoke / ok   work-order-ui C3 services after a service create (1)` | pass |
| C3 | `run smoke / ok   work-order-ui C3 services after a service delete (0)` | pass |
| C4 | `run web / ✓ work-order-list.spec.ts > WorkOrderList > work-order-ui C4 sorts by docagem descending then by cod` | pass |
| C5 | `run web / ✓ work-order-filters.spec.ts > workOrderMetrics > work-order-ui C5 counts 24, 08, 05, 07 and 120 ove` | pass |
| C5 | `run web / ✓ work-order-list.spec.ts > WorkOrderList > work-order-ui C5 shows the four metrics over every work ` | pass |
| C6 | `run web / ✓ work-order-list.spec.ts > WorkOrderList > work-order-ui C6 filters by the status tab with its coun` | pass |
| C7 | `run web / ✓ work-order-filters.spec.ts > filterWorkOrders > work-order-ui C7 matches code with or without hash` | pass |
| C7 | `run web / ✓ work-order-list.spec.ts > WorkOrderList > work-order-ui C7 searches within the tab with no request` | pass |
| C8 | `run web / ✓ work-order-list.spec.ts > WorkOrderList > work-order-ui C8 shows vessel, code and customer, servic` | pass |
| C8 | `run web / ✓ work-order-filters.spec.ts > prazoLabel > work-order-ui C8 reads Hoje, Amanhã or the short date wi` | pass |
| C9 | `run web / ✓ work-order-list.spec.ts > WorkOrderList > work-order-ui C9 pages by 8 with one button per page and` | pass |
| C10 | `run web / ✓ work-order-list.spec.ts > WorkOrderList > work-order-ui C10 tells an empty organization from a fil` | pass |
| C11 | `run web / ✓ work-order-list.spec.ts > WorkOrderList > work-order-ui C11 shows skeleton rows while loading and ` | pass |
| C12 | `run web / ✓ work-order-list.spec.ts > WorkOrderList > work-order-ui C12 selects rows and the page, shows indet` | pass |
| C13 | `run web / ✓ work-order-csv.spec.ts > workOrderCsv > work-order-ui C13 writes the header, the Aurora line, a gu` | pass |
| C13 | `run web / ✓ work-order-list.spec.ts > WorkOrderList > work-order-ui C13 exports the selected work orders, hidd` | pass |
| C14 | `run web / ✓ work-order-list.spec.ts > WorkOrderList > work-order-ui C14 the row menu opens the detail and dele` | pass |
| C14 | `run web / ✓ work-order-list.spec.ts > WorkOrderList > work-order-ui C14 a 409 on delete keeps the row and show` | pass |
| C15 | `run web / ✓ work-order-list.inspector.spec.ts > WorkOrderList as inspector > work-order-ui C15 hides the write` | pass |
| C16 | `run web / ✓ app-shell.spec.ts > Shell > work-order-ui C16 lists six items in the mareos order and Organizações` | pass |
| C16 | `run web / ✓ app-shell.spec.ts > Shell > work-order-ui C16 the breadcrumb and the active item follow the work o` | pass |
| C17 | `walk - open /work-orders, /work-orders/:id, /inspections, the inspection page and /agenda at the five widths a` | pass (Walked) |
| C18 | `run web / ✓ work-order-drawer.spec.ts > WorkOrderDrawer > work-order-ui C18 opens with the vessel, the read-on` | pass |
| C18 | `run web / ✓ work-order-drawer.spec.ts > WorkOrderDrawer > work-order-ui C18 adds and removes services, with Re` | pass |
| C18 | `browser - open "Nova ordem de serviço" on /work-orders at 1440x1000, save captures/work-order-drawer.running.p` | **diverges** (screens.md) |
| C19 | `run web / ✓ work-order-drawer.spec.ts > WorkOrderDrawer > work-order-ui C19 posts the work order with its serv` | pass |
| C20 | `run web / ✓ work-order-drawer.spec.ts > WorkOrderDrawer > work-order-ui C20 sends nothing and shows each requi` | pass |
| C21 | `run api / ✓ create-work-order.use-case.spec.ts > CreateWorkOrderUseCase > work-order-ui C21 creates the servic` | pass |
| C21 | `run api / ✓ create-work-order.use-case.spec.ts > CreateWorkOrderUseCase > work-order-ui C21 stores nothing whe` | pass |
| C21 | `run api / ✓ work-order.repository.spec.ts > PrismaWorkOrdersRepository > work-order-ui C21 writes the work ord` | pass |
| C21 | `run api / ✓ work-order.http.spec.ts > POST /work-orders > work-order-ui C21 answers 201 with services and 400 ` | pass |
| C21 | `run api / ✓ work-order.http.spec.ts > POST /work-orders > work-order-ui C21 answers 403 to an inspector and 40` | pass |
| C22 | `run smoke / ok   work-order-ui C22 services stored with the work order (2)` | pass |
| C22 | `run smoke / ok   work-order-ui C22 services take the work order period and PENDING (ok)` | pass |
| C22 | `run smoke / ok   work-order-ui C22 invalid create answers 400 (400)` | pass |
| C22 | `run smoke / ok   work-order-ui C22 invalid create stores nothing (same)` | pass |
| C23 | `run web / ✓ work-order-drawer.spec.ts > WorkOrderDrawer > work-order-ui C23 keeps the drawer and the values wh` | pass |
| C24 | `run web / ✓ vessel-detail.spec.ts > VesselDetail > work-order-ui C24 Nova ordem opens the drawer with the vess` | pass |
| C25 | `run web / ✓ work-order-drawer.spec.ts > WorkOrderDrawer > work-order-ui C25 edits dates and status from the ro` | pass |
| C25 | `run web / ✓ work-order-detail.spec.ts > WorkOrderDetail > work-order-ui C25 Editar on the detail puts the new ` | pass |
| C26 | `run web / ✓ work-order-drawer.spec.ts > WorkOrderDrawer > work-order-ui C26 Cancelar, Fechar formulário and Es` | pass |
| C27 | `run web / ✓ work-order-detail.spec.ts > WorkOrderDetail > work-order-ui C27 shows the breadcrumb, header, vess` | pass |
| C28 | `run web / ✓ work-order-detail.spec.ts > WorkOrderDetail > work-order-ui C28 lists the services and creates one` | pass |
| C28 | `run web / ✓ work-order-detail.spec.ts > WorkOrderDetail > work-order-ui C28 uploads a photo to the service ima` | pass |
| C28 | `run web / ✓ work-order-detail.spec.ts > WorkOrderDetail > work-order-ui C28 says no service was executed when ` | pass |
| C29 | `run web / ✓ inspection-assignment-section.spec.ts > Inspection assignments section > work-order-ui C29 Inspeci` | pass |
| C30 | `run web / ✓ work-order-detail.spec.ts > WorkOrderDetail > work-order-ui C30 a 404 shows the not found state wi` | pass |
| C31 | `run web / ✓ work-order-detail.spec.ts > WorkOrderDetail > work-order-ui C31 shows skeletons while the work ord` | pass |
| C32 | `run web / ✓ work-order-detail.inspector.spec.ts > WorkOrderDetail as inspector > work-order-ui C32 hides every` | pass |
| C33 | `run web / ✓ inspections-hub.spec.ts > InspectionsHub > work-order-ui C33 requests templates, assignments, work` | pass |
| C33 | `browser - open /inspections at 1440x1000 as the administrator, save captures/inspection-templates.running.png` | **diverges** (screens.md) |
| C34 | `run api / ✓ fetch-organization-inspection-assignments.use-case.spec.ts > FetchOrganizationInspectionAssignment` | pass |
| C34 | `run api / ✓ inspection-assignment.repository.spec.ts > PrismaInspectionAssignmentsRepository > work-order-ui C` | pass |
| C34 | `run api / ✓ inspection-assignment.http.spec.ts > GET /inspection-assignments > work-order-ui C34 answers every` | pass |
| C35 | `run smoke / ok   work-order-ui C35 assignment carries the work order status (PENDING)` | pass |
| C35 | `run smoke / ok   work-order-ui C35 assignment follows the work order edit (IN_PROGRESS)` | pass |
| C36 | `run api / ✓ fetch-inspection-templates.use-case.spec.ts > FetchInspectionTemplatesUseCase > work-order-ui C36 ` | pass |
| C36 | `run api / ✓ inspection-template.http.spec.ts > GET /inspection-templates > work-order-ui C36 answers every tem` | pass |
| C36 | `run smoke / ok   work-order-ui C36 templates without page (12)` | pass |
| C37 | `run web / ✓ inspections-hub.spec.ts > InspectionsHub > work-order-ui C37 counts templates, waiting assignments` | pass |
| C38 | `run web / ✓ inspections-hub.spec.ts > InspectionsHub > work-order-ui C38 shows the template cards with their c` | pass |
| C38 | `run web / ✓ inspections-hub.spec.ts > InspectionsHub > work-order-ui C38 an operator reads the tabs with no wr` | pass |
| C38 | `run web / ✓ inspections-hub.spec.ts > InspectionsHub > work-order-ui C38 says there is no template` | pass |
| C39 | `run web / ✓ inspections-hub.spec.ts > InspectionsHub > work-order-ui C39 creates a template from the drawer an` | pass |
| C39 | `run web / ✓ inspections-hub.spec.ts > InspectionsHub > work-order-ui C39 a taken name keeps the drawer open` | pass |
| C39 | `browser - open "Novo modelo" on /inspections at 1440x1000, save captures/inspection-template-drawer.running.pn` | **diverges** (screens.md) |
| C40 | `run web / ✓ inspections-hub.spec.ts > InspectionsHub > work-order-ui C40 assigns a template to a work order se` | pass |
| C40 | `browser - open "Atribuir à OS" on the first card at 1440x1000, save captures/inspection-assignment-drawer.runn` | **diverges** (screens.md) |
| C41 | `run web / ✓ inspections-hub.spec.ts > InspectionsHub > work-order-ui C41 lists the assignments with target, pi` | pass |
| C41 | `run web / ✓ inspections-hub.spec.ts > InspectionsHub > work-order-ui C41 says no inspection is assigned` | pass |
| C41 | `browser - open the Atribuições tab at 1440x1000, save captures/inspection-assignments.running.png` | **diverges** (screens.md) |
| C42 | `run web / ✓ inspections-hub.inspector.spec.ts > InspectionsHub as inspector > work-order-ui C42 lists inspecta` | pass |
| C42 | `run web / ✓ inspection-availability.spec.ts > inspectionBlockedReason > work-order-ui C42 blocks on the work o` | pass |
| C42 | `browser - open /inspections at 1440x1000 as an inspector, save captures/inspection-inspector-view.running.png` | **diverges** (screens.md) |
| C43 | `run web / ✓ app.routes.spec.ts > routes > work-order-ui C43 redirects the template list to the hub` | pass |
| C44 | `run web / ✓ inspection-template-detail.spec.ts > InspectionTemplateDetail > work-order-ui C44 shows the breadc` | pass |
| C44 | `run web / ✓ inspection-template-detail.spec.ts > InspectionTemplateDetail > work-order-ui C44 edits in the Edi` | pass |
| C45 | `run web / ✓ inspection-template-detail.spec.ts > InspectionTemplateDetail > work-order-ui C45 a 404 shows the ` | pass |
| C46 | `run web / ✓ inspections-hub.spec.ts > InspectionsHub > work-order-ui C46 shows skeletons while loading and a t` | pass |
| C47 | `run web / ✓ inspection-page.spec.ts > InspectionPage > work-order-ui C47 shows the header, meta and the back l` | pass |
| C47 | `browser - open the inspect page of an assignment of a WorkOrder in progress at 1440x1000 as an inspector, save` | **diverges** (screens.md) |
| C48 | `run web / ✓ inspection-page.spec.ts > InspectionPage > work-order-ui C48 offers the controls of each type with` | pass |
| C49 | `run web / ✓ inspection-page.spec.ts > InspectionPage > work-order-ui C49 counts answered questions as they cha` | pass |
| C50 | `run web / ✓ inspection-page.spec.ts > InspectionPage > work-order-ui C50 names and focuses the first unanswere` | pass |
| C51 | `run web / ✓ inspection-page.spec.ts > InspectionPage > work-order-ui C51 asks for the result, posts the inspec` | pass |
| C52 | `run web / ✓ inspection-page.spec.ts > InspectionPage > work-order-ui C52 keeps the answers when the API fails` | pass |
| C53 | `run web / ✓ inspection-page.spec.ts > InspectionPage > work-order-ui C53 says answers are stored on conclusion` | pass |
| C54 | `run web / ✓ inspection-page.spec.ts > InspectionPage > work-order-ui C54 shows the reason for a blocked assign` | pass |
| C54 | `run web / ✓ app.routes.spec.ts > routes > work-order-ui C54 guards the inspect page for the inspector role` | pass |
| C55 | `run web / ✓ inspection-page.spec.ts > InspectionPage > work-order-ui C55 reads a completed inspection with its` | pass |
| C56 | `run web / ✓ inspection-page.spec.ts > InspectionPage > work-order-ui C56 an inspector discards after confirmin` | pass |
| C57 | `walk - open the inspect page at 640px and compare scrollWidth with innerWidth` | pass (Walked) |
| C58 | `run web / ✓ agenda.spec.ts > Agenda > work-order-ui C58 requests work orders and vessels once and opens on the` | pass |
| C58 | `browser - open /agenda at 1440x1161 as an operator, save captures/agenda.running.png` | **diverges** (screens.md) |
| C59 | `run web / ✓ agenda-week.spec.ts > agendaItems > work-order-ui C59 places services and dockings, clamps the row` | pass |
| C59 | `run web / ✓ agenda.spec.ts > Agenda > work-order-ui C59 shows each item with its time, vessel, name and code i` | pass |
| C60 | `run web / ✓ agenda.spec.ts > Agenda > work-order-ui C60 the day headers count one item, many items or Livre` | pass |
| C61 | `run web / ✓ agenda-week.spec.ts > weekLabel > work-order-ui C61 reads one month or the cross month range` | pass |
| C61 | `run web / ✓ agenda.spec.ts > Agenda > work-order-ui C61 Hoje, Semana anterior and Próxima semana move the week` | pass |
| C62 | `run web / ✓ agenda.spec.ts > Agenda > work-order-ui C62 Dia shows the selected day and a header selects it` | pass |
| C63 | `run web / ✓ agenda.spec.ts > Agenda > work-order-ui C63 the type chips and the search filter grid, panel and m` | pass |
| C64 | `run web / ✓ agenda.spec.ts > Agenda > work-order-ui C64 counts the week items and dockings` | pass |
| C65 | `run web / ✓ agenda.spec.ts > Agenda > work-order-ui C65 the day panel names the day, counts it and lists its i` | pass |
| C66 | `run web / ✓ agenda.spec.ts > Agenda > work-order-ui C66 an item opens its work order` | pass |
| C67 | `run web / ✓ agenda.spec.ts > Agenda > work-order-ui C67 a cell opens the drawer at its hour and adds a pending` | pass |
| C68 | `run web / ✓ agenda.inspector.spec.ts > Agenda as inspector > work-order-ui C68 hides every create control` | pass |
| C69 | `run web / ✓ agenda.spec.ts > Agenda > work-order-ui C69 shows no team, availability, tide or demo text` | pass |
| C70 | `run web / ✓ agenda.spec.ts > Agenda > work-order-ui C70 shows skeletons while loading and a toast when a reque` | pass |
| C71 | `run web / ✓ app.routes.spec.ts > routes > work-order-ui C71 declares the work order, inspection and agenda rou` | pass |
| C72 | `run web / ✓ app-shell.spec.ts > Shell > work-order-ui C72 the layout keeps the signed-in name for the inspecti` | pass |
| C73 | `run smoke / ok   work-order-ui C73 refused service write fails (500)` | pass |
| C73 | `run smoke / ok   work-order-ui C73 refused service write stores no work order (same)` | pass |
| C74 | `run api / ✓ inspection-template.repository.spec.ts > PrismaInspectionTemplatesRepository > work-order-ui C36 a` | pass |
| C75 | `run web / ✓ work-order-detail.spec.ts > WorkOrderDetail > work-order-ui C75 Editar on the detail shows the ves` | pass |
| Build | `cd api && npm run lint` | pass |
| Build | `cd api && npm run build` | pass |
| Build | `cd web && npm run build` | pass |

## Output

`Run web` - exit 0

```
 ✓  web  src/package/work-order/work-order/__test__/work-order-list.spec.ts > WorkOrderList > work-order-ui C11 shows skeleton rows while loading and a toast when a request fails 76ms
 ✓  web  src/package/work-order/agenda/__test__/agenda.spec.ts > Agenda > work-order-ui C66 an item opens its work order 48ms
 ✓  web  src/package/work-order/agenda/__test__/agenda.spec.ts > Agenda > work-order-ui C67 a cell opens the drawer at its hour and adds a pending service to the grid 75ms
 ✓  web  src/package/work-order/agenda/__test__/agenda.spec.ts > Agenda > work-order-ui C67 Novo compromisso and Adicionar compromisso neste dia start at the selected day at 08:00 71ms
 ✓  web  src/package/work-order/agenda/__test__/agenda.spec.ts > Agenda > work-order-ui C69 shows no team, availability, tide or demo text 28ms
 ✓  web  src/package/work-order/agenda/__test__/agenda.spec.ts > Agenda > work-order-ui C70 shows skeletons while loading and a toast when a request fails 59ms
 ✓  web  src/package/work-order/work-order/__test__/work-order-list.spec.ts > WorkOrderList > work-order-ui C12 selects rows and the page, shows indeterminate and keeps the selection 161ms
 ✓  web  src/package/work-order/work-order/__test__/work-order-list.spec.ts > WorkOrderList > work-order-ui C13 exports the selected work orders, hidden ones included 38ms
 ✓  web  src/package/work-order/work-order/__test__/work-order-list.spec.ts > WorkOrderList > work-order-ui C14 the row menu opens the detail and deletes after confirmation 69ms
 ✓  web  src/package/work-order/work-order/__test__/work-order-list.spec.ts > WorkOrderList > work-order-ui C14 a 409 on delete keeps the row and shows the API message 37ms

 Test Files  45 passed (45)
      Tests  225 passed (225)
   Start at  15:33:40
   Duration  4.70s (transform 5.40s, setup 7.58s, import 15.48s, tests 34.41s, environment 29.09s)
```

`Run api` - exit 0

```
 ✓ src/package/work-order/work-order-service/__test__/fetch-work-order-services.use-case.spec.ts > FetchWorkOrderServicesUseCase > [C24] returns only the services of that work order 1ms
 ✓ src/package/identity/user/__test__/fetch-users.use-case.spec.ts > FetchUsersUseCase > [C61] returns only the Users with no Membership in the Organization, paged, with the total 3ms
 ✓ src/package/customer/__test__/customer.facade.spec.ts > CustomerFacade > [C40] returns plain vessel data for a Vessel of the Organization 2ms
 ✓ src/package/customer/__test__/customer.facade.spec.ts > CustomerFacade > [C40] returns null for an unknown id and for a Vessel of another Organization 0ms
 ✓ src/package/work-order/inspection-assignment/__test__/fetch-organization-inspection-assignments.use-case.spec.ts > FetchOrganizationInspectionAssignmentsUseCase > work-order-ui C34 returns every assignment of the Organization and no other 5ms
 ✓ src/package/work-order/work-order-service/__test__/work-order-service.repository.spec.ts > PrismaWorkOrderServicesRepository > inspection C35 turns the database refusal into ConflictDomainException 3ms
 ✓ src/package/customer/vessel/__test__/vessel.repository.spec.ts > PrismaVesselsRepository > customer-ui C35 asks for every vessel when no page is given 2ms

 Test Files  81 passed (81)
      Tests  313 passed (313)
   Start at  15:33:45
   Duration  2.27s (transform 5.93s, setup 0ms, import 25.25s, tests 2.24s, environment 9ms)

[Nest] 413302  - 17/11/2026, 15:33:46   ERROR [identity] {"operation":"invitation_enqueue_failed","organizationId":"dest","invitationId":"493fe948-366f-4ce5-b875-b9ea28e9668e","message":"redis down"}
[Nest] 413492  - 17/11/2026, 15:33:47   ERROR [identity] {"operation":"invitation_enqueue_failed","organizationId":"organization","invitationId":"c7b4930c-d42d-48c6-9c72-b607e83d2cc2","message":"redis down"}
```

`Run smoke` - exit 0

```
  ok   link carries a 64 hex secret (64)
  ok   accept (200)
  ok   accept organization (Org A)
  ok   second accept (409)
  ok   unknown secret (404)
  ok   switch to a member organization (204)
  ok   /me after switch (Org A)
  ok   switch to a stranger organization (404)
redis down, then recovery at boot
  ok   send invitation with Redis down (201)
  ok   recovered invitation email arrived (0)
postgres down
  ok   GET /customers with PostgreSQL down (500)

smoke: all checks passed
```
