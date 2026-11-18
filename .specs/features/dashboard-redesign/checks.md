# Dashboard after mareos checks

Build: `cd web && npm run build`
Run web: `cd web && npx ng test --watch=false --reporters=verbose`
Plan: `.specs/features/dashboard-redesign/plan.md`

26 checks in 1 slice · 0 one-way doors · 0 open, of which 0 block

## Checks

### S1 - The overview shows today's operation of the Organization

**C1** - Any Role opening `/dashboard` (or `/`, which redirects there) requests `GET /api/work-orders`, `/api/vessels`, `/api/customers`, `/api/staff`, `/api/teams` and `/api/assignments` once each with no `page`, `take` or `skip`, and the page matches `.specs/features/dashboard-redesign/captures/dashboard.png` (`.specs/features/dashboard-redesign/captures/dashboard.aria.yml`) except `## Differences from the source` (AC 1)
Proof: run web | ✓ dashboard.spec.ts > Dashboard > dashboard C1 requests the six reads once with no paging for every role
Proof: browser - open `/dashboard` at 1440x1114 as an operator, save `captures/dashboard.running.png`
Proof: walk - open `/` signed in and land on `/dashboard`

**C2** - The kicker is today's date as `Intl` `pt-BR` writes it, upper-case ("TERÇA-FEIRA, 17 DE NOVEMBRO DE 2026"), the heading "<saudação>, <primeiro nome>" - "Bom dia" 05:00-11:59 and "Boa tarde" 12:00-17:59 with the sun, "Boa noite" 18:00-04:59 with a moon, the first word of the User's name - and the subtitle "Aqui está o resumo da operação da sua oficina hoje." (AC 2)
Proof: run web | ✓ dashboard-summary.spec.ts > greeting > dashboard C2 greets by the hour with the sun or the moon
Proof: run web | ✓ dashboard-summary.spec.ts > firstName > dashboard C2 takes the first word of the name
Proof: run web | ✓ dashboard-summary.spec.ts > dateKicker > dashboard C2 writes today in pt-BR upper-case
Proof: run web | ✓ dashboard.spec.ts > Dashboard > dashboard C2 opens with the date, the greeting and the subtitle

**C3** - "Indicadores da operação" shows "Ordens em aberto" (`PENDING` + `IN_PROGRESS`), "Em execução" (`IN_PROGRESS`), "Pendentes" (`PENDING`) and "Concluídas no mês" (`COMPLETED` with a Desdocagem in the browser's current month), padded to two digits, over every WorkOrder and never over a tab or a search: on 2026-11-17 the plan's fleet reads "05", "02", "03", "01", and none reads "00" four times (AC 3)
Proof: run web | ✓ dashboard-summary.spec.ts > dashboardCounts > dashboard C3 counts open, in progress, pending and completed this month
Proof: run web | ✓ dashboard.spec.ts > Dashboard > dashboard C3 shows the four cards over every work order whatever the tab or search

**C4** - "Em execução" carries "<n> equipes mobilizadas" ("1 equipe mobilizada", "0 equipes mobilizadas"), n the Teams "Em serviço" by AD-084 - a Team on a `PENDING` service, on a service of a `CANCELLED` WorkOrder or only through a member's own Assignment does not count; no card carries a trend or another note (AC 4)
Proof: run web | ✓ dashboard-summary.spec.ts > mobilizedTeams > dashboard C4 counts the teams em serviço only
Proof: run web | ✓ dashboard.spec.ts > Dashboard > dashboard C4 notes the mobilised teams under em execução and no trend

**C5** - "Agenda de serviços" lists each service at its start and each WorkOrder at its Docagem and Desdocagem, none of a `CANCELLED` WorkOrder, grouped by day (weekday "QUA" and day "18") with only the days that have items, by time within a day; each item shows its time, Vessel name, tag "Serviço" / "Docagem" / "Desdocagem" and beneath "<serviço> · <Staff>" or "<serviço> · Equipe <nome>", "<serviço> · <#code>" with no Responsável, "Docagem · <#code>" and "Desdocagem · <#code>" (AC 5)
Proof: run web | ✓ dashboard-summary.spec.ts > periodItems > dashboard C5 groups the items of the period by day with only the days that have items
Proof: run web | ✓ dashboard-summary.spec.ts > agendaLine > dashboard C5 ends a service with its responsável or the code
Proof: run web | ✓ dashboard.spec.ts > Dashboard > dashboard C5 draws each day and item of the agenda panel

**C6** - The period button opens on "Esta semana" (Monday to Sunday of the current week) and each use alternates "Hoje" (today's items) and "Esta semana", the button after one use as `.specs/features/dashboard-redesign/captures/dashboard-period-today.png`; on Wednesday 2026-11-18 Sunday 23:00 is in the week, the next Monday 00:00 is not, and today 00:00 is in "Hoje" (AC 6)
Proof: run web | ✓ dashboard-summary.spec.ts > periodItems > dashboard C6 keeps monday to sunday for the week and today for hoje
Proof: run web | ✓ dashboard.spec.ts > Dashboard > dashboard C6 alternates esta semana and hoje
Proof: browser - use the period button once at 1440x1114, save `captures/dashboard-period-today.running.png`

**C7** - The Agenda list scrolls inside its panel when the period holds more items than the panel's height in `.specs/features/dashboard-redesign/captures/dashboard.png` shows, and the panel keeps that height; an empty period reads "Nenhum item na agenda hoje." or "Nenhum item na agenda nesta semana." (AC 7)
Proof: run web | ✓ dashboard.spec.ts > Dashboard > dashboard C7 tells an empty today from an empty week
Proof: walk - with more items this week than the panel shows, read the agenda list's `scrollHeight` above its `clientHeight` and the panel's height equal on "Esta semana" and "Hoje"

**C8** - Using an Agenda item opens `/work-orders/:workOrderId` of that item, and the items carry no "Mais opções" (AC 8)
Proof: run web | ✓ dashboard.spec.ts > Dashboard > dashboard C8 opens the work order of an agenda item

**C9** - "Ver agenda completa" opens `/agenda` (AC 9)
Proof: run web | ✓ dashboard.spec.ts > Dashboard > dashboard C9 opens the agenda from ver agenda completa

**C10** - "Equipes em campo" ("Disponibilidade das equipes") lists every Team by name in `pt-BR`, each with its name, "<especialidade> · <n> técnicos" ("1 técnico", "0 técnicos") and "Em serviço" or "Disponível" by AD-084; the list scrolls inside the panel when the Teams are more than the panel's height in `.specs/features/dashboard-redesign/captures/dashboard.png` shows (AC 10)
Proof: run web | ✓ dashboard-summary.spec.ts > teamRows > dashboard C10 lists every team by name with specialty, count and status
Proof: run web | ✓ dashboard.spec.ts > Dashboard > dashboard C10 shows each team of the organization in equipes em campo
Proof: walk - with more Teams than the panel shows, read the team list's `scrollHeight` above its `clientHeight`

**C11** - The panel's footer reads "<n> técnicos ativos" ("1 técnico ativo"), n every Staff of the Organization, beside the initials of the first two Staff by name and "+<n − 2>" past two: 7 → "JP", "RM", "+5"; 2 → two initials; 1 → one; 0 → none (AC 11)
Proof: run web | ✓ dashboard-summary.spec.ts > teamFooter > dashboard C11 counts every staff and shows two initials and the rest
Proof: run web | ✓ dashboard.spec.ts > Dashboard > dashboard C11 shows the technicians footer

**C12** - With no Team "Equipes em campo" reads "Ainda não há equipes cadastradas." above its footer (AC 12)
Proof: run web | ✓ dashboard.spec.ts > Dashboard > dashboard C12 says when there is no team

**C13** - "Mais opções" of "Equipes em campo" opens `/staff?tab=equipes` (AC 13)
Proof: run web | ✓ dashboard.spec.ts > Dashboard > dashboard C13 opens the equipes tab from mais opções

**C14** - "Ordens de serviço" lists only `PENDING` and `IN_PROGRESS` WorkOrders, the nearest Desdocagem first then the `#` code, with the tabs "Todas as ordens" (the count of every open WorkOrder), "Em andamento" and "Pendentes", 5 rows per page: 7 open → "7", pages "1" and "2", "Exibindo 1–5 de 7 ordens" then "Exibindo 6–7 de 7 ordens"; 3 `PENDING` → "Exibindo 1–3 de 3 ordens"; `COMPLETED` and `CANCELLED` on no tab (AC 14)
Proof: run web | ✓ dashboard-summary.spec.ts > openOrders > dashboard C14 keeps the open orders nearest desdocagem first
Proof: run web | ✓ dashboard.spec.ts > Dashboard > dashboard C14 pages the open orders by 5 within each tab

**C15** - "Buscar ordem..." keeps the rows of the tab whose `#` code (with or without "#"), Vessel, Customer or a service name contains the text, case-insensitive, back on page 1 ("#ab12" → `#AB12CD34`, "pintura" → the WorkOrder whose second service is "Pintura do casco"); no match reads "Nenhuma ordem encontrada." as `.specs/features/dashboard-redesign/captures/dashboard-search-empty.png`; a tab goes back to page 1 as `.specs/features/dashboard-redesign/captures/dashboard-tab-em-andamento.png` (AC 15)
Proof: run web | ✓ dashboard.spec.ts > Dashboard > dashboard C15 searches within the tab and goes back to page 1
Proof: browser - pick the tab "Em andamento" at 1440x1000, save `captures/dashboard-tab-em-andamento.running.png`
Proof: browser - search "zzz" at 1440x1000, save `captures/dashboard-search-empty.running.png`

**C16** - Each row shows the teal Vessel avatar, the Vessel name, "<#code> · <Customer>"; the first service's name with "+1 serviço" / "+<n> serviços" or "Nenhum serviço"; "RESPONSÁVEL" of that first service with its initials ("RM" "Rafael Mendes", "A" "Equipe Alfa") or "Sem responsável" (none, only the second service assigned, or no service); "PRAZO" as "Hoje, 14:30", "Amanhã, 09:00" or "20 nov, 10:00"; the badge "Pendente" or "Em andamento" (AC 16)
Proof: run web | ✓ dashboard-summary.spec.ts > responsavelOf > dashboard C16 names the responsável of the first service
Proof: run web | ✓ dashboard.spec.ts > Dashboard > dashboard C16 shows vessel, code, service, responsável, prazo and status in each row

**C17** - "Ações para <#code>" shows "Ver detalhes" (opening `/work-orders/:id`) and, for an `administrator` or `operator`, "Editar" and "Excluir" (AC 17)
Proof: run web | ✓ dashboard.spec.ts > Dashboard > dashboard C17 offers ver detalhes to every role and editar and excluir to writers

**C18** - A writer's "Editar" opens the WorkOrder list's drawer filled with the WorkOrder (each service's "Responsável" for an `administrator`), "Salvar alterações" sends `PUT /api/work-orders/:id`, closes, toasts "Ordem atualizada com sucesso" and shows the new values in the cards, the Agenda panel, "Equipes em campo" and the table without a reload; Team "Alfa" set on an `IN_PROGRESS` first service reads "Equipe Alfa", Alfa "Em serviço" and "1 equipe mobilizada"; an edit opened before the workforce reads answer sends no `services` (AC 18)
Proof: run web | ✓ dashboard.spec.ts > Dashboard > dashboard C18 edits from the row menu and shows the new values
Proof: run web | ✓ dashboard.spec.ts > Dashboard > dashboard C18 an administrator's responsável refreshes the row, the team and the note
Proof: run web | ✓ dashboard.spec.ts > Dashboard > dashboard C18 an edit opened before the workforce reads answer sends no responsável

**C19** - "Excluir" asks in `t-confirmation`; confirming sends `DELETE /api/work-orders/:id`, toasts "Ordem de serviço excluída com sucesso" and drops the WorkOrder from the cards, the Agenda panel and the table and its Assignments from "Equipes em campo" and the note, without a reload (AC 19)
Proof: run web | ✓ dashboard.spec.ts > Dashboard > dashboard C19 deletes after the confirmation and drops the order and its assignments

**C20** - "Exportar" downloads `ordens-de-servico.csv` with `OS,Embarcação,Cliente,Serviço,Docagem,Desdocagem,Status` and one line per row of the tab and search, every page included ("Pendentes" + "aurora" → 2 lines; 7 rows over 2 pages → 8 lines), and is disabled when they hold none (AC 20)
Proof: run web | ✓ dashboard.spec.ts > Dashboard > dashboard C20 exports the rows of the tab and search on every page

**C21** - A writer's "Nova ordem de serviço" opens the WorkOrder list's drawer of `.specs/features/drawer-standard/captures/work-order-drawer.dark.png` with no Vessel chosen, "Responsável" on each service for an `administrator` only; "Criar ordem" sends `POST /api/work-orders` with its services, closes, toasts "Ordem de serviço criada com sucesso" and counts the WorkOrder in the cards, the Agenda panel, the table and, with a Responsável, "Equipes em campo", without a reload (AC 21)
Proof: run web | ✓ dashboard.spec.ts > Dashboard > dashboard C21 creates a work order from the drawer
Proof: run web | ✓ dashboard.spec.ts > Dashboard > dashboard C21 offers responsável to an administrator only
Proof: walk - use "Nova ordem de serviço" and see the drawer of `.specs/features/drawer-standard/captures/work-order-drawer.dark.png` with no Vessel chosen

**C22** - An `inspector` sees no "Nova ordem de serviço", "Editar" or "Excluir", and the same Responsáveis, Teams and statuses as any other Role (AC 22)
Proof: run web | ✓ dashboard.inspector.spec.ts > Dashboard as an inspector > dashboard C22 shows no write control and the same teams and responsáveis

**C23** - While a read loads, the parts that read it show skeletons and no Responsável reads "Sem responsável" before the Staff, Teams and Assignments answer; a failed read toasts once "Erro ao carregar a visão geral" with the API message or "Não foi possível carregar a visão geral." and its parts keep their skeletons instead of "00", "0 equipes mobilizadas", "Sem responsável" or an empty sentence (AC 23)
Proof: run web | ✓ dashboard.spec.ts > Dashboard > dashboard C23 shows skeletons and no sem responsável until the reads answer
Proof: run web | ✓ dashboard.spec.ts > Dashboard > dashboard C23 toasts once and keeps the skeletons when a read fails

**C24** - With no open WorkOrder the table reads "Nenhuma ordem de serviço em aberto." and "Exibindo 0–0 de 0 ordens" with no page button (AC 24)
Proof: run web | ✓ dashboard.spec.ts > Dashboard > dashboard C24 says when no work order is open

**C25** - In the dark theme the page takes the dark tokens as `.specs/features/dashboard-redesign/captures/dashboard-dark.png`, and the card values, Vessel names, Agenda item titles and Team names keep a contrast of at least 4.5:1 against their surface, unlike the capture's faint values (AC 25)
Proof: browser - open `/dashboard` at 1440x1114 in the dark theme, save `captures/dashboard-dark.running.png`
Proof: walk - in the dark theme read the contrast of a card value, a Vessel name, an Agenda item title and a Team name against their surface, each at least 4.5:1

**C26** - At 640, 768, 1024, 1280 and 1536px `/dashboard` has no horizontal page scroll, only the table scrolling inside its panel, unlike `.specs/features/dashboard-redesign/captures/dashboard-375.png`; from 1024px "Agenda de serviços" and "Equipes em campo" sit side by side, below it the cards go two per row and the panels stack Agenda, Equipes, Ordens (AC 26)
Proof: walk - open `/dashboard` at the five widths, compare `scrollWidth` with `innerWidth`, and read the panels' boxes at 1024 and 768

## Coverage

| Set (size) | Member -> proof | Unproven |
| --- | --- | --- |
| reads (6) | `/api/work-orders` C1, C23 · `/api/vessels` C1, C23 · `/api/customers` C1, C23 · `/api/staff` C1, C23 · `/api/teams` C1, C23 · `/api/assignments` C1, C23 | - |
| Roles (3) | `administrator` C1, C18, C21 · `operator` C1, C17, C21 · `inspector` C1, C22 | - |
| greeting rule, AC 2 (7 examples) | 05:00 C2 · 11:59 C2 · 12:00 C2 · 17:59 C2 · 18:00 C2 · 04:59 C2 · "Ana Maria Souza" C2 | - |
| cards rule, AC 3 (3 examples) | the plan's fleet on 2026-11-17 C3 · `CANCELLED` counted nowhere C3 · no WorkOrder C3 | - |
| mobilised Teams rule, AC 4 (4 examples) | Alfa on `IN_PROGRESS` C4 · Bravo on `PENDING` C4 · Charlie on a `CANCELLED` WorkOrder C4 · a member's own Assignment C4 | - |
| Agenda items rule, AC 5 (3 examples) | Docagem, service, Desdocagem under SEG, QUA, SEX C5 · service with no Responsável C5 · `CANCELLED` C5 | - |
| period boundary, AC 6 (3 examples) | Sunday 23:00 C6 · next Monday 00:00 C6 · today 00:00 in "Hoje" C6 | - |
| Team rows rule, AC 10 (3 examples) | Alfa "Motor · 2 técnicos" "Em serviço" C10 · Charlie "1 técnico" "Disponível" C10 · no Staff "0 técnicos" C10 | - |
| footer rule, AC 11 (4 examples) | 7 Staff C11 · 2 C11 · 1 C11 · 0 C11 | - |
| open orders rule, AC 14 (3 examples) | 7 open on two pages C14 · 3 `PENDING` C14 · `COMPLETED` and `CANCELLED` on no tab C14 | - |
| search rule, AC 15 (2 examples) | "#ab12" C15 · "pintura" C15 | - |
| Responsável rule, AC 16 (3 examples) | Staff "Rafael Mendes" C16 · Team "Alfa" C16 · only the second service assigned C16 | - |
| export rule, AC 20 (2 examples) | "Pendentes" + "aurora" C20 · 7 rows over 2 pages C20 | - |
| source controls: `dashboard.png` (12) | "Nova ordem de serviço" C21 · period button C6 · Agenda item C8 · "Ver agenda completa" C9 · "Mais opções" of the Teams C13 · "Exportar" C20 · tab "Todas as ordens" C14 · tab "Em andamento" C14, C15 · "Buscar ordem..." C15 · row menu C17 · page buttons C14 · "Página anterior" / "Próxima página" C14 | - |
| source controls: `dashboard-period-today.png` (1) | period button C6 | - |
| source controls: `dashboard-tab-em-andamento.png` (1) | tab "Em andamento" C15 | - |
| source controls: `dashboard-search-empty.png` (1) | "Buscar ordem..." C15 | - |
| controls the source does not draw (5) | tab "Pendentes" C14 · "Ver detalhes" C17 · "Editar" C18 · "Excluir" and its confirmation C19 · "Responsável" in the drawer C18, C21 | - |
| empty states (4) | "Nenhum item na agenda hoje." C7 · "Nenhum item na agenda nesta semana." C7 · "Ainda não há equipes cadastradas." C12 · "Nenhuma ordem de serviço em aberto." C24 | - |
| widths (5) | 640 C26 · 768 C26 · 1024 C26 · 1280 C26 · 1536 C26 | - |

## Swept

- validation: existing - the drawer's validation is the WorkOrder list's (`work-order-ui` C14-C16, `workforce` C25); the page sends nothing new
- failure modes: C23, C18 (an edit before the workforce reads answer)
- idempotency: n/a - no new write; the drawer and the confirmation call the existing routes
- authorization: C17, C21, C22; existing - `RolesGuard` on the WorkOrder writes and the administrator gate on the Responsável (`workforce` C21)
- concurrency: n/a - the page writes through existing routes and reloads the reads after each write, the last answer wins as on the WorkOrder list
- data lifecycle: C18 (the edit drawer opens with the stored values and Responsáveis), C19 (a deleted WorkOrder takes its Assignments)
- dependency failure: C23
- state transitions: C6 (the period button), C14 (a status decides the tab), C18 (a Responsável turns a Team "Em serviço")
- observability: n/a - the plan sets no logging or metric requirement

## Handoff

- **Settled mid-build:** none
- **Dispatched:** at `96e4288` (diff `334e15a..96e4288`, `proofs.md` at `96e4288`, 47 pass and the 5 pictures awaiting judgement, taken at `6bd121d`, the last code commit): the Verifier (fresh sub-agent); screens round 1 (fresh sub-agent, the 5 pictures against their captures)
- **Boundary:** C1-C26 closed at `6bd121d` (`3a1d6e5` the build, `6bd121d` two fixes the walk found)
- **Abandoned:** none. The `Run web` line is run with `VITEST_MAX_WORKERS=4` in the environment: on this machine (14 GB, swap full, the user's `ng serve` and API in watch on 4200 and 3333) the default 19 workers ran out of memory twice and 31-35 tests of every module timed out at 5 s and cascaded through `TestBed`; with 4 workers the same command passes 403 of 403 in 5 s. The variable only limits Vitest's parallelism; the command and the tests are the project's own
- **Walked:** at `3a1d6e5`, then the pictures again at `6bd121d`, on an isolated stack started for the walk (PostgreSQL, Redis and Mailpit in new containers `dash-walk-pg`, `dash-walk-redis`, `dash-walk-mailpit` on ports 55800, 56800, 51800/58800; the API built from this checkout on 3337; the web production build served on 4303 by a small static server with the dev proxy's rules), seeded through the API with fictional data only, in the week of Monday 16 November 2026 (the walk ran on Wednesday 18 at 08:45, -03): the Teams "Alfa" (Motor), "Bravo" (Hidráulica) and "Charlie" (Elétrica) with 2, 3 and 2 of seven professionals; five Customers and Vessels after the capture's (Santa Maria, Lula Branca, Maré Alta, Estrela do Sul, São Pedro II); six open WorkOrders and one completed on 6 November - Santa Maria in progress until today 14:30 with "Revisão do motor principal" (Alfa, in progress) at 08:30, Lula Branca pending until 16:00 with "Troca do sistema hidráulico" (Bravo, in progress) at 10:00, Maré Alta pending until tomorrow 09:00 with "Inspeção elétrica e sonar" (Rafael Mendes), Estrela do Sul in progress until tomorrow 11:30 with "Manutenção do guincho de rede" (Charlie, pending) at 13:30, São Pedro II and a second Lula Branca next week; the operator "Lucas Costa" and the inspector "Camila Rocha". Headless Chrome (Playwright on `/usr/bin/google-chrome`, the session token in `localStorage`, light theme unless dark) saved each picture at its capture's size, full page: C1 `captures/dashboard.running.png` (1440x1114, operator: "Bom dia, Lucas", "QUARTA-FEIRA, 18 DE NOVEMBRO DE 2026", cards 06 / 02 with "2 equipes mobilizadas" / 04 / 01, QUA 18 with the three services and their Teams, Alfa and Bravo "Em serviço", Charlie "Disponível", "7 técnicos ativos" JP RM +5, five rows of six with "Equipe Alfa", "Equipe Bravo", "Rafael Mendes", "Equipe Charlie"), C6 `captures/dashboard-period-today.running.png` (the period button once: "Hoje", today's five items), C15 `captures/dashboard-tab-em-andamento.running.png` (1440x1000, Santa Maria and Estrela do Sul) and `captures/dashboard-search-empty.running.png` (1440x1000, "zzz": "Nenhuma ordem encontrada."), C25 `captures/dashboard-dark.running.png` (1440x1114, dark). The flows, with clicks and typing: `/` landed on `/dashboard` (C1); the Agenda list measured `scrollHeight` 384 over `clientHeight` 144 and the panel 271.5 px on "Esta semana" and on "Hoje" (C7); the first Agenda item opened `/work-orders/<Santa Maria>` (C8), "Ver agenda completa" `/agenda` (C9), the Teams' "Mais opções" `/staff?tab=equipes` (C13); the tabs read "Todas as ordens 6", "Em andamento", "Pendentes", the pages "Exibindo 1–5 de 6 ordens" then "Exibindo 6–6 de 6 ordens", "Pendentes" "Exibindo 1–4 de 4 ordens" (C14); "Exportar" downloaded `ordens-de-servico.csv` of 7 lines (C20); as the administrator, "Editar" on Santa Maria showed its service's Responsável "Alfa", changed to "Charlie" and saved ("Ordem atualizada com sucesso"): the row read "Equipe Charlie", Alfa turned "Disponível" and Charlie "Em serviço", the note stayed "2 equipes mobilizadas" (C18); "Excluir" with "Confirmar" on the second Lula Branca took "Todas as ordens" from 6 to 5 ("Ordem de serviço excluída com sucesso", C19); "Nova ordem de serviço" opened with no Vessel chosen and created one on Maré Alta with "Limpeza do casco" for Bravo ("Ordem de serviço criada com sucesso"): the cards read 06 / 02 / 04 / 01 and the Agenda "Limpeza do casco · Equipe Bravo" (C21); the row menu read "Ver detalhes Editar Excluir" for the administrator and the operator and "Ver detalhes" for the inspector, the operator's drawer had no "Responsável", the inspector had no "Nova ordem de serviço", and both read the same Responsáveis (C17, C21, C22); with two more Teams the Teams list measured `scrollHeight` 245 over `clientHeight` 147 (C10); in the dark theme a card value, a Vessel name, an Agenda item's Vessel and a Team name each read `rgb(229,237,244)` on `rgb(20,30,41)`, 14.23:1 (C25); at 640, 768, 1024, 1280 and 1536 px `scrollWidth` equals `innerWidth`; at 640 and 768 the cards take two rows and the panels stack Agenda (y 446 / 464), Equipes (717 / 735), Ordens (1005 / 1023); from 1024 the cards take one row and Agenda and Equipes share y 323 (C26). A user reaches the states from the sidebar "Visão geral" (or `/`), the period button, a tab, the search, a row's "Ações para #…", "Nova ordem de serviço" and the theme button. Seen in the walk and fixed at `6bd121d`: the greeting's sun was drawn in the text colour (the icon took no colour from its own class), and a fourth Agenda item showed cut at the bottom of the list; every picture was retaken after the fix. The stack was stopped and its containers removed after the walk
