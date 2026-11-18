# dashboard-redesign proofs

**HEAD**: 38b964d
**Tree**: clean
**Shell**: /bin/sh
**Result**: 55 pass, 0 fail

| Check | Proof | Result |
| --- | --- | --- |
| C1 | `run web / ✓ dashboard.spec.ts > Dashboard > dashboard C1 requests the six reads once with no paging for every ` | pass |
| C1 | `browser - open /dashboard at 1440x1114 as an operator, save captures/dashboard.running.png` | pass |
| C1 | `walk - open / signed in and land on /dashboard` | pass (Walked) |
| C2 | `run web / ✓ dashboard-summary.spec.ts > greeting > dashboard C2 greets by the hour with the sun or the moon` | pass |
| C2 | `run web / ✓ dashboard-summary.spec.ts > firstName > dashboard C2 takes the first word of the name` | pass |
| C2 | `run web / ✓ dashboard-summary.spec.ts > dateKicker > dashboard C2 writes today in pt-BR upper-case` | pass |
| C2 | `run web / ✓ dashboard.spec.ts > Dashboard > dashboard C2 opens with the date, the greeting and the subtitle` | pass |
| C3 | `run web / ✓ dashboard-summary.spec.ts > dashboardCounts > dashboard C3 counts open, in progress, pending and c` | pass |
| C3 | `run web / ✓ dashboard.spec.ts > Dashboard > dashboard C3 shows the four cards over every work order whatever t` | pass |
| C4 | `run web / ✓ dashboard-summary.spec.ts > mobilizedTeams > dashboard C4 counts the teams em serviço only` | pass |
| C4 | `run web / ✓ dashboard.spec.ts > Dashboard > dashboard C4 notes the mobilised teams under em execução and no tr` | pass |
| C5 | `run web / ✓ dashboard-summary.spec.ts > periodItems > dashboard C5 groups the items of the period by day with ` | pass |
| C5 | `run web / ✓ dashboard-summary.spec.ts > agendaLine > dashboard C5 ends a service with its responsável or the c` | pass |
| C5 | `run web / ✓ dashboard.spec.ts > Dashboard > dashboard C5 draws each day and item of the agenda panel` | pass |
| C6 | `run web / ✓ dashboard-summary.spec.ts > periodItems > dashboard C6 keeps monday to sunday for the week and tod` | pass |
| C6 | `run web / ✓ dashboard.spec.ts > Dashboard > dashboard C6 alternates esta semana and hoje` | pass |
| C6 | `browser - use the period button once at 1440x1114, save captures/dashboard-period-today.running.png` | pass |
| C7 | `run web / ✓ dashboard.spec.ts > Dashboard > dashboard C7 tells an empty today from an empty week` | pass |
| C7 | `walk - with more items this week than the panel shows, read the agenda list's scrollHeight above its clientHei` | pass (Walked) |
| C8 | `run web / ✓ dashboard.spec.ts > Dashboard > dashboard C8 opens the work order of an agenda item` | pass |
| C9 | `run web / ✓ dashboard.spec.ts > Dashboard > dashboard C9 opens the agenda from ver agenda completa` | pass |
| C10 | `run web / ✓ dashboard-summary.spec.ts > teamRows > dashboard C10 lists every team by name with specialty, coun` | pass |
| C10 | `run web / ✓ dashboard.spec.ts > Dashboard > dashboard C10 shows each team of the organization in equipes em ca` | pass |
| C10 | `walk - with more Teams than the panel shows, read the team list's scrollHeight above its clientHeight` | pass (Walked) |
| C11 | `run web / ✓ dashboard-summary.spec.ts > teamFooter > dashboard C11 counts every staff and shows two initials a` | pass |
| C11 | `run web / ✓ dashboard.spec.ts > Dashboard > dashboard C11 shows the technicians footer` | pass |
| C12 | `run web / ✓ dashboard.spec.ts > Dashboard > dashboard C12 says when there is no team` | pass |
| C13 | `run web / ✓ dashboard.spec.ts > Dashboard > dashboard C13 opens the equipes tab from mais opções` | pass |
| C14 | `run web / ✓ dashboard-summary.spec.ts > openOrders > dashboard C14 keeps the open orders nearest desdocagem fi` | pass |
| C14 | `run web / ✓ dashboard.spec.ts > Dashboard > dashboard C14 pages the open orders by 5 within each tab` | pass |
| C15 | `run web / ✓ dashboard.spec.ts > Dashboard > dashboard C15 searches within the tab and goes back to page 1` | pass |
| C15 | `browser - pick the tab "Em andamento" at 1440x1000, save captures/dashboard-tab-em-andamento.running.png` | pass |
| C15 | `browser - search "zzz" at 1440x1000, save captures/dashboard-search-empty.running.png` | pass |
| C16 | `run web / ✓ dashboard-summary.spec.ts > responsavelOf > dashboard C16 names the responsável of the first servi` | pass |
| C16 | `run web / ✓ dashboard.spec.ts > Dashboard > dashboard C16 shows vessel, code, service, responsável, prazo and ` | pass |
| C17 | `run web / ✓ dashboard.spec.ts > Dashboard > dashboard C17 offers ver detalhes to every role and editar and exc` | pass |
| C18 | `run web / ✓ dashboard.spec.ts > Dashboard > dashboard C18 edits from the row menu and shows the new values` | pass |
| C18 | `run web / ✓ dashboard.spec.ts > Dashboard > dashboard C18 an administrator's responsável refreshes the row, th` | pass |
| C18 | `run web / ✓ dashboard.spec.ts > Dashboard > dashboard C18 an edit opened before the workforce reads answer sen` | pass |
| C19 | `run web / ✓ dashboard.spec.ts > Dashboard > dashboard C19 deletes after the confirmation and drops the order a` | pass |
| C20 | `run web / ✓ dashboard.spec.ts > Dashboard > dashboard C20 exports the rows of the tab and search on every page` | pass |
| C21 | `run web / ✓ dashboard.spec.ts > Dashboard > dashboard C21 creates a work order from the drawer` | pass |
| C21 | `run web / ✓ dashboard.spec.ts > Dashboard > dashboard C21 offers responsável to an administrator only` | pass |
| C21 | `walk - use "Nova ordem de serviço" and see the drawer of .specs/features/drawer-standard/captures/work-order-d` | pass (Walked) |
| C22 | `run web / ✓ dashboard.inspector.spec.ts > Dashboard as an inspector > dashboard C22 shows no write control and` | pass |
| C23 | `run web / ✓ dashboard.spec.ts > Dashboard > dashboard C23 shows skeletons and no sem responsável until the rea` | pass |
| C23 | `run web / ✓ dashboard.spec.ts > Dashboard > dashboard C23 toasts once and keeps the skeletons when a read fail` | pass |
| C23 | `run web / ✓ dashboard.spec.ts > Dashboard > dashboard C23 toasts once when several reads fail at once or one a` | pass |
| C24 | `run web / ✓ dashboard.spec.ts > Dashboard > dashboard C24 says when no work order is open` | pass |
| C25 | `browser - open /dashboard at 1440x1114 in the dark theme, save captures/dashboard-dark.running.png` | pass |
| C25 | `walk - in the dark theme read the contrast of a card value, a Vessel name, an Agenda item title and a Team nam` | pass (Walked) |
| C26 | `walk - open /dashboard at the five widths, compare scrollWidth with innerWidth, and read the panels' boxes at ` | pass (Walked) |
| C27 | `run web / ✓ dashboard.spec.ts > Dashboard > dashboard C27 falls back to the last page left after a delete or a` | pass |
| C27 | `run web / ✓ dashboard.spec.ts > Dashboard > dashboard C27 shows every open order after a create` | pass |
| Build | `cd web && npm run build` | pass |

## Output

`Run web` - exit 0

```
 ✓  web  src/package/workforce/staff/__test__/staff-status.spec.ts > teamStatus > workforce C30 derives em serviço from its own service in progress only 0ms
 ✓  web  src/package/customer/vessel/__test__/vessel-csv.spec.ts > vesselsCsv > customer-ui C40 writes the header and one quoted line per vessel with BOM and CRLF 1ms
 ✓  web  src/package/customer/vessel/__test__/vessel-csv.spec.ts > vesselsCsv > customer-ui C40 guards formulas and doubles quotes 0ms
 ✓  web  src/package/workforce/staff/__test__/staff-allocations.spec.ts > openAllocations > workforce C32 lists the open services of the staff and its team by start 1ms
 ✓  web  src/package/work-order/agenda/__test__/agenda-week.spec.ts > agendaItems > work-order-ui C59 places services and dockings, clamps the rows and hides cancelled orders 0ms
 ✓  web  src/package/work-order/agenda/__test__/agenda-week.spec.ts > weekLabel > work-order-ui C61 reads one month or the cross month range 0ms
 ✓  web  src/package/shared/components/lib/__test__/theme.spec.ts > restoreTheme > customer-ui C4 applies the saved theme before boot 0ms
 ✓  web  src/package/workforce/staff/__test__/staff-csv.spec.ts > staffCsv > workforce C13 writes the header and one line per staff with sem equipe 0ms
 ✓  web  src/package/work-order/inspection-assignment/__test__/inspection-availability.spec.ts > inspectionBlockedReason > work-order-ui C42 blocks on the work order and then on the target service 0ms
 ✓  web  src/package/work-order/work-order/__test__/work-order-csv.spec.ts > workOrderCsv > work-order-ui C13 writes the header, the Aurora line, a guarded formula and doubled quotes 0ms

 Test Files  62 passed (62)
      Tests  406 passed (406)
   Start at  09:21:23
   Duration  6.42s (transform 1.75s, setup 1.05s, import 2.88s, tests 19.29s, environment 28.06s)
```
