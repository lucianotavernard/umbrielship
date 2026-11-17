# Customer UI redesign after mareos verification

**Verdict**: FAIL
**Proofs**: `proofs.md` at 2c92fae (HEAD 3b4c083 adds only spec documents)
**Verifier**: independent sub-agent (author != verifier)

Diff reviewed: `34f79a9..3b4c083`. The full web suite (`ng test`, 36 files, 155 tests) passes at HEAD, so the modules outside the `Run web` includes (Organizations, WorkOrder, inspection templates) did not break on the new `t-sheet`, palette or `work-order-list-ui`. Own examples (V1-V10) ran at HEAD as throwaway specs under `web/src`, then were deleted.

## Checks

| Check | Test | Holds |
| --- | --- | --- |
| C1 | `app-shell.spec.ts` `customer-ui C1 renders the sidebar and the topbar around the page and no header of links` | yes |
| C2 | `app-shell.spec.ts` `customer-ui C2 lists four items for an operator and Organizações under GESTÃO only for the internal Administrator` | yes - operator, internal Administrator and client Administrator; own example V5 (inspector of the internal Organization -> four items, no GESTÃO) passes |
| C3 | grep proof over `web/src/styles.css` (light tokens, `font-size: 13px`) | no - checks 15 of the 21 light tokens of Landing door 3, anywhere in the file rather than inside `:root` (finding 5) |
| C4 | `app-shell.spec.ts` `customer-ui C4 the theme button switches to dark, says Ativar tema claro and keeps the choice`; `theme.spec.ts` `customer-ui C4 applies the saved theme before boot`; awk grep over `.dark` | no - the toggle and the restore before boot hold; the dark grep checks 10 of the 20 dark tokens (finding 5) |
| C5 | `app-shell.spec.ts` `customer-ui C5 the breadcrumb and the active item follow the route` | yes - table over all ten URLs, breadcrumb text and the single `aria-current="page"` |
| C6 | `app-shell.spec.ts` `customer-ui C6 the Organization menu lists each Membership with its initials, name and Role and checks the active one` | yes |
| C7 | `internal-layout.spec.ts` `[C85] posts the picked organization and reloads`; `app-shell.spec.ts` `customer-ui C7 picking the active Organization posts nothing and closes the menu` | yes |
| C8 | `app-shell.spec.ts` `customer-ui C8 the profile shows the user and Sair signs out to /auth` | yes |
| C9 | `app-shell.spec.ts` `customer-ui C9 on a phone Abrir menu opens the sidebar and a menu item closes it` | no - picks a route other than the open one; picking the open page's item leaves the panel open (finding 4) |
| C10 | `app-shell.spec.ts` `customer-ui C10 shows no workshop status, help, notifications or MARÉOS footer` | yes |
| C11 | walk - five widths x four pages, `scrollWidth` against `innerWidth` | yes - recorded as walked in `proofs.md`; not re-walked by the Verifier |
| C56 | `app-shell.spec.ts` `customer-ui C56 Recolher menu collapses the sidebar and keeps the choice` | yes |
| C12 | `customer-list.spec.ts` `customer-ui C12 requests GET /api/customers once with no page and shows the new subtitle` | yes - asserts `urlWithParams` is `/api/customers` |
| C13 | `fetch-customers.use-case.spec.ts` `customer-ui C13 returns every customer of the Organization with its vessel count when no page is given`; `customer.http.spec.ts` `customer-ui C13 answers every customer with vesselCount without page and 10 with page 1`; `customer.http.spec.ts` `customer-ui C13 answers 401 without a token`; `customer.repository.spec.ts` `customer-ui C13 asks for every customer with its vessel count when no page is given` | yes - 23 / 23, 0 and 2 Vessels, another Organization's same email absent, `page=1` -> 10, Prisma `_count` shape |
| C14 | `api-smoke.sh` `customer-ui C14 vesselCount with no vessel` / `with two vessels` / `after a vessel delete` | yes - real PostgreSQL through `GET /customers` without `page` |
| C15 | `customer-list.spec.ts` `customer-ui C15 sorts customers by name in pt-BR` | yes - a code-point sort fails it; own example V6 (çaravela, Casa, Élan, elba, Ema, Zé) passes |
| C16 | `customer-list.spec.ts` `customer-ui C16 counts customers, vessels, emails and phones over every customer` | yes - 08/11/08/03 kept under a search, 120; own example V6 (no Customer -> 00 x4) passes |
| C17 | `customer-list.spec.ts` `customer-ui C17 filters by name, email, phone, city and state without a request` | yes - five fields, footer, `controller.verify()` proves no request |
| C18 | `customer-list.spec.ts` `customer-ui C18 shows each row with the fallbacks of the source` | yes |
| C19 | `customer-list.spec.ts` `customer-ui C19 says Ainda não há clientes cadastrados and Nenhum cliente encontrado para essa busca` | yes |
| C20 | `customer-list.spec.ts` `customer-ui C20 shows skeleton rows while loading and a toast when the load fails` | yes |
| C21 | `customer-list.spec.ts` `customer-ui C21 Novo cliente opens the drawer, Cadastrar cliente posts and shows the customer`; `customer-ui C21 Cancelar and Fechar cadastro close the drawer without a request` | yes |
| C22 | `customer-list.spec.ts` `customer-ui C22 Editar opens the Customer's values and Salvar alterações puts them` | no - opens the drawer once; a second "Editar" after "Cancelar" shows the cancelled values (finding 1) |
| C23 | `customer-list.spec.ts` `customer-ui C23 a 409 keeps the drawer open with the values and toasts the message` | yes |
| C24 | `customer-list.spec.ts` `customer-ui C24 Excluir deletes only after the confirmation and drops the row`; `customer-ui C24 a refused delete keeps the row and toasts the message` | yes |
| C25 | `customer-list.spec.ts` `customer-ui C25 Ver detalhes links to the customer` | yes |
| C26 | `customer-list.inspector.spec.ts` `customer-ui C26 renders no write control for an inspector` | yes |
| C27 | `customer-detail.spec.ts` `customer-ui C27 requests the vessels with no page and shows the profile without Editar, Nova embarcação or map` | yes |
| C28 | `customer-detail.spec.ts` `customer-ui C28 the breadcrumb links Clientes and names the customer` | yes |
| C29 | `customer-detail.spec.ts` `customer-ui C29 shows the contact, the address and the location` | yes |
| C30 | `customer-detail.spec.ts` `customer-ui C30 lists every vessel with its type and links it`; `customer-ui C30 says Nenhuma embarcação vinculada a este cliente` | yes |
| C31 | `customer-detail.spec.ts` `customer-ui C31 Excluir deletes the vessel after the confirmation and lowers the count` | yes |
| C32 | `customer-detail.spec.ts` `customer-ui C32 a 404 shows Cliente não encontrado with a link back` | yes |
| C33 | `customer-detail.inspector.spec.ts` `customer-ui C33 renders no write control for an inspector` | yes |
| C34 | `vessel-list.spec.ts` `customer-ui C34 requests vessels and customers with no page and shows Total na frota` | yes |
| C35 | `fetch-vessels.use-case.spec.ts` `customer-ui C35 returns every vessel of the Organization when no page is given`; `vessel.http.spec.ts` `customer-ui C35 answers every vessel without page and 10 with page 1`; `vessel.http.spec.ts` `customer-ui C35 answers 401 without a token`; `vessel.repository.spec.ts` `customer-ui C35 asks for every vessel when no page is given` | yes |
| C36 | `vessel-list.spec.ts` `customer-ui C36 sorts by name and shows IMO, type, length and the customer` | yes |
| C37 | `vessel-list.spec.ts` `customer-ui C37 filters by name, customer, IMO and type and Limpar busca empties it` | yes - own example V8 ("OUTR" over a type label and a Customer name, a Vessel whose Customer is missing) passes |
| C38 | `vessel-list.spec.ts` `customer-ui C38 selects every shown row, goes indeterminate and keeps the selection across a search` | yes |
| C39 | `vessel-list.spec.ts` `customer-ui C39 Exportar is disabled with no selection and counts the selection` | yes |
| C40 | `vessel-csv.spec.ts` `customer-ui C40 writes the header and one quoted line per vessel with BOM and CRLF`; `customer-ui C40 guards formulas and doubles quotes`; `vessel-list.spec.ts` `customer-ui C40 Exportar downloads embarcacoes.csv with every selected vessel, hidden ones included` | yes - own example V7 (tab-led formula, newline inside a name, 1234.56 -> "1.234,6") passes |
| C41 | `vessel-list.spec.ts` `customer-ui C41 Nova embarcação lists every customer and Salvar embarcação posts the vessel` | yes |
| C42 | `vessel-list.spec.ts` `customer-ui C42 Editar embarcação opens the values without customer and IMO and puts the change` | no - opens the drawer once; a second "Editar embarcação" after "Cancelar" shows the cancelled values (finding 1) |
| C43 | `vessel-list.spec.ts` `customer-ui C43 Excluir embarcação deletes after the confirmation and drops the row and its selection` | yes |
| C44 | `vessel-list.spec.ts` `customer-ui C44 a 409 keeps the drawer open with the values and toasts the message` | yes |
| C45 | `vessel-list.inspector.spec.ts` `customer-ui C45 renders no write control and keeps the export for an inspector` | yes |
| C46 | `vessel-detail.spec.ts` `customer-ui C46 shows the FROTA profile and Voltar à frota links to /vessels` | yes |
| C47 | `vessel-detail.spec.ts` `customer-ui C47 shows the IMO number and the length in pt-BR` | yes |
| C48 | `vessel-detail.spec.ts` `customer-ui C48 Editar saves the vessel and shows the new values` | no - opens the drawer once; a second "Editar" after "Cancelar" shows the cancelled values (finding 1) |
| C49 | `vessel-detail.spec.ts` `customer-ui C49 lists the work orders with the code and the long dates`; `customer-ui C49 says Nenhuma ordem vinculada when there is none` | no - the fixture's 12:00Z reads the same day in every zone, so the UTC formatting the diff added passes it (finding 3) |
| C50 | `vessel-detail.spec.ts` `customer-ui C50 Nova ordem posts the work order and lists it` | yes |
| C51 | `vessel-detail.spec.ts` `customer-ui C51 deletes a work order only after Confirmar and drops the row` | yes |
| C52 | `vessel-detail.spec.ts` `customer-ui C52 pages the work orders ten at a time` | no - proves 11 -> 10 + 1 only; the plan's "10 -> one page" is not asserted, and going from 11 to 10 by a delete on page 2 strands the page (finding 2) |
| C53 | `vessel-detail.spec.ts` `customer-ui C53 the customer panel shows the contact and Ver cliente` | yes |
| C54 | `vessel-detail.spec.ts` `customer-ui C54 a 404 shows Embarcação não encontrada with a link back` | yes |
| C55 | `vessel-detail.inspector.spec.ts` `customer-ui C55 renders no write control for an inspector` | yes |

## Findings

| Finding | Evidence | Fix | Closed |
| --- | --- | --- | --- |
| 1. Editing the same record again after "Cancelar" opens the drawer with the cancelled typed values, not the record's values (AC 22, 42, 48) | V1 (`Editar Atlantic` -> type -> Cancelar -> `Editar Atlantic`): `expected 'Typed and cancelled' to be 'Atlantic'`; V2 (vessel list) and V10 (Vessel detail): `expected 'Typed and cancelled' to be 'Aurora'`. `closeSheet()` keeps `editing()` (customer-list.ts:106, vessel-list.ts:121) and the detail binds `[vessel]="vessel()"`, so the input never changes and the form's `effect` on `customer()` / `vessel()` does not run again; C22, C42 and C48 open the drawer once | refill the form on every open (call the form's fill from `openEdit` / `openEditVesselSheet`, or clear `editing` on close), and add Editar -> type -> Cancelar -> Editar to C22, C42 and C48 | |
| 2. Deleting the only WorkOrder of page 2 (11 -> 10) leaves the Vessel detail on an empty page 2 that says "Nenhuma ordem vinculada" with no pager back, while the Vessel still has 10 WorkOrders (AC 49, 51, 52) | V3: after the delete and the reload of `skip=10` (`[]`, total 10) the page shows `orders-empty` and no `t-pagination`. The diff hides the pager at `total <= 10` (vessel-detail.html:102) and moved its `ng-content` into the non-empty branch (work-order-list.ts:102); before, it was always rendered. `deleteWorkOrder` never moves `page` back. C52 never asserts "10 -> one page" | after a delete clamp `page` to `Math.max(1, Math.ceil(total / 10))` (or step back when the reloaded page is empty), and test 11 -> page 2 -> delete -> page 1 with 10 rows and no pager, plus 10 WorkOrders -> no pager | |
| 3. The Vessel detail now prints WorkOrder dates in UTC, so a docking entered late in the evening in Brazil shows the next day, and disagrees with the WorkOrder page (AC 49) | V9 with `TZ=America/Sao_Paulo`: `new Date('2026-11-10T22:00').toISOString()` (what `work-order-form` posts) renders `11 de novembro de 2026` in `work-order-list-ui`; the diff added `: 'UTC'` to both date pipes (work-order-list.ts:62, 68) while `work-order-detail.ts:93` still formats in local time. C49's fixture is `12:00Z`, the same day in every zone | drop the `'UTC'` argument as before the diff, and give C49 a fixture near midnight local time | |
| 4. On a phone, picking the menu item of the page already open leaves the sidebar panel open (AC 9) | V4: on `/customers`, "Abrir menu" then "Clientes" -> `openMobile()` stays `true`; the panel closes only on `NavigationEnd` (internal-layout.ts:342-351), which a same-URL navigation does not emit. C9 starts from `/` and picks another route | close the panel on the menu link's click (or on `NavigationSkipped` as well), and test picking the open page's item | |
| 5. The token proofs of C3 and C4 check a subset of Landing door 3, so a wrong value in 16 tokens stays green | C3's grep covers 15 of 21 light tokens, anywhere in `styles.css` (not inside `:root`), missing `--card`, `--popover`, `--secondary-foreground`, `--accent-foreground`, `--input`, `--sidebar-border`; C4's awk covers 10 of 20 dark tokens, missing `--popover`, `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--muted`, `--accent`, `--accent-foreground`, `--destructive`, `--input`, `--ring`. Every value in `styles.css` matches the plan today (checked by hand; built CSS has `--default-font-family: Arial, Helvetica, sans-serif` and `body{...font-size:13px}`) | grep every token of door 3, the light ones inside the `:root` block and the dark ones inside `.dark` | |
| 6. The diff deletes `inspection-layout.spec.ts`, the only test of inspection AC 32 (the layout header scrolls with the page below 640 px); the new topbar is not sticky, so the rule holds today with no test guarding it | `git diff 34f79a9..HEAD` removes `web/src/package/work-order/inspection/__test__/inspection-layout.spec.ts`; no check of this plan names the rule; `checks.md` `Run web` still includes the deleted path | add an `app-shell.spec.ts` assertion that the topbar carries no `sticky` below `sm`, and drop the dead include from `Run web` | |
