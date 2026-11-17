# Customer UI redesign after mareos checks

Build: `cd api && npm run lint`; `cd api && npm run build`; `cd web && npm run build`
Run api: `cd api && npx vitest run --reporter=verbose src/package/customer`
Run smoke: `bash api/test/smoke/api-smoke.sh`
Run web: `cd web && npx ng test --watch=false --reporters=verbose --include='**/customer/**/*.spec.ts' --include='**/shared/**/*.spec.ts' --include='**/identity/authentication/**/*.spec.ts' --include='**/work-order/inspection-template/__test__/inspection-template-menu.spec.ts'`
Plan: `.specs/features/customer-ui-redesign/plan.md`

56 checks in 5 slices (C1-C55, C57; C56 withdrawn, AD-031) · 3 one-way doors · 0 open, of which 0 block

## Checks

### S1 - Every authenticated page sits in the mareos shell and palette

**C1** - The authenticated layout renders the sidebar and the topbar around the routed page and no top header of links; the shell matches `.specs/features/customer-ui-redesign/captures/customer-list.png` (AC 1)
Proof: run web | ✓ app-shell.spec.ts > Shell > customer-ui C1 renders the sidebar and the topbar around the page and no header of links
Proof: browser - open `/customers` at 1440x1250 as an operator, save `captures/customer-list.running.png`

**C2** - The sidebar shows the brand "UMBRIELSHIP", "MENU PRINCIPAL" with Visão geral, Embarcações, Clientes, Modelos de inspeção linking to `/dashboard`, `/vessels`, `/customers`, `/inspection-templates`, and "GESTÃO" with Organizações only for an internal Administrator (AC 2)
Proof: run web | ✓ app-shell.spec.ts > Shell > customer-ui C2 lists four items for an operator and Organizações under GESTÃO only for the internal Administrator

**C3** - `styles.css` sets every light token of Landing door 3 inside `:root`, Arial on `--font-sans` and 13px on the body (AC 3)
Proof: `cd web/src && awk '/^:root \{/,/^\}/' styles.css > /tmp/light-$$.css && for t in '--background: #f7f8fa' '--foreground: #17283b' '--card: #fff' '--popover: #fff' '--primary: #087f8c' '--primary-foreground: #fff' '--secondary: #edf4f5' '--secondary-foreground: #1c5961' '--muted: #f2f5f7' '--muted-foreground: #7b8794' '--accent: #edf4f5' '--accent-foreground: #1c5961' '--destructive: #bd5550' '--border: #e9edf0' '--input: #e9edf0' '--ring: #087f8c' '--radius: 0.65rem' '--sidebar: #fff' '--sidebar-accent: #eaf4f4' '--sidebar-accent-foreground: #087f8c' '--sidebar-border: #e9edf0'; do grep -qF -- "$t;" /tmp/light-$$.css || { echo "missing $t"; exit 1; }; done && grep -qF -- '--font-sans: Arial, Helvetica, sans-serif;' styles.css && awk '/^  body \{/,/^  \}/' styles.css | grep -qF 'font-size: 13px;'`

**C4** - The theme button toggles the dark tokens, writes `@umbriel:theme`, the saved choice is applied before the app boots, and the dark sidebar and names follow AD-030, matching `.specs/features/customer-ui-redesign/captures/customer-list-dark.jpg` except `## Differences from the source` (AC 4)
Proof: run web | ✓ app-shell.spec.ts > Shell > customer-ui C4 the theme button switches to dark, says Ativar tema claro and keeps the choice
Proof: run web | ✓ theme.spec.ts > restoreTheme > customer-ui C4 applies the saved theme before boot
Proof: `cd web/src && awk '/^\.dark \{/,/^\}/' styles.css > /tmp/dark-$$.css && for t in '--background: #0c131b' '--foreground: #e5edf4' '--card: #141e29' '--popover: #141e29' '--primary: #2da9ad' '--primary-foreground: #071216' '--secondary: #1b2c37' '--secondary-foreground: #b7e5e0' '--muted: #1a2632' '--muted-foreground: #9aaab8' '--accent: #1b2c37' '--accent-foreground: #b7e5e0' '--destructive: #e17670' '--border: #293847' '--input: #293847' '--ring: #2da9ad' '--sidebar: #141e29' '--sidebar-accent: #1b343a' '--sidebar-accent-foreground: #65d0c7' '--sidebar-border: #293847'; do grep -qF -- "$t;" /tmp/dark-$$.css || { echo "missing $t"; exit 1; }; done`
Proof: browser - open `/customers` at 1440x1000 in the dark theme, save `captures/customer-list-dark.running.png`

**C5** - The topbar reads "Operação" > the section of each route and the matching menu item carries `aria-current="page"` (AC 5)
Proof: run web | ✓ app-shell.spec.ts > Shell > customer-ui C5 the breadcrumb and the active item follow the route

**C6** - "Selecionar organização" opens "Trocar organização" with each Membership's initials, name and Role label, the active one checked, as `.specs/features/customer-ui-redesign/captures/shell-organization-menu.png` draws (AC 6)
Proof: run web | ✓ app-shell.spec.ts > Shell > customer-ui C6 the Organization menu lists each Membership with its initials, name and Role and checks the active one
Proof: browser - open the menu on `/customers` at 1440x1000, save `captures/shell-organization-menu.running.png` (the region 0,0-720,500)

**C7** - Picking another Organization posts `POST /api/organizations/switch` and reloads; picking the active one only closes the menu (AC 7)
Proof: run web | ✓ internal-layout.spec.ts > InternalLayout > [C85] posts the picked organization and reloads
Proof: run web | ✓ app-shell.spec.ts > Shell > customer-ui C7 picking the active Organization posts nothing and closes the menu

**C8** - The sidebar footer shows the user's initials, name and Role label; "..." then "Sair" signs out and navigates to `/auth` (AC 8)
Proof: run web | ✓ app-shell.spec.ts > Shell > customer-ui C8 the profile shows the user and Sair signs out to /auth

**C9** - On a narrow window the sidebar is hidden, "Abrir menu" slides it in, and picking a menu item closes it and navigates (AC 9)
Proof: run web | ✓ app-shell.spec.ts > Shell > customer-ui C9 on a phone Abrir menu opens the sidebar and a menu item closes it
Proof: run web | ✓ app-shell.spec.ts > Shell > customer-ui C9 picking the open page item closes the panel too

**C10** - The shell shows none of "Oficina em operação", a help button, a notifications bell or the MARÉOS footer (AC 10)
Proof: run web | ✓ app-shell.spec.ts > Shell > customer-ui C10 shows no workshop status, help, notifications or MARÉOS footer

**C11** - At 640, 768, 1024, 1280 and 1536px wide, `/customers`, `/customers/:id`, `/vessels` and `/vessels/:id` have `scrollWidth` equal to the window width - unlike the overflow `.specs/features/customer-ui-redesign/captures/customer-list-375.jpg` shows (AC 11)
Proof: walk - at each of the five widths open the four pages and read `document.documentElement.scrollWidth` against `innerWidth`

**C57** - The topbar scrolls with the page: no unprefixed `sticky` or `fixed`, so below 640 px it never covers the page (inspection AC 32, whose spec left with the old header; appended from Verifier finding 6)
Proof: run web | ✓ app-shell.spec.ts > Shell > customer-ui C57 the topbar scrolls with the page below 640 px

### S2 - Customers on one page, searched as the user types

**C12** - `/customers` requests `GET /api/customers` once with no `page` and the page matches `.specs/features/customer-ui-redesign/captures/customer-list.png` except `## Differences from the source` (AC 12)
Proof: run web | ✓ customer-list.spec.ts > CustomerList > customer-ui C12 requests GET /api/customers once with no page and shows the new subtitle
Proof: browser - open `/customers` at 1440x1250 as an operator, save `captures/customer-list.running.png`

**C13** - `GET /customers` without `page` answers 200 with every Customer of the session's Organization, `total` their number and `vesselCount` on each; with `page=1` 10; with no token 401 (AC 13)
Proof: run api | ✓ fetch-customers.use-case.spec.ts > FetchCustomersUseCase > customer-ui C13 returns every customer of the Organization with its vessel count when no page is given
Proof: run api | ✓ customer.http.spec.ts > GET /customers > customer-ui C13 answers every customer with vesselCount without page and 10 with page 1
Proof: run api | ✓ customer.http.spec.ts > GET /customers > customer-ui C13 answers 401 without a token
Proof: run api | ✓ customer.repository.spec.ts > PrismaCustomersRepository > customer-ui C13 asks for every customer with its vessel count when no page is given

**C14** - `vesselCount` equals the Vessels of that Customer in PostgreSQL: 0, then 2, then 1 after a delete (AC 14)
Proof: run smoke | ok   customer-ui C14 vesselCount with no vessel (0)
Proof: run smoke | ok   customer-ui C14 vesselCount with two vessels (2)
Proof: run smoke | ok   customer-ui C14 vesselCount after a vessel delete (1)

**C15** - The Customer list is sorted by name with `localeCompare(…, 'pt-BR')` (AC 15)
Proof: run web | ✓ customer-list.spec.ts > CustomerList > customer-ui C15 sorts customers by name in pt-BR

**C16** - The four metrics count every Customer, never the search result, padded to two digits (AC 16)
Proof: run web | ✓ customer-list.spec.ts > CustomerList > customer-ui C16 counts customers, vessels, emails and phones over every customer

**C17** - Typing in the search filters by name, email, phone, city or state, case-insensitive, with no request, and the footer reads "Exibindo <shown> de <all> clientes" (AC 17)
Proof: run web | ✓ customer-list.spec.ts > CustomerList > customer-ui C17 filters by name, email, phone, city and state without a request

**C18** - Each row shows the initials, the name link, street, email, phone, location and vessel count with the fallbacks of the source (AC 18)
Proof: run web | ✓ customer-list.spec.ts > CustomerList > customer-ui C18 shows each row with the fallbacks of the source

**C19** - An Organization with no Customer says "Ainda não há clientes cadastrados."; a search with no match says "Nenhum cliente encontrado para essa busca." (AC 19)
Proof: run web | ✓ customer-list.spec.ts > CustomerList > customer-ui C19 says Ainda não há clientes cadastrados and Nenhum cliente encontrado para essa busca

**C20** - While loading the table shows skeleton rows; a failed load shows an error toast with the API message (AC 20)
Proof: run web | ✓ customer-list.spec.ts > CustomerList > customer-ui C20 shows skeleton rows while loading and a toast when the load fails

**C21** - "Novo cliente" opens the drawer of `.specs/features/customer-ui-redesign/captures/customer-drawer.jpg` without the logo field and with "Estado (UF) *" as a select; "Cadastrar cliente" posts the body, closes and shows the toast and the row; "Cancelar" and "Fechar cadastro" close without a request (AC 21)
Proof: run web | ✓ customer-list.spec.ts > CustomerList > customer-ui C21 Novo cliente opens the drawer, Cadastrar cliente posts and shows the customer
Proof: run web | ✓ customer-list.spec.ts > CustomerList > customer-ui C21 Cancelar and Fechar cadastro close the drawer without a request
Proof: browser - open "Novo cliente" on `/customers` at 1440x1000, save `captures/customer-drawer.running.png`

**C22** - "Editar <name>" opens "Editar cliente" with the Customer's values and "Salvar alterações"; saving puts the body, closes, toasts "Cliente atualizado com sucesso" and shows the new values (AC 22)
Proof: run web | ✓ customer-list.spec.ts > CustomerList > customer-ui C22 Editar opens the Customer's values and Salvar alterações puts them

**C23** - A 409 on create or edit keeps the drawer open with the values and toasts the API message (AC 23)
Proof: run web | ✓ customer-list.spec.ts > CustomerList > customer-ui C23 a 409 keeps the drawer open with the values and toasts the message

**C24** - "Excluir <name>" asks the confirmation, deletes after Confirmar, toasts and drops the row; a 409 keeps the row and toasts the API message (AC 24)
Proof: run web | ✓ customer-list.spec.ts > CustomerList > customer-ui C24 Excluir deletes only after the confirmation and drops the row
Proof: run web | ✓ customer-list.spec.ts > CustomerList > customer-ui C24 a refused delete keeps the row and toasts the message

**C25** - "Ver detalhes de <name>" links to `/customers/:id` (AC 25)
Proof: run web | ✓ customer-list.spec.ts > CustomerList > customer-ui C25 Ver detalhes links to the customer

**C26** - An inspector sees no "Novo cliente", "Editar <name>" or "Excluir <name>" (AC 26)
Proof: run web | ✓ customer-list.inspector.spec.ts > CustomerList for an inspector > customer-ui C26 renders no write control for an inspector

### S3 - Customer detail as in mareos

**C27** - `/customers/:id` requests the Customer and `GET /api/vessels?customerId=<id>` with no `page`, shows "CADASTRO DE CLIENTE", the "Proprietário de …" sentence, no Editar, Nova embarcação or map, and matches `.specs/features/customer-ui-redesign/captures/customer-detail.png` except `## Differences from the source` (AC 27)
Proof: run web | ✓ customer-detail.spec.ts > CustomerDetail > customer-ui C27 requests the vessels with no page and shows the profile without Editar, Nova embarcação or map
Proof: browser - open a Customer with one Vessel at 1440x1000, save `captures/customer-detail.running.png`

**C28** - The breadcrumb is a link "Clientes" to `/customers`, "/", then the name (AC 28)
Proof: run web | ✓ customer-detail.spec.ts > CustomerDetail > customer-ui C28 the breadcrumb links Clientes and names the customer

**C29** - "Contato e endereço" and "Localização" show the email, phone or "Não informado", the address lines of the source (AC 29)
Proof: run web | ✓ customer-detail.spec.ts > CustomerDetail > customer-ui C29 shows the contact, the address and the location

**C30** - "Embarcações vinculadas" lists every Vessel with the count, each linking to `/vessels/:id` with name and type label; none says "Nenhuma embarcação vinculada a este cliente." (AC 30)
Proof: run web | ✓ customer-detail.spec.ts > CustomerDetail > customer-ui C30 lists every vessel with its type and links it
Proof: run web | ✓ customer-detail.spec.ts > CustomerDetail > customer-ui C30 says Nenhuma embarcação vinculada a este cliente

**C31** - "Excluir <vessel name>" asks the confirmation, deletes after Confirmar, toasts, drops the row and lowers the count and the sentence by one (AC 31)
Proof: run web | ✓ customer-detail.spec.ts > CustomerDetail > customer-ui C31 Excluir deletes the vessel after the confirmation and lowers the count

**C32** - A Customer that answers 404 shows "Cliente não encontrado", the sentence and "Voltar para clientes" inside the shell (AC 32)
Proof: run web | ✓ customer-detail.spec.ts > CustomerDetail > customer-ui C32 a 404 shows Cliente não encontrado with a link back

**C33** - An inspector sees no "Excluir <vessel name>" on the Customer detail (AC 33)
Proof: run web | ✓ customer-detail.inspector.spec.ts > CustomerDetail for an inspector > customer-ui C33 renders no write control for an inspector

### S4 - Vessels on one page, searched, selected and exported

**C34** - `/vessels` requests `GET /api/vessels` and `GET /api/customers` once each with no `page`, shows only "Total na frota" and the new subtitle, and matches `.specs/features/customer-ui-redesign/captures/vessel-list.png` except `## Differences from the source` (AC 34)
Proof: run web | ✓ vessel-list.spec.ts > VesselList > customer-ui C34 requests vessels and customers with no page and shows Total na frota
Proof: browser - open `/vessels` at 1440x1250 as an operator, save `captures/vessel-list.running.png`

**C35** - `GET /vessels` without `page` answers 200 with every Vessel of the Organization (of `customerId` when given), `total` their number; with `page=1` 10; with no token 401 (AC 35)
Proof: run api | ✓ fetch-vessels.use-case.spec.ts > FetchVesselsUseCase > customer-ui C35 returns every vessel of the Organization when no page is given
Proof: run api | ✓ vessel.http.spec.ts > GET /vessels > customer-ui C35 answers every vessel without page and 10 with page 1
Proof: run api | ✓ vessel.http.spec.ts > GET /vessels > customer-ui C35 answers 401 without a token
Proof: run api | ✓ vessel.repository.spec.ts > PrismaVesselsRepository > customer-ui C35 asks for every vessel when no page is given

**C36** - Rows are sorted by Vessel name in pt-BR and show the checkbox, name link, IMO or "—", type label, "32,5 m" and the Customer name under "CLIENTE" (AC 36)
Proof: run web | ✓ vessel-list.spec.ts > VesselList > customer-ui C36 sorts by name and shows IMO, type, length and the customer

**C37** - The search filters by name, Customer name, IMO or type label with no request; "Limpar busca" empties it; the footer and the empty message follow the source (AC 37)
Proof: run web | ✓ vessel-list.spec.ts > VesselList > customer-ui C37 filters by name, customer, IMO and type and Limpar busca empties it

**C38** - "Selecionar todas as embarcações visíveis" selects the shown rows, is indeterminate on a partial selection, and the selection survives a search change (AC 38)
Proof: run web | ✓ vessel-list.spec.ts > VesselList > customer-ui C38 selects every shown row, goes indeterminate and keeps the selection across a search

**C39** - "Exportar" is disabled with "Selecione embarcações para exportar" and reads "Exportar (n)" with the singular or plural label (AC 39)
Proof: run web | ✓ vessel-list.spec.ts > VesselList > customer-ui C39 Exportar is disabled with no selection and counts the selection

**C40** - Exporting writes `embarcacoes.csv` with BOM, CRLF, quoted cells, the five-column header and one line per selected Vessel, guarding formulas and doubling quotes (AC 40)
Proof: run web | ✓ vessel-csv.spec.ts > vesselsCsv > customer-ui C40 writes the header and one quoted line per vessel with BOM and CRLF
Proof: run web | ✓ vessel-csv.spec.ts > vesselsCsv > customer-ui C40 guards formulas and doubles quotes
Proof: run web | ✓ vessel-list.spec.ts > VesselList > customer-ui C40 Exportar downloads embarcacoes.csv with every selected vessel, hidden ones included

**C41** - "Nova embarcação" opens the drawer of `.specs/features/customer-ui-redesign/captures/vessel-drawer.jpg` without "Operação", with "Cliente responsável *" listing every Customer and "Número IMO *"; "Salvar embarcação" posts, closes, toasts and shows the row (AC 41)
Proof: run web | ✓ vessel-list.spec.ts > VesselList > customer-ui C41 Nova embarcação lists every customer and Salvar embarcação posts the vessel
Proof: browser - open "Nova embarcação" on `/vessels` at 1440x1000, save `captures/vessel-drawer.running.png`

**C42** - "Editar embarcação <name>" opens the drawer with the values, no "Cliente responsável", no "Número IMO", and "Salvar alterações" puts the body, toasts and shows the new values (AC 42)
Proof: run web | ✓ vessel-list.spec.ts > VesselList > customer-ui C42 Editar embarcação opens the values without customer and IMO and puts the change

**C43** - "Excluir embarcação <name>" deletes after the confirmation, toasts, drops the row and its selection (AC 43)
Proof: run web | ✓ vessel-list.spec.ts > VesselList > customer-ui C43 Excluir embarcação deletes after the confirmation and drops the row and its selection

**C44** - A 409 on create keeps the drawer open with the values and toasts the API message (AC 44)
Proof: run web | ✓ vessel-list.spec.ts > VesselList > customer-ui C44 a 409 keeps the drawer open with the values and toasts the message

**C45** - An inspector sees no "Nova embarcação", "Editar embarcação <name>" or "Excluir embarcação <name>", and keeps selection and "Exportar" (AC 45)
Proof: run web | ✓ vessel-list.inspector.spec.ts > VesselList for an inspector > customer-ui C45 renders no write control and keeps the export for an inspector

### S5 - Vessel detail as in mareos

**C46** - `/vessels/:id` shows the kicker "FROTA", no status badge, no "Porto base", "Voltar à frota" links to `/vessels`, and the page matches `.specs/features/customer-ui-redesign/captures/vessel-detail.png` except `## Differences from the source` (AC 46)
Proof: run web | ✓ vessel-detail.spec.ts > VesselDetail > customer-ui C46 shows the FROTA profile and Voltar à frota links to /vessels
Proof: browser - open a Vessel with one WorkOrder at 1440x1000, save `captures/vessel-detail.running.png`

**C47** - "Número IMO" shows the number or "Não informado" and "Comprimento" shows "<n> m" in pt-BR (AC 47)
Proof: run web | ✓ vessel-detail.spec.ts > VesselDetail > customer-ui C47 shows the IMO number and the length in pt-BR

**C48** - "Editar" opens "Editar embarcação" and after saving the page shows the new values (AC 48)
Proof: run web | ✓ vessel-detail.spec.ts > VesselDetail > customer-ui C48 Editar saves the vessel and shows the new values

**C49** - "Ordens de serviço" lists the WorkOrders with Ordem, Docagem, Desdocagem, Status, the code `#` + 8 uppercase characters linking to `/work-orders/:id`, dates as "10 de novembro de 2026"; none shows the empty texts of the source (AC 49)
Proof: run web | ✓ vessel-detail.spec.ts > VesselDetail > customer-ui C49 lists the work orders with the code and the long dates
Proof: run web | ✓ vessel-detail.spec.ts > VesselDetail > customer-ui C49 says Nenhuma ordem vinculada when there is none

**C50** - "Nova ordem" opens the current WorkOrder form and after saving the table shows the new WorkOrder (AC 50)
Proof: run web | ✓ vessel-detail.spec.ts > VesselDetail > customer-ui C50 Nova ordem posts the work order and lists it

**C51** - Deleting a WorkOrder asks the confirmation, deletes after Confirmar, toasts "Ordem de serviço excluída com sucesso" and drops the row (AC 51)
Proof: run web | ✓ vessel-detail.spec.ts > VesselDetail > customer-ui C51 deletes a work order only after Confirmar and drops the row

**C52** - With 11 WorkOrders the table requests `take=10&skip=0` then `take=10&skip=10` (AC 52)
Proof: run web | ✓ vessel-detail.spec.ts > VesselDetail > customer-ui C52 pages the work orders ten at a time
Proof: run web | ✓ vessel-detail.spec.ts > VesselDetail > customer-ui C52 deleting the only order of page 2 goes back to page 1

**C53** - "CLIENTE RESPONSÁVEL" shows the initials, name, "Cliente", email, phone or "Não informado", and "Ver cliente" to `/customers/:customerId`, no "Ver ordens de serviço" (AC 53)
Proof: run web | ✓ vessel-detail.spec.ts > VesselDetail > customer-ui C53 the customer panel shows the contact and Ver cliente

**C54** - A Vessel that answers 404 shows "Embarcação não encontrada", "Esse registro não está disponível na sua organização." and "Voltar à frota" (AC 54)
Proof: run web | ✓ vessel-detail.spec.ts > VesselDetail > customer-ui C54 a 404 shows Embarcação não encontrada with a link back

**C55** - An inspector sees no "Editar", "Nova ordem" or WorkOrder delete on the Vessel detail (AC 55)
Proof: run web | ✓ vessel-detail.inspector.spec.ts > VesselDetail for an inspector > customer-ui C55 renders no write control for an inspector

## Coverage

| Set (size) | Member -> proof | Unproven |
| --- | --- | --- |
| `GET /customers` statuses (2) | 200 C13 · 401 C13 | - |
| `GET /vessels` statuses (2) | 200 C35 · 401 C35 | - |
| Landing doors (3) | list contract C13, C35 · shell pattern C1, C2, C5 · theme tokens C3, C4 | - |
| menu items by Role (5) | Visão geral C2 · Embarcações C2 · Clientes C2 · Modelos de inspeção C2 · Organizações (internal Administrator only) C2 | - |
| topbar sections (8 routes) | `/customers` · `/customers/:id` · `/vessels` · `/vessels/:id` · `/work-orders/:id` · `/dashboard` · `/inspection-templates` · `/organizations`, C5 table-driven over all 8 | - |
| widths (5) | 640 C11 · 768 C11 · 1024 C11 · 1280 C11 · 1536 C11 | - |
| source controls: shell, without "Recolher menu" (AD-031) (6) | Selecionar organização C6 · an Organization item C7 · a menu item C2, C9 · "..." / Sair C8 · Ativar tema escuro/claro C4 · Abrir menu C9 | - |
| source controls: Customer list (5) | Novo cliente C21 · search C17 · name link C18 · Ver detalhes C25 · Editar C22 | - |
| source controls: Customer drawer (4) | Cadastrar cliente C21 · Salvar alterações C22 · Cancelar C21 · Fechar cadastro C21 | - |
| source controls: Customer detail (2) | Clientes breadcrumb C28 · Vessel row link C30 | - |
| source controls: Vessel list (8) | Nova embarcação C41 · Exportar C39, C40 · select all C38 · row checkbox C38 · search C37 · Limpar busca C37 · name link C36 · Editar C42 | - |
| source controls: Vessel drawer (4) | Salvar embarcação C41 · Salvar alterações C42 · Cancelar C41 · Fechar formulário C41 | - |
| source controls: Vessel detail (4) | Voltar à frota C46 · Editar C48 · Nova ordem C50 · order code link C49 | - |
| added controls (AD-022, AD-029) (4) | Excluir cliente C24 · Excluir embarcação (list) C43 · Excluir embarcação (detail) C31 · Excluir ordem C51 | - |
| `vesselCount` rule, AC 14 (3 examples) | 0 C14 · 2 C14 · 1 after a delete C14 | - |
| sort rule, AC 15 (3 names) | "anchor co" C15 · "Ágata Pesca" C15 · "Barco Azul" C15 | - |
| metrics rule, AC 16 (2 examples) | 8/3/11 C16 · 120 C16 | - |
| Customer search fields, AC 17 (5) | name C17 · email C17 · phone C17 · city C17 · state C17 | - |
| Vessel search fields, AC 37 (4) | name C37 · Customer name C37 · IMO C37 · type label C37 | - |
| CSV rule, AC 40 (3 examples) | Aurora line C40 · `=SUM(A1)` C40 · `"` doubled C40 | - |
| inspector write controls (4 pages) | Customer list C26 · Customer detail C33 · Vessel list C45 · Vessel detail C55 | - |
| startup config: saved theme (1 assembly) | `main.ts` before `bootstrapApplication` C4 | - |

## Swept

- validation: C21 (Estado select, required fields), C41 (Cliente responsável and IMO required); existing - the Signal Forms `required`/`email` rules of `customer-form.ts` and `vessel-form.ts`
- failure modes: C20, C23, C24, C44
- idempotency: n/a - no new write route; existing - the save buttons are disabled while a request is in flight (`submitting`)
- authorization: C13, C35 (401), C26, C33, C45, C55; existing - reads open to every Role, writes behind `@Roles(...WRITERS)`
- concurrency: n/a - this feature adds only reads; the list reloads after each write
- data lifecycle: C22 (edited values come back), C14 (count after delete), C31, C43
- dependency failure: C20
- state transitions: n/a - no entity moves through states in this feature
- observability: n/a - no logging requirement in the plan

## Handoff

- **Settled mid-build:** 2026-11-17, screens round 1, Q "Recolher menu: remover o botão / manter o botão" -> user: "Remover o botão (Recomendado)" (AD-031): C56 withdrawn, the brand button removed
- **Dispatched:** Verifier at `2c92fae` (diff `34f79a9..2c92fae`) - returned FAIL, 6 findings; screens round 1 at `2c92fae` (pictures taken at `325531a`) - returned, 8 of 8 diverge; screens round 2 at `9bf0afa` (pictures retaken at `420572b`)
- **Boundary:** C13, C14, C35 closed at `6d8faeb`; C1-C10, C56 at `962e85d`; C12, C15-C34, C36-C55 at `0ee5961`; C11 at `325531a`; the Verifier and screens round 1 findings, C57 and the withdrawal of C56 at `420572b`
- **Abandoned:** the plan's example under AC 15 read "anchor co", "Ágata Pesca", "Barco Azul"; `localeCompare(…, 'pt-BR')`, the rule AC 15 and the mareos both name, gives "Ágata Pesca", "anchor co", "Barco Azul" (checked with node). The example was miscomputed when the plan was written; it is corrected in the plan and the rule is unchanged
- **Walked:** an isolated stack started for the walk (PostgreSQL, Redis and Mailpit in new containers `cui-pg`, `cui-redis`, `cui-mailpit`; the API built from this checkout on 3334; `ng serve` on 4300 with a proxy to 3334), seeded through the API with eight fictional Customers, eight Vessels and one WorkOrder `IN_PROGRESS` on Santa Maria, and the seed Administrator given two more Memberships (operator in "Marina Serviços Navais", inspector in "Oceano Azul Reparos") in that database only. Headless Chrome over the DevTools protocol, signed in as the seed Administrator, saved every `*.running.png` at the capture's size: `/customers` and `/vessels` at 1440x1250; the Customer detail (Marcos Oliveira), the Vessel detail (Santa Maria), "Novo cliente", "Nova embarcação", the Organization menu (region 0,0-720,500) and the dark `/customers` at 1440x1000. Dark theme: sidebar `rgb(20, 30, 41)`, Customer name `rgb(229, 237, 244)` on `rgb(20, 30, 41)`, contrast 14.23:1. C11: `/customers`, `/customers/:id`, `/vessels` and `/vessels/:id` at 640, 768, 1024, 1280 and 1536 px; first run the lists overflowed at 640, 768 and 1024 (740, 996, 778, 1034, 1047) and the Vessel detail at 768 (832) because the `sr-only` header cells escaped their scroll wrappers; fixed in `325531a`, rewalked: `scrollWidth` equals `innerWidth` in all 20. Also seen in the walk and fixed in `325531a`: the lists were narrower than the capture (934 px against 970), and the Vessel detail drew a lone "1" pager. A user reaches the states from the sidebar (Clientes, Embarcações), a Customer name, a Vessel name, "Novo cliente", "Nova embarcação", "Selecionar organização" and the theme button. After screens round 1 (`420572b`): every picture retaken at `420572b`, with focus emulation on so the focused "Nome" draws its ring; the Organization menu picture is now the window's region 0,0-1296,900 scaled to 720x500, the framing of its capture. Outside the plan, surfaced not fixed: `POST /customers` with `"phone": null` answers 500 (the column is NOT NULL while the body schema accepts null)
