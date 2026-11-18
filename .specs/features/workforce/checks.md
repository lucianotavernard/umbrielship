# Workforce: Staff, Team and Assignment checks

Build: `cd api && npm run lint`; `cd api && npm run build`; `cd web && npm run build`
Run api: `cd api && npx vitest run --reporter=verbose src/package/workforce src/package/work-order test`
Run smoke: `bash api/test/smoke/api-smoke.sh`
Run web: `cd web && npx ng test --watch=false --reporters=verbose`
Plan: `.specs/features/workforce/plan.md`

41 checks in 4 slices (C41 appended from the Verifier) · 4 one-way doors · 0 open, of which 0 block

## Checks

### S1 - The administrator keeps the professionals and the teams

**C1** - An `administrator`'s `POST /staff` with name, specialty, email, phone and no team answers 201 `{ staff: { id, name, specialty, email, phone, teamId } }` with name, specialty and phone trimmed, the email trimmed and lower-cased and `teamId` null; with a `teamId` of the Organization it is stored with that team (AC 1)
Proof: run api | ✓ create-staff.use-case.spec.ts > CreateStaffUseCase > workforce C1 stores a staff trimmed with the email lower-cased and no team
Proof: run api | ✓ create-staff.use-case.spec.ts > CreateStaffUseCase > workforce C1 stores the team of the organization
Proof: run api | ✓ staff.http.spec.ts > POST /staff > workforce C1 answers 201 with the staff
Proof: run api | ✓ staff.repository.spec.ts > PrismaStaffRepository > workforce C1 writes every field of the staff
Proof: run smoke | ok   workforce C1 staff stored trimmed and lower-cased

**C2** - A Staff name or email used in the Organization, compared without case after trimming, answers 409 `Staff name already exists` / `Staff email already exists` on create and edit and stores nothing; the same name in another Organization is accepted; an edit keeping its own name and email answers 200; a `teamId` of another Organization or none answers 404 `Team not found`; name over 120, specialty over 100, phone over 30 or an invalid email answers 400 (AC 2)
Proof: run api | ✓ create-staff.use-case.spec.ts > CreateStaffUseCase > workforce C2 refuses a name used in the organization in another case
Proof: run api | ✓ create-staff.use-case.spec.ts > CreateStaffUseCase > workforce C2 refuses an email used in the organization in another case
Proof: run api | ✓ create-staff.use-case.spec.ts > CreateStaffUseCase > workforce C2 accepts the same name in another organization
Proof: run api | ✓ create-staff.use-case.spec.ts > CreateStaffUseCase > workforce C2 answers team not found for a team of another organization
Proof: run api | ✓ update-staff.use-case.spec.ts > UpdateStaffUseCase > workforce C2 keeps its own name and email
Proof: run api | ✓ update-staff.use-case.spec.ts > UpdateStaffUseCase > workforce C2 refuses the email of another staff
Proof: run api | ✓ staff.http.spec.ts > POST /staff > workforce C2 answers 400 for out of bounds fields and 409 for a used name
Proof: run smoke | ok   workforce C2 staff name in another case (409)
Proof: run smoke | ok   workforce C2 staff email in another case (409)
Proof: run smoke | ok   workforce C2 same staff name in another organization (201)
Proof: run api | ✓ update-staff.use-case.spec.ts > UpdateStaffUseCase > workforce C2 refuses the name of another staff on edit

**C3** - `GET /staff` answers every Staff of the caller's Organization ordered by name and none of another; `GET /staff/:id` answers `{ staff }`, or 404 `Staff not found` for another Organization's or none; no token answers 401 (AC 3)
Proof: run api | ✓ fetch-staff.use-case.spec.ts > FetchStaffUseCase > workforce C3 returns the staff of the organization by name
Proof: run api | ✓ get-staff-by-id.use-case.spec.ts > GetStaffByIdUseCase > workforce C3 answers staff not found for another organization
Proof: run api | ✓ staff.http.spec.ts > GET /staff > workforce C3 answers the staff by name to every role and 401 without a token
Proof: run api | ✓ staff.http.spec.ts > GET /staff/:id > workforce C3 answers the staff and 404 for another organization
Proof: run api | ✓ staff.repository.spec.ts > PrismaStaffRepository > workforce C3 reads the staff of the organization ordered by name

**C4** - An `administrator`'s `PUT /staff/:id` with the `POST` body answers 200 with the new values, team included, and `GET /staff/:id` then reads them; another Organization's id answers 404 (AC 4)
Proof: run api | ✓ update-staff.use-case.spec.ts > UpdateStaffUseCase > workforce C4 replaces every field
Proof: run api | ✓ staff.http.spec.ts > PUT /staff/:id > workforce C4 answers 200 with the new values and 404 for another organization
Proof: run smoke | ok   workforce C4 staff edit reads back (Mecânica naval/team)

**C5** - `DELETE /staff/:id` answers 204 and removes a Staff no Assignment names; a Staff an Assignment names answers 409 `Staff has Assignment` and stays (AC 5)
Proof: run api | ✓ delete-staff.use-case.spec.ts > DeleteStaffUseCase > workforce C5 removes a staff with no assignment
Proof: run api | ✓ delete-staff.use-case.spec.ts > DeleteStaffUseCase > workforce C5 refuses a staff an assignment names
Proof: run api | ✓ staff.http.spec.ts > DELETE /staff/:id > workforce C5 answers 204, 409 and 404
Proof: run smoke | ok   workforce C5 staff with assignment answers 409 (409)
Proof: run smoke | ok   workforce C5 staff without assignment answers 204 (204)

**C6** - An `administrator`'s `POST /teams` with name (1 to 120) and specialty (1 to 100) answers 201 `{ team: { id, name, specialty } }`; a name used in the Organization, compared without case, answers 409 `Team name already exists` on create and edit; `GET /teams` answers `{ teams: [{ id, name, specialty, staffCount }] }` by name; another Organization's Team answers 404 `Team not found` (AC 6)
Proof: run api | ✓ create-team.use-case.spec.ts > CreateTeamUseCase > workforce C6 stores a team trimmed
Proof: run api | ✓ create-team.use-case.spec.ts > CreateTeamUseCase > workforce C6 refuses a name used in the organization in another case
Proof: run api | ✓ update-team.use-case.spec.ts > UpdateTeamUseCase > workforce C6 replaces the team and refuses another team name
Proof: run api | ✓ fetch-teams.use-case.spec.ts > FetchTeamsUseCase > workforce C6 returns the teams by name with their staff count
Proof: run api | ✓ team.http.spec.ts > POST /teams > workforce C6 answers 201, 400 and 409
Proof: run api | ✓ team.http.spec.ts > GET /teams > workforce C6 answers the teams with staffCount and 401 without a token
Proof: run api | ✓ team.http.spec.ts > PUT /teams/:id > workforce C6 answers 200 and 404 for another organization
Proof: run api | ✓ team.repository.spec.ts > PrismaTeamsRepository > workforce C6 reads the teams with their staff count
Proof: run smoke | ok   workforce C6 team name in another case (409)
Proof: run smoke | ok   workforce C6 team staffCount (2)

**C7** - `DELETE /teams/:id` for a Team no Assignment names answers 204 and leaves each of its Staff with `teamId` null; a Team an Assignment names (a `COMPLETED` service included) answers 409 `Team has Assignment` and nothing changes (AC 7)
Proof: run api | ✓ delete-team.use-case.spec.ts > DeleteTeamUseCase > workforce C7 removes a team with no assignment
Proof: run api | ✓ delete-team.use-case.spec.ts > DeleteTeamUseCase > workforce C7 refuses a team an assignment names
Proof: run api | ✓ team.http.spec.ts > DELETE /teams/:id > workforce C7 answers 204, 409 and 404
Proof: run smoke | ok   workforce C7 team members left with no team (null/null)
Proof: run smoke | ok   workforce C7 team responsible for a completed service answers 409 (409)

**C8** - An `operator`'s or `inspector`'s `POST`, `PUT` or `DELETE` on `/staff` and `/teams` answers 403 and stores nothing (AC 8)
Proof: run api | ✓ staff.http.spec.ts > staff writes > workforce C8 answers 403 to an operator and an inspector on every write
Proof: run api | ✓ team.http.spec.ts > team writes > workforce C8 answers 403 to an operator and an inspector on every write
Proof: run api | ✓ layout.spec.ts > acme layout > workforce C8 every write handler of workforce declares the administrator role

**C9** - "Equipe técnica" in the sidebar after "Agenda" opens `/staff` with the topbar "Operação > Equipe técnica", requests `GET /api/staff`, `/api/teams`, `/api/assignments` and `/api/work-orders` once each, and the tab "Profissionais" matches `.specs/features/workforce/captures/staff-list.png` (`.specs/features/workforce/captures/staff-list.aria.yml`) except `## Differences from the source` (AC 9)
Proof: run web | ✓ internal-layout.spec.ts > InternalLayout > workforce C9 lists Equipe técnica after Agenda and names it in the topbar
Proof: run web | ✓ staff-list.spec.ts > StaffList > workforce C9 requests staff, teams, assignments and work orders once
Proof: browser - open `/staff` at 1440x1000 as an administrator, save `captures/staff-list.running.png`

**C10** - The metrics read "Profissionais cadastrados", "Equipes cadastradas" with the note "equipes" and "Disponíveis agora", padded to two digits, over every Staff and Team (AC 10)
Proof: run web | ✓ staff-filters.spec.ts > staffMetrics > workforce C10 counts staff, teams and available staff padded to two digits
Proof: run web | ✓ staff-list.spec.ts > StaffList > workforce C10 shows the three metrics whatever the filters

**C11** - The table shows each Staff's initials, its name linking to `/staff/:id`, specialty, team name or "Sem equipe", email, phone and status, ordered by name in `pt-BR`, with "Exibindo <n> de <total> profissionais" (AC 11)
Proof: run web | ✓ staff-list.spec.ts > StaffList > workforce C11 shows each professional by name with sem equipe for none and the range
Proof: run web | ✓ staff-filters.spec.ts > sortStaff > workforce C11 orders by name in pt-BR

**C12** - Search, team filter ("Todas as equipes", each Team, "Sem equipe" last) and specialty chips ("Todas <total>", each specialty with its count in `pt-BR` order) combine, a chip picked as `.specs/features/workforce/captures/staff-list-filtered.png`; nothing matching reads "Nenhum profissional encontrado com esses filtros." as `.specs/features/workforce/captures/staff-list-empty.png`; no Staff reads "Ainda não há profissionais cadastrados." (AC 12)
Proof: run web | ✓ staff-filters.spec.ts > filterStaff > workforce C12 combines the search, the team and the specialty
Proof: run web | ✓ staff-filters.spec.ts > specialtyChips > workforce C12 counts each specialty in pt-BR order
Proof: run web | ✓ staff-list.spec.ts > StaffList > workforce C12 filters by chip, team and search and shows both empty sentences
Proof: browser - pick the chip "Mecânico naval", save `captures/staff-list-filtered.running.png`
Proof: browser - search "zzz", save `captures/staff-list-empty.running.png`

**C13** - Selecting rows enables "Exportar (<n>)", which downloads `equipe-tecnica.csv` with `Nome,Especialidade,Equipe,E-mail,Telefone,Status` and one line per selected Staff ("Sem equipe" for none); it is disabled with none and labelled by the count; "Selecionar todos os profissionais visíveis" selects or clears the rows shown (AC 13)
Proof: run web | ✓ staff-csv.spec.ts > staffCsv > workforce C13 writes the header and one line per staff with sem equipe
Proof: run web | ✓ staff-list.spec.ts > StaffList > workforce C13 exports the selected professionals and labels the button by the count

**C14** - An administrator's "Cadastrar profissional" opens "Novo profissional" with the fields of `.specs/features/workforce/captures/staff-drawer.png` (`.specs/features/workforce/captures/staff-drawer.aria.yml`) in the drawer standard, "Equipe" starting at "Sem equipe"; "Criar profissional" posts, closes, toasts "<nome> foi adicionado à equipe técnica." and shows the row; a 409 toasts "Erro ao cadastrar profissional" and keeps the drawer (AC 14)
Proof: run web | ✓ staff-list.spec.ts > StaffList > workforce C14 creates a professional from the drawer and toasts its name
Proof: run web | ✓ staff-list.spec.ts > StaffList > workforce C14 keeps the drawer open on a 409
Proof: run web | ✓ staff-form.spec.ts > StaffForm > workforce C14 lays the drawer as the standard with sem equipe first
Proof: browser - use "Cadastrar profissional", save `captures/staff-drawer.running.png`

**C15** - "Ações para <nome>" offers "Ver perfil" and, for an administrator, "Editar" (filled drawer, "Salvar alterações", `PUT`, toast "Profissional atualizado com sucesso") and "Excluir" (confirmation "Excluir profissional", `DELETE`, toast "Profissional excluído com sucesso"; a 409 toasts "Erro ao excluir profissional" and keeps the row) (AC 15)
Proof: run web | ✓ staff-list.spec.ts > StaffList > workforce C15 edits a professional from the row menu with its stored values
Proof: run web | ✓ staff-list.spec.ts > StaffList > workforce C15 deletes after the confirmation and keeps the row on a 409

**C16** - The tab "Equipes" lists the Teams by name with "Nome", "Especialidade", "Profissionais" and "Status", reads "Ainda não há equipes cadastradas." when empty, and survives a reload as `/staff?tab=equipes` (AC 16)
Proof: run web | ✓ staff-list.spec.ts > StaffList > workforce C16 lists the teams in the equipes tab and keeps the tab in the url

**C17** - "Nova equipe" opens its drawer and "Criar equipe" posts (toast "Equipe criada com sucesso"); "Ações para <equipe>" edits ("Salvar alterações", toast "Equipe atualizada com sucesso") and deletes after "Excluir equipe", whose text says how many professionals will be left with no team; a 409 toasts "Erro ao excluir equipe" (AC 17)
Proof: run web | ✓ staff-list.spec.ts > StaffList > workforce C17 creates and edits a team from its drawer
Proof: run web | ✓ staff-list.spec.ts > StaffList > workforce C17 warns how many professionals lose the team before deleting it

**C18** - An operator or inspector sees no "Cadastrar profissional", "Nova equipe", "Editar" or "Excluir"; "Ver perfil", the filters and "Exportar" stay (AC 18)
Proof: run web | ✓ staff-list.inspector.spec.ts > StaffList as a reader > workforce C18 shows no write control to an operator or an inspector

### S2 - A WorkOrderService gets its Responsável

**C19** - An `administrator`'s `POST /work-orders` with a service carrying `staffId` or `teamId` of the Organization answers 201 and stores one Assignment for that service, listed by `GET /assignments` with the other id null (AC 19)
Proof: run api | ✓ create-work-order.use-case.spec.ts > CreateWorkOrderUseCase > workforce C19 assigns the staff and the team of each service
Proof: run api | ✓ work-order.http.spec.ts > POST /work-orders > workforce C19 answers 201 and assigns the services
Proof: run api | ✓ fetch-assignments.use-case.spec.ts > FetchAssignmentsUseCase > workforce C19 returns every assignment of the organization
Proof: run api | ✓ assignment.http.spec.ts > GET /assignments > workforce C19 answers the assignments and 401 without a token
Proof: run api | ✓ assignment.repository.spec.ts > PrismaAssignmentsRepository > workforce C19 writes one assignment per service
Proof: run smoke | ok   workforce C19 assignment stored with the work order (staff/team)

**C20** - A service item with both ids answers 400; an id of another Organization or none answers 404 `Staff not found` / `Team not found`; an assignee on a WorkOrder `COMPLETED` or `CANCELLED` or a service `COMPLETED` answers 409 `Work order service is not open`; in all three no WorkOrder, service or Assignment is stored (AC 20)
Proof: run api | ✓ create-work-order.use-case.spec.ts > CreateWorkOrderUseCase > workforce C20 stores nothing for a staff of another organization
Proof: run api | ✓ create-work-order.use-case.spec.ts > CreateWorkOrderUseCase > workforce C20 stores nothing for an assignee on a closed work order
Proof: run api | ✓ work-order.http.spec.ts > POST /work-orders > workforce C20 answers 400 for both ids, 404 for an unknown team and 409 on a cancelled work order
Proof: run smoke | ok   workforce C20 unknown staff answers 404 (404)
Proof: run smoke | ok   workforce C20 unknown staff stores no work order (same)

**C21** - An `operator` sending `staffId` or `teamId` on `POST /work-orders` or `POST /work-orders/:id/services`, or `services` on `PUT /work-orders/:id`, gets 403 and nothing is stored; without them its requests answer as today (AC 21)
Proof: run api | ✓ work-order.http.spec.ts > POST /work-orders > workforce C21 answers 403 to an operator sending an assignee and 201 without one
Proof: run api | ✓ work-order.http.spec.ts > PUT /work-orders/:id > workforce C21 answers 403 to an operator sending services
Proof: run api | ✓ work-order-service.http.spec.ts > POST /work-orders/:workOrderId/services > workforce C21 answers 403 to an operator sending an assignee
Proof: run smoke | ok   workforce C21 operator assignee answers 403 (403)

**C22** - `PUT /work-orders/:id` with `services: [{ id, staffId }]` or `[{ id, teamId }]` replaces that service's Assignment, `{ id }` removes it, unlisted services keep theirs, an id outside the WorkOrder answers 404 `Work order service not found`; a `COMPLETED` service keeps the same assignee (200), refuses another (409) and clears (200); a WorkOrder sent `CANCELLED` with a new assignee answers 409 and changes neither (AC 22)
Proof: run api | ✓ edit-work-order.use-case.spec.ts > EditWorkOrderUseCase > workforce C22 replaces, clears and keeps the assignees
Proof: run api | ✓ edit-work-order.use-case.spec.ts > EditWorkOrderUseCase > workforce C22 keeps the same assignee and refuses another on a completed service
Proof: run api | ✓ edit-work-order.use-case.spec.ts > EditWorkOrderUseCase > workforce C22 changes nothing when a cancelled work order gets a new assignee
Proof: run api | ✓ edit-work-order.use-case.spec.ts > EditWorkOrderUseCase > workforce C22 answers service not found for a service of another work order
Proof: run api | ✓ work-order.http.spec.ts > PUT /work-orders/:id > workforce C22 answers 200, 400, 404 and 409
Proof: run smoke | ok   workforce C22 assignee replaced by a team (team)
Proof: run smoke | ok   workforce C22 assignee cleared (0)

**C23** - An `administrator`'s `POST /work-orders/:id/services` with `staffId` or `teamId` stores the Assignment with the service, under C20's rules for the stored WorkOrder status and the service's status (AC 23)
Proof: run api | ✓ create-work-order-service.use-case.spec.ts > CreateWorkOrderServiceUseCase > workforce C23 assigns the new service
Proof: run api | ✓ create-work-order-service.use-case.spec.ts > CreateWorkOrderServiceUseCase > workforce C23 stores nothing for an assignee on a completed service
Proof: run api | ✓ work-order-service.http.spec.ts > POST /work-orders/:workOrderId/services > workforce C23 answers 201, 400, 404 and 409

**C24** - Deleting a WorkOrder or a WorkOrderService removes its Assignments, after which the Staff or Team can be deleted; a record with an Inspection answers 409 as today and its Assignments stay (AC 24)
Proof: run api | ✓ delete-work-order.use-case.spec.ts > DeleteWorkOrderUseCase > workforce C24 removes the assignments of the work order
Proof: run api | ✓ delete-work-order.use-case.spec.ts > DeleteWorkOrderUseCase > workforce C24 keeps the assignments when an inspection refuses the delete
Proof: run api | ✓ delete-work-order-service.use-case.spec.ts > DeleteWorkOrderServiceUseCase > workforce C24 removes the assignment of the service
Proof: run smoke | ok   workforce C24 assignments gone with the service (0)
Proof: run smoke | ok   workforce C24 assignments gone with the work order (0)
Proof: run api | ✓ delete-work-order-service.use-case.spec.ts > DeleteWorkOrderServiceUseCase > workforce C24 keeps the assignment when an inspection refuses the service delete

**C25** - For an `administrator` each service of "Serviços a realizar" in "Nova ordem de serviço" carries "Responsável" ("Sem responsável", the groups "Profissionais" and "Equipes", each "<nome> · <especialidade>") and saving sends `staffId` or `teamId`; an `operator` sees no such field (AC 25)
Proof: run web | ✓ work-order-drawer.spec.ts > WorkOrderDrawer > workforce C25 sends the responsável of each service chosen by an administrator
Proof: run web | ✓ work-order-drawer.spec.ts > WorkOrderDrawer > workforce C25 shows no responsável to an operator
Proof: run web | ✓ vessel-detail.spec.ts > VesselDetail > workforce C25 Nova ordem on the Vessel detail sends the responsável of an administrator and hides it from an operator

**C26** - "Editar" on a WorkOrder, for an `administrator`, lists its services with their names read only and "Responsável" set to the current Assignment; a `COMPLETED` service, or any service while "Status" reads "Concluído" or "Cancelado", offers only its current value and "Sem responsável"; saving sends `services` with every listed service; an `operator` sees no services (AC 26)
Proof: run web | ✓ work-order-drawer.spec.ts > WorkOrderDrawer > workforce C26 edits the responsável of each service and limits closed ones
Proof: run web | ✓ work-order-drawer.spec.ts > WorkOrderDrawer > workforce C26 shows no services to an operator editing

**C27** - For an `administrator` "Novo serviço" and "Adicionar à agenda" carry "Responsável" in their "Serviço" card, sent as `staffId` or `teamId` (AC 27)
Proof: run web | ✓ work-order-service-form.spec.ts > WorkOrderServiceForm > workforce C27 sends the responsável chosen by an administrator
Proof: run web | ✓ appointment-form.spec.ts > AppointmentForm > workforce C27 sends the responsável chosen by an administrator
Proof: run web | ✓ agenda.spec.ts > Agenda > workforce C27 Adicionar à agenda sends the responsável as staffId or teamId
Proof: run web | ✓ agenda.spec.ts > Agenda > workforce C27 Adicionar à agenda shows no responsável to an operator
Proof: run web | ✓ work-order-detail.spec.ts > WorkOrderDetail > workforce C27 Novo serviço on the detail sends the responsável chosen by an administrator
Proof: run web | ✓ work-order-detail.spec.ts > WorkOrderDetail > workforce C27 Novo serviço on the detail shows no responsável to an operator

### S3 - Everyone sees who works where

**C28** - The WorkOrder detail shows for each service "Responsável: <nome>", "Responsável: Equipe <nome>" or "Sem responsável", for every Role (AC 28)
Proof: run web | ✓ work-order-detail.spec.ts > WorkOrderDetail > workforce C28 shows the responsável of each service
Proof: run web | ✓ work-order-detail.inspector.spec.ts > WorkOrderDetail as an inspector > workforce C28 shows the responsável to an inspector

**C29** - A Staff reads "Em serviço" while its own Assignment or its Team's is on a WorkOrderService `IN_PROGRESS`, and "Disponível" otherwise (AC 29)
Proof: run web | ✓ staff-status.spec.ts > staffStatus > workforce C29 derives em serviço from its own or its team's service in progress

**C30** - A Team reads "Em serviço" while its own Assignment is on a WorkOrderService `IN_PROGRESS`, and "Disponível" otherwise; a member's Assignment does not count (AC 30)
Proof: run web | ✓ staff-status.spec.ts > teamStatus > workforce C30 derives em serviço from its own service in progress only

**C31** - `/staff/:id` matches `.specs/features/workforce/captures/staff-detail.png` (`.specs/features/workforce/captures/staff-detail.aria.yml`), with "Equipe vinculada" the team or "Sem equipe", "Situação atual" the status, the email a `mailto:` link and the phone a `tel:` link of its digits and "+" (AC 31)
Proof: run web | ✓ staff-detail.spec.ts > StaffDetail > workforce C31 shows the profile with its team, status and contact links
Proof: browser - open `/staff/:id` of a professional in service at 1440x1000, save `captures/staff-detail.running.png`

**C32** - "Alocação na oficina" lists the open WorkOrderServices assigned to the Staff or its Team, by start, each with service, `#` code, Vessel and "17/11/2026 09:00 – 18/11/2026 17:00", opening `/work-orders/:id`; none reads "Nenhuma alocação em serviços abertos." (AC 32)
Proof: run web | ✓ staff-allocations.spec.ts > openAllocations > workforce C32 lists the open services of the staff and its team by start
Proof: run web | ✓ staff-detail.spec.ts > StaffDetail > workforce C32 lists the allocations and opens their work order

**C33** - `/staff/:id` of another Organization's Staff or none shows "Profissional não encontrado", "Este cadastro não está disponível na equipe técnica." and "Voltar para a equipe" to `/staff`, as `.specs/features/workforce/captures/staff-detail-not-found.png` (AC 33)
Proof: run web | ✓ staff-detail.spec.ts > StaffDetail > workforce C33 shows profissional não encontrado on a 404
Proof: browser - open `/staff/00000000-0000-4000-8000-000000000000`, save `captures/staff-detail-not-found.running.png`

**C34** - At 640, 768, 1024, 1280 and 1536px `/staff` and `/staff/:id` have no horizontal page scroll (AC 34)
Proof: walk - open `/staff`, `/staff?tab=equipes` and `/staff/:id` at each width and read `scrollWidth` against `innerWidth`

**C35** - While a request loads the metrics and tables show skeletons; a failure toasts "Erro ao carregar a equipe técnica" with the API message or "Não foi possível carregar a equipe técnica." (AC 35)
Proof: run web | ✓ staff-list.spec.ts > StaffList > workforce C35 shows skeletons while loading and toasts a failure
Proof: run web | ✓ staff-list.spec.ts > StaffList > workforce C35 toasts the known API message of a failed read
Proof: run web | ✓ staff-detail.spec.ts > StaffDetail > workforce C35 shows a skeleton while loading and toasts a failure

### S4 - The documents say so

**C36** - `CONTEXT.md` defines Staff, Team and Assignment and names "InspectionAssignment" where it said "an assignment"; `AGENTS.md` lists the `workforce` context, its facade, `AppModule` composing `WorkforceModule`, `work-order` reading Staff and Team only through `WorkforceFacade`, `workforce` importing no context, the three tenant tables and the administrator-only writes; `ROADMAP.md` records the item as built (AC 36)
Proof: run api | ✓ docs.spec.ts > documents follow the acme platform > workforce C36 the documents describe the workforce as built

### Doors

**C37** - The migration creates `staff`, `teams` and `assignments` as Landing door 1 draws them: `citext` names and email unique per Organization, `staff.teamId` set null on delete, `assignments.staffId` and `teamId` restricted, one row per `workOrderServiceId`, exactly one of `staffId` and `teamId`, `organizationId` indexed, no foreign key on `workOrderId` or `workOrderServiceId`; and `schema.prisma` has no drift from the migrations (Landing 1)
Proof: `bash api/test/db/migration-check.sh workforce`
Proof: `bash api/test/db/migration-check.sh drift`

**C38** - Two `POST /staff` with the same name sent at once store one Staff and answer 409 to the other; a unique violation from the database becomes `AlreadyExistsDomainException` (Landing 1, concurrency)
Proof: run api | ✓ staff.repository.spec.ts > PrismaStaffRepository > workforce C38 turns a unique violation into AlreadyExistsDomainException
Proof: run smoke | ok   workforce C38 concurrent staff creates store one (1)
Proof: run smoke | ok   workforce C38 concurrent staff creates answer 201 and 409
Proof: run smoke | ok   workforce C38 concurrent loser message (Staff name already exists)

**C39** - `workforce` imports no other context; `work-order` reaches `workforce` only through `workforce.module.js` and `workforce.facade.js`; `WorkforceModule` exports only `WorkforceFacade`; `AppModule` composes it (Landing 3)
Proof: run api | ✓ layout.spec.ts > acme layout > workforce C39 keeps workforce free of other contexts and work-order away from its internals

**C40** - Every assignee is validated before anything is written: a WorkOrder create naming a Team of another Organization in its second service stores no WorkOrder, service or Assignment (Landing 2)
Proof: run api | ✓ create-work-order.use-case.spec.ts > CreateWorkOrderUseCase > workforce C40 validates every assignee before writing anything

**C41** - While `/api/assignments`, `/api/staff` or `/api/teams` has not answered, or has failed, the WorkOrder edit drawer (list and detail) lists no service and saves no `services`, the WorkOrder detail shows no "Responsável" line, and a failed read toasts "Erro ao carregar os responsáveis" with the API message or "Não foi possível carregar os responsáveis."; once they answer, the edit lists the services with their Responsável (appended from the Verifier, finding 1: an edit opened before the read cleared every Responsável)
Proof: run web | ✓ work-order-drawer.spec.ts > WorkOrderDrawer > workforce C41 edits without services while the assignments are not loaded and toasts a failure
Proof: run web | ✓ work-order-detail.spec.ts > WorkOrderDetail > workforce C41 shows no responsável until the workforce reads answer and toasts a failure
Proof: run web | ✓ work-order-detail.spec.ts > WorkOrderDetail > workforce C41 edits the responsável from the detail once the reads answered

## Coverage

| Set (size) | Member -> proof | Unproven |
| --- | --- | --- |
| `GET /staff` statuses (2) | 200 C3 · 401 C3 | - |
| `POST /staff` statuses (6) | 201 C1 · 400 C2 · 404 C2 · 409 C2 · 401 C3 (guard shared by the controller) · 403 C8 | - |
| `GET /staff/:id` statuses (3) | 200 C3 · 404 C3 · 401 C3 | - |
| `PUT /staff/:id` statuses (6) | 200 C4 · 400 C2 · 404 C4 · 409 C2 · 401 C3 · 403 C8 | - |
| `DELETE /staff/:id` statuses (5) | 204 C5 · 404 C5 · 409 C5 · 401 C3 · 403 C8 | - |
| `GET /teams` statuses (2) | 200 C6 · 401 C6 | - |
| `POST /teams` statuses (5) | 201 C6 · 400 C6 · 409 C6 · 401 C6 · 403 C8 | - |
| `PUT /teams/:id` statuses (6) | 200 C6 · 400 C6 · 404 C6 · 409 C6 · 401 C6 · 403 C8 | - |
| `DELETE /teams/:id` statuses (5) | 204 C7 · 404 C7 · 409 C7 · 401 C6 · 403 C8 | - |
| `GET /assignments` statuses (2) | 200 C19 · 401 C19 | - |
| `POST /work-orders` added statuses (4) | 400 C20 · 403 C21 · 404 C20 · 409 C20 | - |
| `PUT /work-orders/:id` added statuses (4) | 400 C22 · 403 C21 · 404 C22 · 409 C22 | - |
| `POST /work-orders/:id/services` added statuses (4) | 400 C23 · 403 C21 · 404 C23 · 409 C23 | - |
| Landing doors (4) | door 1 tables C37, C38 · door 2 write order C40, C20 · door 3 direction C39 · door 4 contract C1-C8, C19-C23 | - |
| Staff uniqueness rule, AC 2 (4 examples) | " rafael mendes" C2 · email in another case C2 · other Organization C2 · own name on edit C2 | - |
| Team delete rule, AC 7 (2 examples) | 2 Staff no Assignment C7 · responsible for a `COMPLETED` service C7 | - |
| Open-service rule, AC 22 (4 examples) | same assignee on `COMPLETED` C22 · another on `COMPLETED` C22 · clear on `COMPLETED` C22 · `CANCELLED` with a new one C22 | - |
| Staff status rule, AC 29 (4 examples) | own on `PENDING` C29 · team on `IN_PROGRESS` C29 · turned `COMPLETED` C29 · no team and no Assignment C29 | - |
| Team status rule, AC 30 (2 examples) | own on `IN_PROGRESS` C30 · member's own does not count C30 | - |
| Filters rule, AC 12 (2 examples) | chip with "Sem equipe" C12 · search "ALFA" C12 | - |
| source controls: `staff-list.png` (8) | "Cadastrar profissional" C14 · "Exportar" C13 · "Buscar profissional" C12 · "Filtrar por equipe" C12 · specialty chips C12 · "Selecionar todos os profissionais visíveis" C13 · row checkbox C13 · name link C11 | - |
| source controls: `staff-drawer.png` (8) | "Nome completo" C14 · "Especialidade" C14 · "Equipe" C14 · "E-mail" C14 · "Telefone" C14 · "Cancelar" C14 · "Fechar cadastro" C14 · "Criar profissional" C14 | - |
| source controls: `staff-detail.png` (4) | breadcrumb "Equipe técnica" C31 · e-mail link C31 · phone link C31 · "Voltar à lista da equipe" C31 | - |
| source controls: `staff-detail-not-found.png` (1) | "Voltar para a equipe" C33 | - |
| controls the source does not draw (6) | "Ações para <nome>" C15 · tab "Equipes" C16 · "Nova equipe" C17 · "Ações para <equipe>" C17 · "Responsável" in the WorkOrder drawer C25, C26 · "Responsável" in "Novo serviço" and "Adicionar à agenda" C27 | - |
| startup config: WorkforceModule (2 assemblies) | `AppModule` C39 and every smoke route C1-C38 · the HTTP test harness `bootHttp` C1-C8, C19 | - |

## Swept

- validation: C2, C6, C20
- failure modes: C20, C40, C24, C41
- idempotency: C22 (the same assignee sent again changes nothing)
- authorization: C8, C18, C21, C25
- concurrency: C38
- data lifecycle: C7, C24, C15 (the edit drawer reopens with the stored values)
- dependency failure: existing - `api-smoke.sh` "GET /customers with PostgreSQL down" covers the shared Prisma failure path; workforce calls no external service
- state transitions: C22, C29, C30
- observability: n/a - the plan sets no logging or metric requirement

## Handoff

- **Settled mid-build:** none
- **Dispatched:** at `b4e1016` (diff `9d32c67..b4e1016`, `proofs.md` at `b4e1016`, 122 pass and the 6 pictures awaiting judgement): the Verifier (fresh sub-agent) - returned, FAIL with 11 findings; screens round 1 (fresh sub-agent, the 6 pictures against their captures) - returned, 4 diverge (metric notes, team select, two dividers, the not-found card), 2 match; fix pass at `764e2d2` and `b080d34`, every picture retaken at `b080d34`; screens round 2 (the round-1 screens sub-agent resumed) at `b080d34`
- **Boundary:** C1-C40 closed at the commit that follows `5af0763`
- **Abandoned:** none
- **Walked:** at `5af0763` plus the profile pill fix, on an isolated stack started for the walk (PostgreSQL, Redis and Mailpit in new containers `wf-walk-pg`, `wf-walk-redis`, `wf-walk-mailpit` on ports 55700, 56700, 51700/58700; the API built from this checkout on 3336; `ng serve` on 4302 with a proxy to 3336), seeded through the API with fictional data only: the internal Organization's seeded Administrator, the Teams "Equipe Alfa" (Motor), "Equipe Bravo" (Hidráulica) and "Equipe Charlie" (Elétrica), the six professionals of the mareos capture, the Customer "Pescados Atlântico" with "Santa Maria" and "Lula Branca", a WorkOrder `IN_PROGRESS` on Santa Maria with "Revisão do motor principal" (Rafael Mendes) and "Troca do sistema hidráulico" (João Ferreira), both `IN_PROGRESS`, a `PENDING` WorkOrder on Lula Branca with "Manutenção do guincho de rede" (Equipe Charlie), and the operator "Lucas Costa". Headless Chrome (Playwright on `/usr/bin/google-chrome`, light theme, the session token set in `localStorage`) saved each `*.running.png` in a 1440x1000 window: C9 `captures/staff-list.running.png` (`/staff`), C12 `captures/staff-list-filtered.running.png` (chip "Mecânico naval": Pedro Nascimento, Rafael Mendes) and `captures/staff-list-empty.running.png` (search "zzz"), C14 `captures/staff-drawer.running.png` ("Cadastrar profissional", focus on "Nome completo"), C31 `captures/staff-detail.running.png` (`/staff/:id` of Rafael Mendes: "Em serviço", "Equipe Alfa", the allocation "Revisão do motor principal #0A16306B · Santa Maria · 17/11/2026 08:00 – 21/11/2026 17:00"), C33 `captures/staff-detail-not-found.running.png` (`/staff/00000000-0000-4000-8000-000000000000`). The flows, performed with clicks and typing as the administrator: "Cadastrar profissional" created "Ana Souza" in Equipe Bravo (toast "Ana Souza foi adicionado à equipe técnica.", the row appeared), its row menu "Editar" opened with "Técnica de pintura" and saved "Pintora naval" ("Profissional atualizado com sucesso"), "Excluir" with "Confirmar" removed it ("Profissional excluído com sucesso"); the tab "Equipes" moved the URL to `/staff?tab=equipes` and survived a reload; "Nova equipe" created "Equipe Delta" ("Equipe criada com sucesso"); "Excluir" on Equipe Charlie warned "Os 2 profissionais desta equipe ficarão sem equipe." and, confirmed, answered "Erro ao excluir equipe" / "Esta equipe é responsável por um serviço e não pode ser excluída."; on `/work-orders` "Nova ordem de serviço" offered "Responsável" with "Sem responsável", the six professionals and four teams, and created a WorkOrder on Lula Branca with "Pintura do casco" for Camila Rocha, whose detail read "Responsável: Camila Rocha" and whose "Editar" drawer listed the service with its Responsável. As the operator, `/staff` showed no "Cadastrar profissional" and "Nova ordem de serviço" showed no "Responsável". C34: `/staff`, `/staff?tab=equipes` and `/staff/:id` at 640, 768, 1024, 1280 and 1536 px - `scrollWidth` equals `innerWidth` in all 15. A user reaches the states from the sidebar "Equipe técnica", a specialty chip, the search, "Cadastrar profissional", a professional's name and an unknown `/staff/:id`. Seen in the walk: in the first pictures headless Chrome took the dark theme, so they were retaken with the light theme the captures use; the profile's team block showed the Team's status where the mareos shows the professional's, fixed before the final pictures.
