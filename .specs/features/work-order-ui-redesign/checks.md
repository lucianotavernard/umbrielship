# Work order UI redesign after mareos checks

Build: `cd api && npm run lint`; `cd api && npm run build`; `cd web && npm run build`
Run api: `cd api && npx vitest run --reporter=verbose src/package/work-order test`
Run smoke: `bash api/test/smoke/api-smoke.sh`
Run web: `cd web && npx ng test --watch=false --reporters=verbose`
Plan: `.specs/features/work-order-ui-redesign/plan.md`

75 checks in 6 slices (C72-C75 appended from the Verifier) · 5 one-way doors · 0 open, of which 0 block

## Checks

### S1 - Every WorkOrder on one page, searched, counted and exported

**C1** - `/work-orders` requests `GET /api/work-orders`, `GET /api/vessels` and `GET /api/customers` once each with no `take`, `skip` or `page`, and the page matches `.specs/features/work-order-ui-redesign/captures/work-order-list.png` except `## Differences from the source` (AC 1)
Proof: run web | ✓ work-order-list.spec.ts > WorkOrderList > work-order-ui C1 requests work orders, vessels and customers once with no paging
Proof: browser - open `/work-orders` at 1440x1250 as an operator, save `captures/work-order-list.running.png`

**C2** - `GET /work-orders` without `take` and `skip` answers 200 with every WorkOrder of the session's Organization, `total` their number, each with `services` ordered by `startDate` then `name`; with `take=10&skip=0` it answers 10; a bad `take` answers 400; no token answers 401 (AC 2)
Proof: run api | ✓ fetch-work-orders.use-case.spec.ts > FetchWorkOrdersUseCase > work-order-ui C2 returns every work order of the Organization when no take is given
Proof: run api | ✓ work-order.repository.spec.ts > PrismaWorkOrdersRepository > work-order-ui C2 reads every work order with its services by start date then name
Proof: run api | ✓ work-order.http.spec.ts > GET /work-orders > work-order-ui C2 answers every work order without take and 10 with take
Proof: run api | ✓ work-order.http.spec.ts > GET /work-orders > work-order-ui C2 answers 400 on a bad take and 401 without a token

**C3** - The `services` of a WorkOrder in `GET /work-orders` are the rows stored in PostgreSQL: none, one after a create, none after its delete (AC 3)
Proof: run smoke | ok   work-order-ui C3 services with no service (0)
Proof: run smoke | ok   work-order-ui C3 services after a service create (1)
Proof: run smoke | ok   work-order-ui C3 services after a service delete (0)

**C4** - The list is sorted by Docagem descending, then by `#` code (AC 4)
Proof: run web | ✓ work-order-list.spec.ts > WorkOrderList > work-order-ui C4 sorts by docagem descending then by code

**C5** - The metrics read Total de ordens, Em andamento, Pendentes and Concluídas over every WorkOrder, padded to two digits, with no footer line (AC 5)
Proof: run web | ✓ work-order-filters.spec.ts > workOrderMetrics > work-order-ui C5 counts 24, 08, 05, 07 and 120 over every work order
Proof: run web | ✓ work-order-list.spec.ts > WorkOrderList > work-order-ui C5 shows the four metrics over every work order whatever the filter

**C6** - The tabs Todas, Pendente, Em andamento, Concluído, Cancelado carry their counts; picking one keeps that status, marks it `aria-selected` and returns to page 1 (AC 6)
Proof: run web | ✓ work-order-list.spec.ts > WorkOrderList > work-order-ui C6 filters by the status tab with its count and returns to page 1

**C7** - The search keeps the WorkOrders whose code, Vessel name, Customer name or a service name contains the text, case-insensitive, within the tab, with no request; Limpar busca empties it (AC 7)
Proof: run web | ✓ work-order-filters.spec.ts > filterWorkOrders > work-order-ui C7 matches code with or without hash, vessel, customer and service names
Proof: run web | ✓ work-order-list.spec.ts > WorkOrderList > work-order-ui C7 searches within the tab with no request and Limpar busca empties it

**C8** - Each row shows the Vessel link to `/work-orders/:id`, `#code · Customer`, the first service with `+n` or `Nenhum serviço`, PRAZO as Hoje/Amanhã/date with `Docagem em …`, and the status badge tone (AC 8)
Proof: run web | ✓ work-order-list.spec.ts > WorkOrderList > work-order-ui C8 shows vessel, code and customer, services, prazo and status in each row
Proof: run web | ✓ work-order-filters.spec.ts > prazoLabel > work-order-ui C8 reads Hoje, Amanhã or the short date with the time

**C9** - The table shows 8 per page, one button per page, ends disabled, and the footer `Exibindo <first>–<last> de <n> ordens` (AC 9)
Proof: run web | ✓ work-order-list.spec.ts > WorkOrderList > work-order-ui C9 pages by 8 with one button per page and the footer range

**C10** - No WorkOrder says "Ainda não há ordens de serviço cadastradas."; no match says "Nenhuma ordem corresponde aos filtros aplicados." (AC 10)
Proof: run web | ✓ work-order-list.spec.ts > WorkOrderList > work-order-ui C10 tells an empty organization from a filter with no match

**C11** - Loading shows skeleton rows; a failed request shows an error toast with the API message (AC 11)
Proof: run web | ✓ work-order-list.spec.ts > WorkOrderList > work-order-ui C11 shows skeleton rows while loading and a toast when a request fails

**C12** - Row checkboxes and "Selecionar todas as ordens visíveis" (the current page) select; the header is indeterminate on a partial page; selection survives tab, search and page changes (AC 12)
Proof: run web | ✓ work-order-list.spec.ts > WorkOrderList > work-order-ui C12 selects rows and the page, shows indeterminate and keeps the selection

**C13** - Exportar is disabled with "Selecione ordens para exportar", reads "Exportar (n)" with its singular or plural label, and downloads `ordens-de-servico.csv` with BOM, CRLF, quoted cells, the header `OS,Embarcação,Cliente,Serviço,Docagem,Desdocagem,Status`, hidden selected rows included, formulas guarded and quotes doubled (AC 13)
Proof: run web | ✓ work-order-csv.spec.ts > workOrderCsv > work-order-ui C13 writes the header, the Aurora line, a guarded formula and doubled quotes
Proof: run web | ✓ work-order-list.spec.ts > WorkOrderList > work-order-ui C13 exports the selected work orders, hidden ones included

**C14** - "Ações para #code" offers Ver detalhes and, for a writer, Editar and Excluir; deleting confirms, calls `DELETE /api/work-orders/:id`, toasts "Ordem de serviço excluída com sucesso" and drops the row and its selection; a 409 keeps the row and toasts the API message (AC 14)
Proof: run web | ✓ work-order-list.spec.ts > WorkOrderList > work-order-ui C14 the row menu opens the detail and deletes after confirmation
Proof: run web | ✓ work-order-list.spec.ts > WorkOrderList > work-order-ui C14 a 409 on delete keeps the row and shows the API message

**C15** - An inspector sees no Nova ordem de serviço, Editar or Excluir on the list; selection and Exportar stay (AC 15)
Proof: run web | ✓ work-order-list.inspector.spec.ts > WorkOrderList as inspector > work-order-ui C15 hides the write controls and keeps selection and export

**C16** - The sidebar lists Visão geral, Ordens de serviço, Inspeções, Embarcações, Clientes, Agenda in that order and no Modelos de inspeção; `/work-orders[/…]`, `/inspections`, `/inspection-templates/:id`, `/work-orders/:id/assignments/…` and `/agenda` read Ordens de serviço, Inspeções, Inspeções, Inspeções and Agenda with the item `aria-current="page"` (AC 16, AD-048)
Proof: run web | ✓ app-shell.spec.ts > Shell > work-order-ui C16 lists six items in the mareos order and Organizações only for the internal Administrator
Proof: run web | ✓ app-shell.spec.ts > Shell > work-order-ui C16 the breadcrumb and the active item follow the work order, inspection and agenda routes

**C17** - At 640, 768, 1024, 1280 and 1536px the new pages have no horizontal page scroll; in the dark theme the status badges take their dark tones (AC 17)
Proof: walk - open `/work-orders`, `/work-orders/:id`, `/inspections`, the inspection page and `/agenda` at the five widths and compare `scrollWidth` with `innerWidth`; open `/work-orders` in the dark theme

### S2 - A WorkOrder created with its services in one drawer

**C18** - "Nova ordem de serviço" opens the drawer of `.specs/features/work-order-ui-redesign/captures/work-order-drawer.png` with Embarcação, the read-only Cliente responsável, Serviço 1 (Nome do serviço, Descrição do serviço up to 240), Adicionar serviço, Remover serviço only from two, Planejamento with Docagem, Desdocagem and Status at Pendente, and the footer (AC 18)
Proof: run web | ✓ work-order-drawer.spec.ts > WorkOrderDrawer > work-order-ui C18 opens with the vessel, the read-only customer, one service and the planning card
Proof: run web | ✓ work-order-drawer.spec.ts > WorkOrderDrawer > work-order-ui C18 adds and removes services, with Remover only from two
Proof: browser - open "Nova ordem de serviço" on `/work-orders` at 1440x1000, save `captures/work-order-drawer.running.png`

**C19** - "Criar ordem" posts `POST /api/work-orders` once with the vessel, dates, status and services in order, is disabled while it runs, closes, toasts "Ordem de serviço criada com sucesso" and shows the new WorkOrder (AC 19)
Proof: run web | ✓ work-order-drawer.spec.ts > WorkOrderDrawer > work-order-ui C19 posts the work order with its services once and shows it in the list

**C20** - An empty required field sends nothing and shows its message (AC 20)
Proof: run web | ✓ work-order-drawer.spec.ts > WorkOrderDrawer > work-order-ui C20 sends nothing and shows each required message

**C21** - `POST /work-orders` with `services` answers 201 and stores the WorkOrder and one PENDING service per item with the WorkOrder's period in one transaction; none keeps today's create; 51 services or an empty name answers 400 and stores nothing; another Organization's Vessel answers 404; an inspector gets 403; no token 401 (AC 21)
Proof: run api | ✓ create-work-order.use-case.spec.ts > CreateWorkOrderUseCase > work-order-ui C21 creates the services pending with the work order period
Proof: run api | ✓ create-work-order.use-case.spec.ts > CreateWorkOrderUseCase > work-order-ui C21 stores nothing when the vessel is of another organization
Proof: run api | ✓ work-order.repository.spec.ts > PrismaWorkOrdersRepository > work-order-ui C21 writes the work order and its services in one transaction
Proof: run api | ✓ work-order.http.spec.ts > POST /work-orders > work-order-ui C21 answers 201 with services and 400 for 51 services or an empty name
Proof: run api | ✓ work-order.http.spec.ts > POST /work-orders > work-order-ui C21 answers 403 to an inspector and 401 without a token

**C22** - In PostgreSQL a create with two services stores both with the WorkOrder's period and PENDING, and a 400 create leaves `total` unchanged (AC 22)
Proof: run smoke | ok   work-order-ui C22 services stored with the work order (2)
Proof: run smoke | ok   work-order-ui C22 services take the work order period and PENDING (ok)
Proof: run smoke | ok   work-order-ui C22 invalid create answers 400 (400)
Proof: run smoke | ok   work-order-ui C22 invalid create stores nothing (same)

**C23** - An API error on create keeps the drawer open with the values and toasts the API message (AC 23)
Proof: run web | ✓ work-order-drawer.spec.ts > WorkOrderDrawer > work-order-ui C23 keeps the drawer and the values when the API fails

**C24** - "Nova ordem" on `/vessels/:id` opens the same drawer with that Vessel chosen and disabled, and the WorkOrder appears in the Vessel's table (AC 24)
Proof: run web | ✓ vessel-detail.spec.ts > VesselDetail > work-order-ui C24 Nova ordem opens the drawer with the vessel locked and lists the new order

**C25** - "Editar" opens "Editar ordem de serviço" with the Vessel disabled, no services card, the values filled and "Salvar alterações", which puts `startDate`, `endDate` and `status` and toasts "Ordem atualizada com sucesso" (AC 25)
Proof: run web | ✓ work-order-drawer.spec.ts > WorkOrderDrawer > work-order-ui C25 edits dates and status from the row menu with the vessel locked
Proof: run web | ✓ work-order-detail.spec.ts > WorkOrderDetail > work-order-ui C25 Editar on the detail puts the new values and shows them

**C26** - Cancelar, Fechar formulário and Esc close the drawer with no request (AC 26)
Proof: run web | ✓ work-order-drawer.spec.ts > WorkOrderDrawer > work-order-ui C26 Cancelar, Fechar formulário and Esc close with no request

### S3 - WorkOrder detail in the mareos look

**C27** - The detail shows the breadcrumb "Ordens de serviço" / "OS #code", the kicker, title and status badge, the Vessel link with type label and pt-BR length, Docagem and Desdocagem in long form with the weekday, and no Atividade recente or old back button (AC 27)
Proof: run web | ✓ work-order-detail.spec.ts > WorkOrderDetail > work-order-ui C27 shows the breadcrumb, header, vessel and period without the empty panel

**C28** - Serviços lists name and description, Início, Fim and Status tones; a writer creates a service in the drawer and uploads a photo; an empty list shows its two sentences (AC 28)
Proof: run web | ✓ work-order-detail.spec.ts > WorkOrderDetail > work-order-ui C28 lists the services and creates one from the Novo serviço drawer
Proof: run web | ✓ work-order-detail.spec.ts > WorkOrderDetail > work-order-ui C28 uploads a photo to the service images route
Proof: run web | ✓ work-order-detail.spec.ts > WorkOrderDetail > work-order-ui C28 says no service was executed when there is none

**C29** - Inspeções keeps its content; Inspecionar opens `/work-orders/:id/assignments/:assignmentId/inspect`; an Inspection of the history opens `/work-orders/:id/assignments/:assignmentId/inspections/:inspectionId` (AC 29)
Proof: run web | ✓ inspection-assignment-section.spec.ts > Inspection assignments section > work-order-ui C29 Inspecionar and a history row open the inspection pages

**C30** - An unknown or foreign WorkOrder shows "Ordem de serviço não encontrada", the organization sentence and "Voltar para ordens de serviço" (AC 30)
Proof: run web | ✓ work-order-detail.spec.ts > WorkOrderDetail > work-order-ui C30 a 404 shows the not found state with the way back

**C31** - Loading shows skeletons for the header and panels (AC 31)
Proof: run web | ✓ work-order-detail.spec.ts > WorkOrderDetail > work-order-ui C31 shows skeletons while the work order loads

**C32** - An inspector sees no Editar, Novo serviço, Enviar foto, Atribuir modelo or remove on the detail (AC 32)
Proof: run web | ✓ work-order-detail.inspector.spec.ts > WorkOrderDetail as inspector > work-order-ui C32 hides every write control

### S4 - The Inspections hub

**C33** - An administrator's `/inspections` requests templates without paging, the Organization's assignments, the WorkOrders and the Vessels once each and matches `.specs/features/work-order-ui-redesign/captures/inspection-templates.png` except `## Differences from the source`, with no switch (AC 33)
Proof: run web | ✓ inspections-hub.spec.ts > InspectionsHub > work-order-ui C33 requests templates, assignments, work orders and vessels once with no switch
Proof: browser - open `/inspections` at 1440x1000 as the administrator, save `captures/inspection-templates.running.png`

**C34** - `GET /inspection-assignments` answers 200 with every assignment of the session's Organization, `createdAt` descending, each with `workOrder`, `service` or null, items, `removable` and visible inspections newest first; another Organization's are absent; no token 401 (AC 34)
Proof: run api | ✓ fetch-organization-inspection-assignments.use-case.spec.ts > FetchOrganizationInspectionAssignmentsUseCase > work-order-ui C34 returns every assignment of the Organization and no other
Proof: run api | ✓ inspection-assignment.repository.spec.ts > PrismaInspectionAssignmentsRepository > work-order-ui C34 reads the Organization's assignments newest first with the work order and visible inspections
Proof: run api | ✓ inspection-assignment.http.spec.ts > GET /inspection-assignments > work-order-ui C34 answers every role with the assignments and 401 without a token

**C35** - In PostgreSQL an assignment's `workOrder.status` follows the stored WorkOrder, before and after an edit to IN_PROGRESS (AC 35)
Proof: run smoke | ok   work-order-ui C35 assignment carries the work order status (PENDING)
Proof: run smoke | ok   work-order-ui C35 assignment follows the work order edit (IN_PROGRESS)

**C36** - `GET /inspection-templates` without `page` and `per_page` answers every template, `createdAt` descending; with `page=1` 10; a bad page 400; no token 401 (AC 36)
Proof: run api | ✓ fetch-inspection-templates.use-case.spec.ts > FetchInspectionTemplatesUseCase > work-order-ui C36 returns every template when no page is given
Proof: run api | ✓ inspection-template.http.spec.ts > GET /inspection-templates > work-order-ui C36 answers every template without page and 10 with page 1
Proof: run smoke | ok   work-order-ui C36 templates without page (12)

**C37** - The metrics read Modelos ativos, Aguardando conclusão and Concluídas from templates, assignments with no visible Inspection and visible Inspections (AC 37)
Proof: run web | ✓ inspections-hub.spec.ts > InspectionsHub > work-order-ui C37 counts templates, waiting assignments and visible inspections

**C38** - Administrator and operator see the tabs Modelos and Atribuições with counts; each card shows MODELO, the name link, the question count, Criado em and, for the administrator, Atribuir à OS; the administrator sees Novo modelo and Criar outro modelo; no template says "Nenhum modelo de inspeção cadastrado" (AC 38)
Proof: run web | ✓ inspections-hub.spec.ts > InspectionsHub > work-order-ui C38 shows the template cards with their counts, dates and links
Proof: run web | ✓ inspections-hub.spec.ts > InspectionsHub > work-order-ui C38 an operator reads the tabs with no write control
Proof: run web | ✓ inspections-hub.spec.ts > InspectionsHub > work-order-ui C38 says there is no template

**C39** - Novo modelo opens the drawer of `.specs/features/work-order-ui-redesign/captures/inspection-template-drawer.png` with the mareos labels as `modelo`, four answer types, Subir, Descer (AD-051) and Remover pergunta from two; Criar modelo posts, toasts and puts the card first; a 409 keeps the drawer and shows the name-taken toast (AC 39)
Proof: run web | ✓ inspections-hub.spec.ts > InspectionsHub > work-order-ui C39 creates a template from the drawer and shows its card first
Proof: run web | ✓ inspections-hub.spec.ts > InspectionsHub > work-order-ui C39 a taken name keeps the drawer open
Proof: browser - open "Novo modelo" on `/inspections` at 1440x1000, save `captures/inspection-template-drawer.running.png`

**C40** - Atribuir à OS opens the drawer of `.specs/features/work-order-ui-redesign/captures/inspection-assignment-drawer.png`, lists every WorkOrder and the chosen one's services as Alvo, posts the assignment, toasts and opens Atribuições with it first (AC 40)
Proof: run web | ✓ inspections-hub.spec.ts > InspectionsHub > work-order-ui C40 assigns a template to a work order service from its card
Proof: browser - open "Atribuir à OS" on the first card at 1440x1000, save `captures/inspection-assignment-drawer.running.png`

**C41** - Atribuições matches `.specs/features/work-order-ui-redesign/captures/inspection-assignments.png` with code and Vessel, template, target and count, the pill Sem inspeção or the latest result, and Abrir ordem; none says the empty sentences (AC 41)
Proof: run web | ✓ inspections-hub.spec.ts > InspectionsHub > work-order-ui C41 lists the assignments with target, pill and Abrir ordem
Proof: run web | ✓ inspections-hub.spec.ts > InspectionsHub > work-order-ui C41 says no inspection is assigned
Proof: browser - open the Atribuições tab at 1440x1000, save `captures/inspection-assignments.running.png`

**C42** - An inspector's hub matches `.specs/features/work-order-ui-redesign/captures/inspection-inspector-view.png` with no tabs, Novo modelo, switch or notice; "Atribuições de inspeção" lists every assignment, inspectable first, with Inspecionar disabled and its reason when not inspectable, and Abrir ordem (AC 42)
Proof: run web | ✓ inspections-hub.inspector.spec.ts > InspectionsHub as inspector > work-order-ui C42 lists inspectable assignments first with Inspecionar and the reason
Proof: run web | ✓ inspection-availability.spec.ts > inspectionBlockedReason > work-order-ui C42 blocks on the work order and then on the target service
Proof: browser - open `/inspections` at 1440x1000 as an inspector, save `captures/inspection-inspector-view.running.png`

**C43** - `/inspection-templates` redirects to `/inspections` (AC 43)
Proof: run web | ✓ app.routes.spec.ts > routes > work-order-ui C43 redirects the template list to the hub

**C44** - The template detail shows the breadcrumb Inspeções, the kicker MODELO DE INSPEÇÃO, the count and date and the numbered questions; the administrator edits in the drawer titled Editar modelo with Salvar alterações and deletes back to `/inspections` (AC 44)
Proof: run web | ✓ inspection-template-detail.spec.ts > InspectionTemplateDetail > work-order-ui C44 shows the breadcrumb, kicker, count and numbered questions
Proof: run web | ✓ inspection-template-detail.spec.ts > InspectionTemplateDetail > work-order-ui C44 edits in the Editar modelo drawer and deletes back to the hub

**C45** - An unknown or foreign template shows "Modelo de inspeção não encontrado" and "Voltar para inspeções" (AC 45)
Proof: run web | ✓ inspection-template-detail.spec.ts > InspectionTemplateDetail > work-order-ui C45 a 404 shows the not found state with the way back

**C46** - The hub shows skeletons while loading and an error toast when a request fails (AC 46)
Proof: run web | ✓ inspections-hub.spec.ts > InspectionsHub > work-order-ui C46 shows skeletons while loading and a toast when a request fails

### S5 - An Inspection answered and read on a full page

**C47** - Inspecionar opens the inspect page matching `.specs/features/work-order-ui-redesign/captures/inspection-run.png` except `## Differences from the source`: the back link by origin, kicker with the code, template name, the fallback sentence, no pill, Embarcação, Inspetor as the signed-in user and Progresso (AC 47)
Proof: run web | ✓ inspection-page.spec.ts > InspectionPage > work-order-ui C47 shows the header, meta and the back link by origin
Proof: browser - open the inspect page of an assignment of a WorkOrder in progress at 1440x1000 as an inspector, save `captures/inspection-run.running.png`

**C48** - Each question is a numbered card with the controls of its type, Não se aplica on every question, Observação on non-text ones, 1000 and 500 character limits, and controls at least 40px tall (AC 48)
Proof: run web | ✓ inspection-page.spec.ts > InspectionPage > work-order-ui C48 offers the controls of each type with Não se aplica and the note

**C49** - Progresso changes as questions are answered or cleared; Não se aplica counts (AC 49)
Proof: run web | ✓ inspection-page.spec.ts > InspectionPage > work-order-ui C49 counts answered questions as they change

**C50** - Concluir inspeção with a question unanswered sends nothing, shows "Responda à pergunta obrigatória: “<label>”." as an alert and focuses it (AC 50)
Proof: run web | ✓ inspection-page.spec.ts > InspectionPage > work-order-ui C50 names and focuses the first unanswered question

**C51** - With every answer, Concluir inspeção asks for Aprovada or Reprovada with nothing chosen, posts the Inspection, toasts and returns to the origin (AC 51)
Proof: run web | ✓ inspection-page.spec.ts > InspectionPage > work-order-ui C51 asks for the result, posts the inspection and returns to the origin

**C52** - An API error keeps the answers and toasts the API message (AC 52)
Proof: run web | ✓ inspection-page.spec.ts > InspectionPage > work-order-ui C52 keeps the answers when the API fails

**C53** - The page says "As respostas só são gravadas ao concluir a inspeção." and has no Fotos de evidência (AC 53)
Proof: run web | ✓ inspection-page.spec.ts > InspectionPage > work-order-ui C53 says answers are stored on conclusion and offers no photos

**C54** - A blocked assignment shows the reason and no Concluir inspeção; a non-inspector is sent to `/forbidden`; an unknown assignment shows "Atribuição não encontrada" (AC 54)
Proof: run web | ✓ inspection-page.spec.ts > InspectionPage > work-order-ui C54 shows the reason for a blocked assignment and not found for an unknown one
Proof: run web | ✓ app.routes.spec.ts > routes > work-order-ui C54 guards the inspect page for the inspector role

**C55** - A history Inspection opens the read-only page with the result pill, its inspector, every answer and note, "Concluída em", and no controls (AC 55)
Proof: run web | ✓ inspection-page.spec.ts > InspectionPage > work-order-ui C55 reads a completed inspection with its result and answers

**C56** - An inspector discards from that page after the confirmation, posts the discard, toasts and returns to the WorkOrder (AC 56)
Proof: run web | ✓ inspection-page.spec.ts > InspectionPage > work-order-ui C56 an inspector discards after confirming and returns to the order

**C57** - At 640px the inspection page wraps the answer options with no horizontal scroll (AC 57)
Proof: walk - open the inspect page at 640px and compare `scrollWidth` with `innerWidth`

### S6 - A week of services and dockings on the Agenda

**C58** - `/agenda` requests `GET /api/work-orders` and `GET /api/vessels` once with no `take`, opens on the current week with today selected, and matches `.specs/features/work-order-ui-redesign/captures/agenda.png` except `## Differences from the source` (AC 58)
Proof: run web | ✓ agenda.spec.ts > Agenda > work-order-ui C58 requests work orders and vessels once and opens on the current week
Proof: browser - open `/agenda` at 1440x1161 as an operator, save `captures/agenda.running.png`

**C59** - The grid places services at their start and non-cancelled WorkOrders at Docagem and Desdocagem in the day column and the 2-hour row, clamped to 08:00 and 18:00, sorted by time, each with time, Vessel, name or Docagem/Desdocagem and the code (AC 59)
Proof: run web | ✓ agenda-week.spec.ts > agendaItems > work-order-ui C59 places services and dockings, clamps the rows and hides cancelled orders
Proof: run web | ✓ agenda.spec.ts > Agenda > work-order-ui C59 shows each item with its time, vessel, name and code in its cell

**C60** - Each day header shows the weekday, the day and "1 item", "<n> itens" or "Livre" (AC 60)
Proof: run web | ✓ agenda.spec.ts > Agenda > work-order-ui C60 the day headers count one item, many items or Livre

**C61** - Hoje, Semana anterior and Próxima semana move the week, Dia anterior and Próximo dia a day in the Dia view; the label reads "Novembro 2026" or "30 de nov — 06 de dez, 2026" with "16 de nov — 22 de nov" beneath (AC 61, AD-049)
Proof: run web | ✓ agenda-week.spec.ts > weekLabel > work-order-ui C61 reads one month or the cross month range
Proof: run web | ✓ agenda.spec.ts > Agenda > work-order-ui C61 Hoje, Semana anterior and Próxima semana move the week

**C62** - Dia shows only the selected day; Semana brings the week back; a day header selects its day (AC 62)
Proof: run web | ✓ agenda.spec.ts > Agenda > work-order-ui C62 Dia shows the selected day and a header selects it

**C63** - The Tipo chips and the search filter the grid, the day panel and the metrics with no request; Limpar busca empties it (AC 63)
Proof: run web | ✓ agenda.spec.ts > Agenda > work-order-ui C63 the type chips and the search filter grid, panel and metrics

**C64** - The metrics read Compromissos na semana and Docagens programadas over the shown week, padded (AC 64)
Proof: run web | ✓ agenda.spec.ts > Agenda > work-order-ui C64 counts the week items and dockings

**C65** - SELEÇÃO DO DIA shows the long date, the count, Dia produtivo or Dia sem compromissos with its sentence and an Adicionar à agenda button opening the drawer at that day 08:00, and the day's items by time (AC 65, AD-049)
Proof: run web | ✓ agenda.spec.ts > Agenda > work-order-ui C65 the day panel names the day, counts it and lists its items

**C66** - An item in the grid or the panel opens `/work-orders/:id` (AC 66)
Proof: run web | ✓ agenda.spec.ts > Agenda > work-order-ui C66 an item opens its work order

**C67** - Novo compromisso, an empty cell and Adicionar compromisso neste dia open the drawer titled Adicionar à agenda with the open WorkOrders, Serviço, Descrição, Início filled from the cell or 08:00 and Fim; Agendar serviço posts a PENDING service, toasts and shows the item (AC 67, AD-049)
Proof: run web | ✓ agenda.spec.ts > Agenda > work-order-ui C67 a cell opens the drawer at its hour and adds a pending service to the grid

**C68** - An inspector sees no Novo compromisso, cell buttons or day button (AC 68)
Proof: run web | ✓ agenda.inspector.spec.ts > Agenda as inspector > work-order-ui C68 hides every create control

**C69** - The Agenda shows none of the team, availability, tide, workshop-hours or demo texts (AC 69)
Proof: run web | ✓ agenda.spec.ts > Agenda > work-order-ui C69 shows no team, availability, tide or demo text

**C70** - The grid shows skeleton cells while loading and an error toast when a request fails (AC 70)
Proof: run web | ✓ agenda.spec.ts > Agenda > work-order-ui C70 shows skeletons while loading and a toast when a request fails

### Routes

**C71** - The web routes are `/work-orders`, `/work-orders/:id`, `/work-orders/:id/assignments/:assignmentId/inspect`, `/work-orders/:id/assignments/:assignmentId/inspections/:inspectionId`, `/inspections`, `/inspection-templates/:id` and `/agenda`, inside the authenticated layout (Landing door 5)
Proof: run web | ✓ app.routes.spec.ts > routes > work-order-ui C71 declares the work order, inspection and agenda routes in the authenticated layout

### Verifier findings (appended)

**C72** - The layout keeps the signed-in User's name from `GET /me` in `AuthenticationService.name`, which the inspection page shows under Inspetor (AC 47; Verifier finding 7)
Proof: run web | ✓ app-shell.spec.ts > Shell > work-order-ui C72 the layout keeps the signed-in name for the inspection page

**C73** - A create whose service PostgreSQL refuses stores no WorkOrder: the transaction rolls back in the database (AC 21; Verifier finding 8)
Proof: run smoke | ok   work-order-ui C73 refused service write fails (500)
Proof: run smoke | ok   work-order-ui C73 refused service write stores no work order (same)

**C74** - `PrismaInspectionTemplatesRepository` asks for every template newest first when no page is given (AC 36; Verifier finding 10)
Proof: run api | ✓ inspection-template.repository.spec.ts > PrismaInspectionTemplatesRepository > work-order-ui C36 asks for every template newest first when no page is given

**C75** - Editar on the WorkOrder detail shows the Vessel's Customer read-only in Cliente responsável, as from the list (AC 25; Verifier finding 11)
Proof: run web | ✓ work-order-detail.spec.ts > WorkOrderDetail > work-order-ui C75 Editar on the detail shows the vessel's customer

## Coverage

| Set (size) | Member -> proof | Unproven |
| --- | --- | --- |
| `GET /work-orders` statuses (3) | 200 C2 · 400 C2 · 401 C2 | - |
| `POST /work-orders` statuses (5) | 201 C21 · 400 C21 · 404 C21 · 401 C21 · 403 C21 | - |
| `GET /inspection-templates` statuses (3) | 200 C36 · 400 C36 · 401 C36 | - |
| `GET /inspection-assignments` statuses (2) | 200 C34 · 401 C34 | - |
| Landing doors (5) | list contract C2, C3 · create with services C21, C22 · templates without paging C36 · Organization assignments C34, C35 · web routes C71, C43 | - |
| list rule, AC 2 (5 examples) | 14 C2 · take=10 C2 · vesselId without take C2 · another Organization C2 · services order C2 | - |
| metrics rule, AC 5 (2 examples) | 24/08/05/07 C5 · 120 C5 | - |
| search fields, AC 7 (4) | code C7 · Vessel name C7 · Customer name C7 · service name C7 | - |
| status tabs (5) | Todas C6 · Pendente C6 · Em andamento C6 · Concluído C6 · Cancelado C6 | - |
| paging rule, AC 9 (2 examples) | 17 C9 · none C9 | - |
| CSV rule, AC 13 (3 examples) | Aurora line C13 · `=SUM(A1)` C13 · `"` doubled C13 | - |
| create rule, AC 21 (6 examples) | 2 services C21, C22 · none C21 · 51 services C21 · empty name C21, C22 · other Organization's Vessel C21 · a service PostgreSQL refuses C73 | - |
| assignment list, AC 34 (2 examples) | 3 over 2 WorkOrders C34 · discarded Inspection C34 | - |
| templates rule, AC 36 (3) | 12 C36 · page=1 C36 · newest first in the Prisma call C74 | - |
| progress rule, AC 49 (2 examples) | 2 of 3 C49 · Não se aplica counts C49 | - |
| agenda placement, AC 59 (4 examples) | Tue 09:30 C59 · 06:00 C59 · 21:00 C59 · cancelled C59 | - |
| answer types (4) | TEXT C48 · YES_NO C48 · CONFORMITY C48 · SCORE C48 | - |
| source controls: WorkOrder list, without Prioridade (10) | Nova ordem de serviço C18 · Exportar C13 · tabs C6 · search C7 · Limpar busca C7 · select all C12 · row checkbox C12 · Vessel link C8 · Ações C14 · pages C9 | - |
| source controls: WorkOrder drawer, without Adicionar cliente (6) | Embarcação C19 · Adicionar serviço C18 · Remover serviço C18 · Criar ordem C19 · Cancelar C26 · Fechar formulário C26 | - |
| source controls: hub, without the switch (5) | Novo modelo C39 · tabs C38 · name link C38 · Atribuir à OS C40 · Criar outro modelo C39 | - |
| source controls: template drawer, without Obrigatória and photos (6) | Adicionar C39 · Remover pergunta C39 · Tipo de resposta C39 · Criar modelo C39 · Cancelar C39 · Fechar C39 | - |
| source controls: assignment drawer, without Inspetor (4) | Ordem de serviço C40 · Alvo C40 · Atribuir inspeção C40 · Cancelar C40 | - |
| source controls: Atribuições and inspector view (2) | Abrir ordem C41, C42 · Inspecionar C42 | - |
| source controls: inspection page, without photos (4) | Voltar C47 · answer options C48 · Não se aplica C48 · Concluir inspeção C50, C51 | - |
| source controls: Agenda, without teams and tide (10) | Novo compromisso C67 · Hoje C61 · Semana anterior / Próxima semana, Dia anterior / Próximo dia C61 · search C63 · Limpar busca C63 · Semana / Dia C62 · Tipo chips C63 · day header C62 · item C66 · empty cell and "+" C67 | - |
| added controls (6) | row menu Editar C25 · row menu Excluir C14 · Descartar C56 · Editar modelo / Excluir C44 · Subir / Descer C39 (AD-051) · day panel Adicionar à agenda C65 (AD-049) | - |
| inspector write controls (5 pages) | WorkOrder list C15 · WorkOrder detail C32 · hub C42 · template detail C44 · Agenda C68 | - |
| widths (5) | 640 C17, C57 · 768 C17 · 1024 C17 · 1280 C17 · 1536 C17 | - |
| menu items (7) | Visão geral C16 · Ordens de serviço C16 · Inspeções C16 · Embarcações C16 · Clientes C16 · Agenda C16 · Organizações C16 | - |

## Swept

- validation: C20, C21 (51 services, empty name), C48 (1000 and 500 character limits)
- failure modes: C21, C22 and C73 (one transaction, nothing stored on 400 or on a write the database refuses), C23, C52
- idempotency: C19 ("Criar ordem" disabled while the request runs, one POST)
- authorization: C21 (403 to an inspector), C15, C32, C42, C54, C68; existing - `RolesGuard` on every write route
- concurrency: n/a - no new shared state; the only multi-row write is one transaction (C21)
- data lifecycle: C25 (edited values shown back), C14 (delete drops the row), C3 (services follow create and delete)
- dependency failure: C11, C46, C70 (each read failing in turn), C23, C52
- state transitions: C42 and C54 (inspectable only while IN_PROGRESS), C6
- observability: n/a - no logging requirement in this plan

## Handoff

- **Settled mid-build:** after the Verifier and screens round 1 (2026-11-17): "Inspeções, como o mareos (Recomendado)" (AD-048); "Seguir o mareos (Recomendado)" (AD-049); "Manter o singular (Recomendado)" (AD-050); "Manter, só com 2+ perguntas (Recomendado)" (AD-051); after screens round 2: "Compacto com tipo e código (Recomendado)" (AD-052) - the compact cards change after the last screens round, so the retaken agenda picture is not judged again
- **Dispatched:** API builder sub-agent (doors 1-4, C2, C3, C21, C22, C34, C35, C36; works only under `api/`, does not commit) at `ddda435` - returned, all doors built, committed by the author at `1bdc8bb`; web test builder S1-S3 (C1, C4-C20, C23-C32, C16; owns `work-order/work-order/**`, `work-order-service/**`, `customer/vessel/**`, the shell) at `1bdc8bb` - returned, 36 owned lines pass, whole web suite 223 tests green; it fixed the same tracked-effect toast in `work-order-list.ts` and replaced the superseded `customer-ui C2`, `C5`, `C50`, `[C91]` and `inspector C26` tests with C16, C24, C28 and C32; Verifier at `a512d9a` (diff `ddda435..a512d9a`) - returned FAIL, 12 findings; screens round 1 at `a512d9a` (pictures taken at `98c4d6d`) - returned, 8 of 9 diverge, 35 rows differ; fix-pass builder sub-agent (screens rows, Verifier findings 7-11, AD-048 to AD-051; does not commit) at `a512d9a` - interrupted when the session ended, resumed from its transcript in the next session, returned: every screens row and findings 7-11 fixed, web 225 tests, API 317, smoke 56 ok; committed by the author at `f89463f`; screens round 2 at `bd7ee26` (pictures retaken at `f89463f`), resuming the round-1 screens sub-agent - returned, 8 of 9 match, all 35 round-1 rows `same`; `agenda` diverges on one `differs - regression` row (crowded cells show only time and vessel and cut cards past the second); no third round, this row goes to the user; Verifier resumed at `bd7ee26` for rows C72-C75 only - returned, all four hold, no finding; web test builder S4-S6 (C29, C33, C37-C71; owns `inspection/**`, `inspection-template/**`, `inspection-assignment/**`, `agenda/**`, `app.routes.ts`) at `1bdc8bb` - returned, 45 owned lines pass; it fixed toasts raised inside tracked effects (hub, Agenda) and made "Novo compromisso" start at the selected day 08:00; it deleted `inspection-checklist.spec.ts`, `inspection-history.spec.ts` (claims moved to `inspection-page.spec.ts` and the section spec), `inspection-template-list.spec.ts` and `inspection-template-menu.spec.ts` (superseded by C16, C38, C39)
- **Boundary:** C2, C3, C21, C22, C34, C35, C36 at `1bdc8bb`; C1, C4-C20, C23-C33, C37-C71 at `98c4d6d`; the Verifier and screens round 1 findings, C72-C75 and AD-048 to AD-051 at `f89463f`; the screens round 2 regression (AD-052) at `19eeb2f`, after the last screens round
- **Abandoned:** none
- **Walked:** an isolated stack started for the walk (PostgreSQL, Redis and Mailpit in new containers `wo-walk-pg`, `wo-walk-redis`, `wo-walk-mailpit` on ports 55500, 56500, 51500/58500; the API built from this checkout on 3334; `ng serve` on 4300 with a proxy to 3334), seeded through the API with eight fictional Customers and Vessels, eight WorkOrders in the week of 16 Nov 2026 created with their services through the new `POST /work-orders`, the templates "Inspeção de segurança de bordo" and "Checklist de manutenção preventiva", one assignment on the Santa Maria WorkOrder (`IN_PROGRESS`), the operator "Lucas Costa" and the inspector "Camila Rocha". Headless Chrome (Playwright on `/usr/bin/google-chrome`) saved every `*.running.png` at its capture's size: `/work-orders` at 1440x1250 as the operator; "Nova ordem de serviço" at 1440x1000; `/inspections` as the administrator, "Novo modelo", the first card's "Atribuir à OS" and the "Atribuições" tab at 1440x1000; `/inspections` as the inspector and its first "Inspecionar" (the inspect page) at 1440x1000; `/agenda` at 1440x1161 as the operator. The flows, performed with clicks and typing: the operator created a WorkOrder on Pescador I with two services (the read-only customer read "João Batista"; the total went 08 -> 09; the search "pintura" found it with "+1 serviço"), opened it from the row menu "Ver detalhes" (two services), and set it "Em andamento" with "Editar"; the administrator assigned "Inspeção de segurança de bordo" to it from a card ("Atribuições" selected, two cards); the inspector opened it with "Inspecionar" (`?from=inspections`), "Concluir inspeção" with nothing answered showed "Responda à pergunta obrigatória: “Coletes salva-vidas estão acessíveis e em bom estado?”.", answered the three ("3 de 3 respondidas"), chose "Aprovada", confirmed, landed on `/inspections` with the pill "Aprovada", then opened it from the WorkOrder history ("Aprovada", "Concluída em 17/11/2026 14:32"); the operator used the empty cell "Criar compromisso em Sábado, 21 de novembro às 08:00" (Início prefilled `2026-11-21T08:00`) and added a service (24 items, from 23). C17 and C57: `/work-orders`, `/work-orders/:id`, `/inspections`, the inspect page and `/agenda` at 640, 768, 1024, 1280 and 1536 px - `scrollWidth` equals `innerWidth` in all 25; in the dark theme the badges read `rgb(24, 40, 58)` on `rgb(141, 180, 220)` (Em andamento) and `rgb(26, 38, 50)` on `rgb(154, 170, 184)` (Pendente). A user reaches the states from the sidebar (Ordens de serviço, Inspeções, Agenda), "Nova ordem de serviço", a row's "Ações para #…", "Novo modelo", "Atribuir à OS", the "Atribuições" tab, "Inspecionar", a history row and an empty Agenda cell. Seen in the walk: on the inspect page reached from the hub the topbar reads "Operação > Ordens de serviço" (criterion 16 maps `/work-orders[/…]` there) while `captures/inspection-run.png` reads "Inspeções". After screens round 1 (`f89463f`): the walk stack's API and `ng serve` restarted on the same data; every picture retaken at its capture's size with the same script; the five pages again show `scrollWidth` equal to `innerWidth` at all five widths; the inspect page now reads "Operação > Inspeções" and fits 1440x1000 with "Concluir inspeção" in view; the Agenda grid and legend fit 1440x1161. After screens round 2 (`19eeb2f`, AD-052): only the Agenda changed; `agenda.running.png` retaken at 1440x1161 - crowded cells (TER 08:00, QUI 08:00, SEG 10:00, 12:00, 14:00) now draw two-line cards with the time and Vessel, then the service or Docagem/Desdocagem and the `#` code, truncated with an ellipsis when long; the grid and legend still fit the window. No screens round judged this picture (there is no third round); the user chose this fix knowing it.
