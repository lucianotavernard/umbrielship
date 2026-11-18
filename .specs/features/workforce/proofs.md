# workforce proofs

**HEAD**: 9dc6984
**Tree**: clean
**Shell**: /bin/sh
**Result**: 144 pass, 0 fail

| Check | Proof | Result |
| --- | --- | --- |
| C1 | `run api / ✓ create-staff.use-case.spec.ts > CreateStaffUseCase > workforce C1 stores a staff trimmed with the ` | pass |
| C1 | `run api / ✓ create-staff.use-case.spec.ts > CreateStaffUseCase > workforce C1 stores the team of the organizat` | pass |
| C1 | `run api / ✓ staff.http.spec.ts > POST /staff > workforce C1 answers 201 with the staff` | pass |
| C1 | `run api / ✓ staff.repository.spec.ts > PrismaStaffRepository > workforce C1 writes every field of the staff` | pass |
| C1 | `run smoke / ok   workforce C1 staff stored trimmed and lower-cased` | pass |
| C2 | `run api / ✓ create-staff.use-case.spec.ts > CreateStaffUseCase > workforce C2 refuses a name used in the organ` | pass |
| C2 | `run api / ✓ create-staff.use-case.spec.ts > CreateStaffUseCase > workforce C2 refuses an email used in the org` | pass |
| C2 | `run api / ✓ create-staff.use-case.spec.ts > CreateStaffUseCase > workforce C2 accepts the same name in another` | pass |
| C2 | `run api / ✓ create-staff.use-case.spec.ts > CreateStaffUseCase > workforce C2 answers team not found for a tea` | pass |
| C2 | `run api / ✓ update-staff.use-case.spec.ts > UpdateStaffUseCase > workforce C2 keeps its own name and email` | pass |
| C2 | `run api / ✓ update-staff.use-case.spec.ts > UpdateStaffUseCase > workforce C2 refuses the email of another sta` | pass |
| C2 | `run api / ✓ staff.http.spec.ts > POST /staff > workforce C2 answers 400 for out of bounds fields and 409 for a` | pass |
| C2 | `run smoke / ok   workforce C2 staff name in another case (409)` | pass |
| C2 | `run smoke / ok   workforce C2 staff email in another case (409)` | pass |
| C2 | `run smoke / ok   workforce C2 same staff name in another organization (201)` | pass |
| C2 | `run api / ✓ update-staff.use-case.spec.ts > UpdateStaffUseCase > workforce C2 refuses the name of another staf` | pass |
| C3 | `run api / ✓ fetch-staff.use-case.spec.ts > FetchStaffUseCase > workforce C3 returns the staff of the organizat` | pass |
| C3 | `run api / ✓ get-staff-by-id.use-case.spec.ts > GetStaffByIdUseCase > workforce C3 answers staff not found for ` | pass |
| C3 | `run api / ✓ staff.http.spec.ts > GET /staff > workforce C3 answers the staff by name to every role and 401 wit` | pass |
| C3 | `run api / ✓ staff.http.spec.ts > GET /staff/:id > workforce C3 answers the staff and 404 for another organizat` | pass |
| C3 | `run api / ✓ staff.repository.spec.ts > PrismaStaffRepository > workforce C3 reads the staff of the organizatio` | pass |
| C4 | `run api / ✓ update-staff.use-case.spec.ts > UpdateStaffUseCase > workforce C4 replaces every field` | pass |
| C4 | `run api / ✓ staff.http.spec.ts > PUT /staff/:id > workforce C4 answers 200 with the new values and 404 for ano` | pass |
| C4 | `run smoke / ok   workforce C4 staff edit reads back (Mecânica naval/team)` | pass |
| C5 | `run api / ✓ delete-staff.use-case.spec.ts > DeleteStaffUseCase > workforce C5 removes a staff with no assignme` | pass |
| C5 | `run api / ✓ delete-staff.use-case.spec.ts > DeleteStaffUseCase > workforce C5 refuses a staff an assignment na` | pass |
| C5 | `run api / ✓ staff.http.spec.ts > DELETE /staff/:id > workforce C5 answers 204, 409 and 404` | pass |
| C5 | `run smoke / ok   workforce C5 staff with assignment answers 409 (409)` | pass |
| C5 | `run smoke / ok   workforce C5 staff without assignment answers 204 (204)` | pass |
| C6 | `run api / ✓ create-team.use-case.spec.ts > CreateTeamUseCase > workforce C6 stores a team trimmed` | pass |
| C6 | `run api / ✓ create-team.use-case.spec.ts > CreateTeamUseCase > workforce C6 refuses a name used in the organiz` | pass |
| C6 | `run api / ✓ update-team.use-case.spec.ts > UpdateTeamUseCase > workforce C6 replaces the team and refuses anot` | pass |
| C6 | `run api / ✓ fetch-teams.use-case.spec.ts > FetchTeamsUseCase > workforce C6 returns the teams by name with the` | pass |
| C6 | `run api / ✓ team.http.spec.ts > POST /teams > workforce C6 answers 201, 400 and 409` | pass |
| C6 | `run api / ✓ team.http.spec.ts > GET /teams > workforce C6 answers the teams with staffCount and 401 without a ` | pass |
| C6 | `run api / ✓ team.http.spec.ts > PUT /teams/:id > workforce C6 answers 200 and 404 for another organization` | pass |
| C6 | `run api / ✓ team.repository.spec.ts > PrismaTeamsRepository > workforce C6 reads the teams with their staff co` | pass |
| C6 | `run smoke / ok   workforce C6 team name in another case (409)` | pass |
| C6 | `run smoke / ok   workforce C6 team staffCount (2)` | pass |
| C7 | `run api / ✓ delete-team.use-case.spec.ts > DeleteTeamUseCase > workforce C7 removes a team with no assignment` | pass |
| C7 | `run api / ✓ delete-team.use-case.spec.ts > DeleteTeamUseCase > workforce C7 refuses a team an assignment names` | pass |
| C7 | `run api / ✓ team.http.spec.ts > DELETE /teams/:id > workforce C7 answers 204, 409 and 404` | pass |
| C7 | `run smoke / ok   workforce C7 team members left with no team (null/null)` | pass |
| C7 | `run smoke / ok   workforce C7 team responsible for a completed service answers 409 (409)` | pass |
| C8 | `run api / ✓ staff.http.spec.ts > staff writes > workforce C8 answers 403 to an operator and an inspector on ev` | pass |
| C8 | `run api / ✓ team.http.spec.ts > team writes > workforce C8 answers 403 to an operator and an inspector on ever` | pass |
| C8 | `run api / ✓ layout.spec.ts > acme layout > workforce C8 every write handler of workforce declares the administ` | pass |
| C9 | `run web / ✓ internal-layout.spec.ts > InternalLayout > workforce C9 lists Equipe técnica after Agenda and name` | pass |
| C9 | `run web / ✓ staff-list.spec.ts > StaffList > workforce C9 requests staff, teams, assignments and work orders o` | pass |
| C9 | `browser - open /staff at 1440x1000 as an administrator, save captures/staff-list.running.png` | pass |
| C10 | `run web / ✓ staff-filters.spec.ts > staffMetrics > workforce C10 counts staff, teams and available staff padde` | pass |
| C10 | `run web / ✓ staff-list.spec.ts > StaffList > workforce C10 shows the three metrics whatever the filters` | pass |
| C11 | `run web / ✓ staff-list.spec.ts > StaffList > workforce C11 shows each professional by name with sem equipe for` | pass |
| C11 | `run web / ✓ staff-filters.spec.ts > sortStaff > workforce C11 orders by name in pt-BR` | pass |
| C12 | `run web / ✓ staff-filters.spec.ts > filterStaff > workforce C12 combines the search, the team and the specialt` | pass |
| C12 | `run web / ✓ staff-filters.spec.ts > specialtyChips > workforce C12 counts each specialty in pt-BR order` | pass |
| C12 | `run web / ✓ staff-list.spec.ts > StaffList > workforce C12 filters by chip, team and search and shows both emp` | pass |
| C12 | `browser - pick the chip "Mecânico naval", save captures/staff-list-filtered.running.png` | pass |
| C12 | `browser - search "zzz", save captures/staff-list-empty.running.png` | pass |
| C13 | `run web / ✓ staff-csv.spec.ts > staffCsv > workforce C13 writes the header and one line per staff with sem equ` | pass |
| C13 | `run web / ✓ staff-list.spec.ts > StaffList > workforce C13 exports the selected professionals and labels the b` | pass |
| C14 | `run web / ✓ staff-list.spec.ts > StaffList > workforce C14 creates a professional from the drawer and toasts i` | pass |
| C14 | `run web / ✓ staff-list.spec.ts > StaffList > workforce C14 keeps the drawer open on a 409` | pass |
| C14 | `run web / ✓ staff-form.spec.ts > StaffForm > workforce C14 lays the drawer as the standard with sem equipe fir` | pass |
| C14 | `browser - use "Cadastrar profissional", save captures/staff-drawer.running.png` | pass |
| C15 | `run web / ✓ staff-list.spec.ts > StaffList > workforce C15 edits a professional from the row menu with its sto` | pass |
| C15 | `run web / ✓ staff-list.spec.ts > StaffList > workforce C15 deletes after the confirmation and keeps the row on` | pass |
| C16 | `run web / ✓ staff-list.spec.ts > StaffList > workforce C16 lists the teams in the equipes tab and keeps the ta` | pass |
| C17 | `run web / ✓ staff-list.spec.ts > StaffList > workforce C17 creates and edits a team from its drawer` | pass |
| C17 | `run web / ✓ staff-list.spec.ts > StaffList > workforce C17 warns how many professionals lose the team before d` | pass |
| C18 | `run web / ✓ staff-list.inspector.spec.ts > StaffList as a reader > workforce C18 shows no write control to an ` | pass |
| C19 | `run api / ✓ create-work-order.use-case.spec.ts > CreateWorkOrderUseCase > workforce C19 assigns the staff and ` | pass |
| C19 | `run api / ✓ work-order.http.spec.ts > POST /work-orders > workforce C19 answers 201 and assigns the services` | pass |
| C19 | `run api / ✓ fetch-assignments.use-case.spec.ts > FetchAssignmentsUseCase > workforce C19 returns every assignm` | pass |
| C19 | `run api / ✓ assignment.http.spec.ts > GET /assignments > workforce C19 answers the assignments and 401 without` | pass |
| C19 | `run api / ✓ assignment.repository.spec.ts > PrismaAssignmentsRepository > workforce C19 writes one assignment ` | pass |
| C19 | `run smoke / ok   workforce C19 assignment stored with the work order (staff/team)` | pass |
| C20 | `run api / ✓ create-work-order.use-case.spec.ts > CreateWorkOrderUseCase > workforce C20 stores nothing for a s` | pass |
| C20 | `run api / ✓ create-work-order.use-case.spec.ts > CreateWorkOrderUseCase > workforce C20 stores nothing for an ` | pass |
| C20 | `run api / ✓ work-order.http.spec.ts > POST /work-orders > workforce C20 answers 400 for both ids, 404 for an u` | pass |
| C20 | `run smoke / ok   workforce C20 unknown staff answers 404 (404)` | pass |
| C20 | `run smoke / ok   workforce C20 unknown staff stores no work order (same)` | pass |
| C21 | `run api / ✓ work-order.http.spec.ts > POST /work-orders > workforce C21 answers 403 to an operator sending an ` | pass |
| C21 | `run api / ✓ work-order.http.spec.ts > PUT /work-orders/:id > workforce C21 answers 403 to an operator sending ` | pass |
| C21 | `run api / ✓ work-order-service.http.spec.ts > POST /work-orders/:workOrderId/services > workforce C21 answers ` | pass |
| C21 | `run smoke / ok   workforce C21 operator assignee answers 403 (403)` | pass |
| C22 | `run api / ✓ edit-work-order.use-case.spec.ts > EditWorkOrderUseCase > workforce C22 replaces, clears and keeps` | pass |
| C22 | `run api / ✓ edit-work-order.use-case.spec.ts > EditWorkOrderUseCase > workforce C22 keeps the same assignee an` | pass |
| C22 | `run api / ✓ edit-work-order.use-case.spec.ts > EditWorkOrderUseCase > workforce C22 changes nothing when a can` | pass |
| C22 | `run api / ✓ edit-work-order.use-case.spec.ts > EditWorkOrderUseCase > workforce C22 answers service not found ` | pass |
| C22 | `run api / ✓ work-order.http.spec.ts > PUT /work-orders/:id > workforce C22 answers 200, 400, 404 and 409` | pass |
| C22 | `run smoke / ok   workforce C22 assignee replaced by a team (team)` | pass |
| C22 | `run smoke / ok   workforce C22 assignee cleared (0)` | pass |
| C23 | `run api / ✓ create-work-order-service.use-case.spec.ts > CreateWorkOrderServiceUseCase > workforce C23 assigns` | pass |
| C23 | `run api / ✓ create-work-order-service.use-case.spec.ts > CreateWorkOrderServiceUseCase > workforce C23 stores ` | pass |
| C23 | `run api / ✓ work-order-service.http.spec.ts > POST /work-orders/:workOrderId/services > workforce C23 answers ` | pass |
| C24 | `run api / ✓ delete-work-order.use-case.spec.ts > DeleteWorkOrderUseCase > workforce C24 removes the assignment` | pass |
| C24 | `run api / ✓ delete-work-order.use-case.spec.ts > DeleteWorkOrderUseCase > workforce C24 keeps the assignments ` | pass |
| C24 | `run api / ✓ delete-work-order-service.use-case.spec.ts > DeleteWorkOrderServiceUseCase > workforce C24 removes` | pass |
| C24 | `run smoke / ok   workforce C24 assignments gone with the service (0)` | pass |
| C24 | `run smoke / ok   workforce C24 assignments gone with the work order (0)` | pass |
| C24 | `run api / ✓ delete-work-order-service.use-case.spec.ts > DeleteWorkOrderServiceUseCase > workforce C24 keeps t` | pass |
| C25 | `run web / ✓ work-order-drawer.spec.ts > WorkOrderDrawer > workforce C25 sends the responsável of each service ` | pass |
| C25 | `run web / ✓ work-order-drawer.spec.ts > WorkOrderDrawer > workforce C25 shows no responsável to an operator` | pass |
| C25 | `run web / ✓ vessel-detail.spec.ts > VesselDetail > workforce C25 Nova ordem on the Vessel detail sends the res` | pass |
| C26 | `run web / ✓ work-order-drawer.spec.ts > WorkOrderDrawer > workforce C26 edits the responsável of each service ` | pass |
| C26 | `run web / ✓ work-order-drawer.spec.ts > WorkOrderDrawer > workforce C26 shows no services to an operator editi` | pass |
| C27 | `run web / ✓ work-order-service-form.spec.ts > WorkOrderServiceForm > workforce C27 sends the responsável chose` | pass |
| C27 | `run web / ✓ appointment-form.spec.ts > AppointmentForm > workforce C27 sends the responsável chosen by an admi` | pass |
| C27 | `run web / ✓ agenda.spec.ts > Agenda > workforce C27 Adicionar à agenda sends the responsável as staffId or tea` | pass |
| C27 | `run web / ✓ agenda.spec.ts > Agenda > workforce C27 Adicionar à agenda shows no responsável to an operator` | pass |
| C27 | `run web / ✓ work-order-detail.spec.ts > WorkOrderDetail > workforce C27 Novo serviço on the detail sends the r` | pass |
| C27 | `run web / ✓ work-order-detail.spec.ts > WorkOrderDetail > workforce C27 Novo serviço on the detail shows no re` | pass |
| C28 | `run web / ✓ work-order-detail.spec.ts > WorkOrderDetail > workforce C28 shows the responsável of each service` | pass |
| C28 | `run web / ✓ work-order-detail.inspector.spec.ts > WorkOrderDetail as an inspector > workforce C28 shows the re` | pass |
| C29 | `run web / ✓ staff-status.spec.ts > staffStatus > workforce C29 derives em serviço from its own or its team's s` | pass |
| C30 | `run web / ✓ staff-status.spec.ts > teamStatus > workforce C30 derives em serviço from its own service in progr` | pass |
| C31 | `run web / ✓ staff-detail.spec.ts > StaffDetail > workforce C31 shows the profile with its team, status and con` | pass |
| C31 | `browser - open /staff/:id of a professional in service at 1440x1000, save captures/staff-detail.running.png` | pass |
| C32 | `run web / ✓ staff-allocations.spec.ts > openAllocations > workforce C32 lists the open services of the staff a` | pass |
| C32 | `run web / ✓ staff-detail.spec.ts > StaffDetail > workforce C32 lists the allocations and opens their work orde` | pass |
| C33 | `run web / ✓ staff-detail.spec.ts > StaffDetail > workforce C33 shows profissional não encontrado on a 404` | pass |
| C33 | `browser - open /staff/00000000-0000-4000-8000-000000000000, save captures/staff-detail-not-found.running.png` | pass |
| C34 | `walk - open /staff, /staff?tab=equipes and /staff/:id at each width and read scrollWidth against innerWidth` | pass (Walked) |
| C35 | `run web / ✓ staff-list.spec.ts > StaffList > workforce C35 shows skeletons while loading and toasts a failure` | pass |
| C35 | `run web / ✓ staff-list.spec.ts > StaffList > workforce C35 toasts the known API message of a failed read` | pass |
| C35 | `run web / ✓ staff-detail.spec.ts > StaffDetail > workforce C35 shows a skeleton while loading and toasts a fai` | pass |
| C36 | `run api / ✓ docs.spec.ts > documents follow the acme platform > workforce C36 the documents describe the workf` | pass |
| C37 | `bash api/test/db/migration-check.sh workforce` | pass |
| C37 | `bash api/test/db/migration-check.sh drift` | pass |
| C38 | `run api / ✓ staff.repository.spec.ts > PrismaStaffRepository > workforce C38 turns a unique violation into Alr` | pass |
| C38 | `run smoke / ok   workforce C38 concurrent staff creates store one (1)` | pass |
| C38 | `run smoke / ok   workforce C38 concurrent staff creates answer 201 and 409` | pass |
| C38 | `run smoke / ok   workforce C38 concurrent loser message (Staff name already exists)` | pass |
| C39 | `run api / ✓ layout.spec.ts > acme layout > workforce C39 keeps workforce free of other contexts and work-order` | pass |
| C40 | `run api / ✓ create-work-order.use-case.spec.ts > CreateWorkOrderUseCase > workforce C40 validates every assign` | pass |
| C41 | `run web / ✓ work-order-drawer.spec.ts > WorkOrderDrawer > workforce C41 edits without services while the assig` | pass |
| C41 | `run web / ✓ work-order-detail.spec.ts > WorkOrderDetail > workforce C41 shows no responsável until the workfor` | pass |
| C41 | `run web / ✓ work-order-detail.spec.ts > WorkOrderDetail > workforce C41 edits the responsável from the detail ` | pass |
| C41 | `run web / ✓ work-order-detail.spec.ts > WorkOrderDetail > workforce C41 shows no responsável and edits no serv` | pass |
| C41 | `run web / ✓ work-order-drawer.spec.ts > WorkOrderDrawer > workforce C41 edits without services while the teams` | pass |
| Build | `cd api && npm run lint` | pass |
| Build | `cd api && npm run build` | pass |
| Build | `cd web && npm run build` | pass |

## Output

`Run api` - exit 0

```
 ✓ src/package/identity/auth/__test__/authenticate-user.use-case.spec.ts > AuthenticateUserUseCase > [C15] throws WrongCredentialsException for an unknown email 2ms
 ✓ src/package/identity/auth/__test__/authenticate-user.use-case.spec.ts > AuthenticateUserUseCase > [C15] throws WrongCredentialsException for a wrong password 0ms
 ✓ src/package/identity/auth/__test__/authenticate-user.use-case.spec.ts > AuthenticateUserUseCase > [C15] returns an access token encrypted from { sub: user id } 0ms
 ✓ src/package/workforce/staff/__test__/get-staff-by-id.use-case.spec.ts > GetStaffByIdUseCase > workforce C3 answers staff not found for another organization 3ms
 ✓ src/package/customer/__test__/customer.facade.spec.ts > CustomerFacade > [C40] returns plain vessel data for a Vessel of the Organization 1ms
 ✓ src/package/customer/__test__/customer.facade.spec.ts > CustomerFacade > [C40] returns null for an unknown id and for a Vessel of another Organization 0ms
 ✓ src/package/customer/vessel/__test__/vessel.repository.spec.ts > PrismaVesselsRepository > customer-ui C35 asks for every vessel when no page is given 2ms

 Test Files  98 passed (98)
      Tests  376 passed (376)
   Start at  07:51:08
   Duration  2.66s (transform 6.58s, setup 0ms, import 30.88s, tests 3.05s, environment 10ms)

[Nest] 1365006  - 18/11/2026, 07:51:08   ERROR [identity] {"operation":"invitation_enqueue_failed","organizationId":"dest","invitationId":"9f7bb100-c29d-4a57-9aaf-a5a615545f21","message":"redis down"}
[Nest] 1365267  - 18/11/2026, 07:51:09   ERROR [identity] {"operation":"invitation_enqueue_failed","organizationId":"organization","invitationId":"000774f9-6e2f-414f-98d5-23142a8148de","message":"redis down"}
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

`Run web` - exit 0

```
 ✓  web  src/package/work-order/agenda/__test__/agenda.spec.ts > Agenda > work-order-ui C69 shows no team, availability, tide or demo text 28ms
 ✓  web  src/package/work-order/work-order/__test__/work-order-list.spec.ts > WorkOrderList > work-order-ui C13 exports the selected work orders, hidden ones included 43ms
 ✓  web  src/package/work-order/work-order/__test__/work-order-list.spec.ts > WorkOrderList > work-order-ui C14 the row menu opens the detail and deletes after confirmation 70ms
 ✓  web  src/package/work-order/work-order/__test__/work-order-list.spec.ts > WorkOrderList > work-order-ui C14 a 409 on delete keeps the row and shows the API message 42ms
 ✓  web  src/package/work-order/agenda/__test__/agenda.spec.ts > Agenda > work-order-ui C70 shows skeletons while loading and a toast when a request fails 61ms
 ✓  web  src/package/work-order/agenda/__test__/agenda.spec.ts > Agenda > drawer-standard D12 Adicionar à agenda opens with the Serviço and Planejamento cards and posts once 92ms
 ✓  web  src/package/work-order/work-order/__test__/work-order-drawer.spec.ts > WorkOrderDrawer > workforce C26 edits the responsável of each service and limits closed ones 89ms
 ✓  web  src/package/work-order/work-order/__test__/work-order-drawer.spec.ts > WorkOrderDrawer > workforce C41 edits without services while the assignments are not loaded and toasts a failure 87ms
 ✓  web  src/package/work-order/work-order/__test__/work-order-drawer.spec.ts > WorkOrderDrawer > workforce C41 edits without services while the teams read is pending 68ms
 ✓  web  src/package/work-order/work-order/__test__/work-order-drawer.spec.ts > WorkOrderDrawer > workforce C26 shows no services to an operator editing 49ms

 Test Files  59 passed (59)
      Tests  363 passed (363)
   Start at  07:51:33
   Duration  5.13s (transform 5.35s, setup 6.55s, import 15.01s, tests 45.66s, environment 36.51s)
```

`bash api/test/db/migration-check.sh workforce` - exit 0

```
ok workforce
```

`bash api/test/db/migration-check.sh drift` - exit 0

```
ok drift
```
