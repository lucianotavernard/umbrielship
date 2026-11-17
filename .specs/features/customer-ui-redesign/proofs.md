# customer-ui-redesign proofs

**HEAD**: 2c92fae
**Tree**: clean
**Shell**: /bin/sh
**Result**: 76 pass, 9 fail

| Check | Proof | Result |
| --- | --- | --- |
| C1 | `run web / ✓ app-shell.spec.ts > Shell > customer-ui C1 renders the sidebar and the topbar around the page and ` | pass |
| C1 | `browser - open /customers at 1440x1250 as an operator, save captures/customer-list.running.png` | **not judged** (screens.md) |
| C2 | `run web / ✓ app-shell.spec.ts > Shell > customer-ui C2 lists four items for an operator and Organizações under` | pass |
| C3 | `cd web/src && for t in '--background: #f7f8fa' '--foreground: #17283b' '--primary: #087f8c' '--primary-foregro` | pass |
| C4 | `run web / ✓ app-shell.spec.ts > Shell > customer-ui C4 the theme button switches to dark, says Ativar tema cla` | pass |
| C4 | `run web / ✓ theme.spec.ts > restoreTheme > customer-ui C4 applies the saved theme before boot` | pass |
| C4 | `cd web/src && awk '/^\.dark \{/,/^\}/' styles.css > /tmp/dark-$$.css && for t in '--background: #0c131b' '--fo` | pass |
| C4 | `browser - open /customers at 1440x1000 in the dark theme, save captures/customer-list-dark.running.png` | **not judged** (screens.md) |
| C5 | `run web / ✓ app-shell.spec.ts > Shell > customer-ui C5 the breadcrumb and the active item follow the route` | pass |
| C6 | `run web / ✓ app-shell.spec.ts > Shell > customer-ui C6 the Organization menu lists each Membership with its in` | pass |
| C6 | `browser - open the menu on /customers at 1440x1000, save captures/shell-organization-menu.running.png (the reg` | **not judged** (screens.md) |
| C7 | `run web / ✓ internal-layout.spec.ts > InternalLayout > [C85] posts the picked organization and reloads` | pass |
| C7 | `run web / ✓ app-shell.spec.ts > Shell > customer-ui C7 picking the active Organization posts nothing and close` | pass |
| C8 | `run web / ✓ app-shell.spec.ts > Shell > customer-ui C8 the profile shows the user and Sair signs out to /auth` | pass |
| C9 | `run web / ✓ app-shell.spec.ts > Shell > customer-ui C9 on a phone Abrir menu opens the sidebar and a menu item` | pass |
| C10 | `run web / ✓ app-shell.spec.ts > Shell > customer-ui C10 shows no workshop status, help, notifications or MARÉO` | pass |
| C11 | `walk - at each of the five widths open the four pages and read document.documentElement.scrollWidth against in` | pass (Walked) |
| C56 | `run web / ✓ app-shell.spec.ts > Shell > customer-ui C56 Recolher menu collapses the sidebar and keeps the choi` | pass |
| C12 | `run web / ✓ customer-list.spec.ts > CustomerList > customer-ui C12 requests GET /api/customers once with no pa` | pass |
| C12 | `browser - open /customers at 1440x1250 as an operator, save captures/customer-list.running.png` | **not judged** (screens.md) |
| C13 | `run api / ✓ fetch-customers.use-case.spec.ts > FetchCustomersUseCase > customer-ui C13 returns every customer ` | pass |
| C13 | `run api / ✓ customer.http.spec.ts > GET /customers > customer-ui C13 answers every customer with vesselCount w` | pass |
| C13 | `run api / ✓ customer.http.spec.ts > GET /customers > customer-ui C13 answers 401 without a token` | pass |
| C13 | `run api / ✓ customer.repository.spec.ts > PrismaCustomersRepository > customer-ui C13 asks for every customer ` | pass |
| C14 | `run smoke / ok   customer-ui C14 vesselCount with no vessel (0)` | pass |
| C14 | `run smoke / ok   customer-ui C14 vesselCount with two vessels (2)` | pass |
| C14 | `run smoke / ok   customer-ui C14 vesselCount after a vessel delete (1)` | pass |
| C15 | `run web / ✓ customer-list.spec.ts > CustomerList > customer-ui C15 sorts customers by name in pt-BR` | pass |
| C16 | `run web / ✓ customer-list.spec.ts > CustomerList > customer-ui C16 counts customers, vessels, emails and phone` | pass |
| C17 | `run web / ✓ customer-list.spec.ts > CustomerList > customer-ui C17 filters by name, email, phone, city and sta` | pass |
| C18 | `run web / ✓ customer-list.spec.ts > CustomerList > customer-ui C18 shows each row with the fallbacks of the so` | pass |
| C19 | `run web / ✓ customer-list.spec.ts > CustomerList > customer-ui C19 says Ainda não há clientes cadastrados and ` | pass |
| C20 | `run web / ✓ customer-list.spec.ts > CustomerList > customer-ui C20 shows skeleton rows while loading and a toa` | pass |
| C21 | `run web / ✓ customer-list.spec.ts > CustomerList > customer-ui C21 Novo cliente opens the drawer, Cadastrar cl` | pass |
| C21 | `run web / ✓ customer-list.spec.ts > CustomerList > customer-ui C21 Cancelar and Fechar cadastro close the draw` | pass |
| C21 | `browser - open "Novo cliente" on /customers at 1440x1000, save captures/customer-drawer.running.png` | **not judged** (screens.md) |
| C22 | `run web / ✓ customer-list.spec.ts > CustomerList > customer-ui C22 Editar opens the Customer's values and Salv` | pass |
| C23 | `run web / ✓ customer-list.spec.ts > CustomerList > customer-ui C23 a 409 keeps the drawer open with the values` | pass |
| C24 | `run web / ✓ customer-list.spec.ts > CustomerList > customer-ui C24 Excluir deletes only after the confirmation` | pass |
| C24 | `run web / ✓ customer-list.spec.ts > CustomerList > customer-ui C24 a refused delete keeps the row and toasts t` | pass |
| C25 | `run web / ✓ customer-list.spec.ts > CustomerList > customer-ui C25 Ver detalhes links to the customer` | pass |
| C26 | `run web / ✓ customer-list.inspector.spec.ts > CustomerList for an inspector > customer-ui C26 renders no write` | pass |
| C27 | `run web / ✓ customer-detail.spec.ts > CustomerDetail > customer-ui C27 requests the vessels with no page and s` | pass |
| C27 | `browser - open a Customer with one Vessel at 1440x1000, save captures/customer-detail.running.png` | **not judged** (screens.md) |
| C28 | `run web / ✓ customer-detail.spec.ts > CustomerDetail > customer-ui C28 the breadcrumb links Clientes and names` | pass |
| C29 | `run web / ✓ customer-detail.spec.ts > CustomerDetail > customer-ui C29 shows the contact, the address and the ` | pass |
| C30 | `run web / ✓ customer-detail.spec.ts > CustomerDetail > customer-ui C30 lists every vessel with its type and li` | pass |
| C30 | `run web / ✓ customer-detail.spec.ts > CustomerDetail > customer-ui C30 says Nenhuma embarcação vinculada a est` | pass |
| C31 | `run web / ✓ customer-detail.spec.ts > CustomerDetail > customer-ui C31 Excluir deletes the vessel after the co` | pass |
| C32 | `run web / ✓ customer-detail.spec.ts > CustomerDetail > customer-ui C32 a 404 shows Cliente não encontrado with` | pass |
| C33 | `run web / ✓ customer-detail.inspector.spec.ts > CustomerDetail for an inspector > customer-ui C33 renders no w` | pass |
| C34 | `run web / ✓ vessel-list.spec.ts > VesselList > customer-ui C34 requests vessels and customers with no page and` | pass |
| C34 | `browser - open /vessels at 1440x1250 as an operator, save captures/vessel-list.running.png` | **not judged** (screens.md) |
| C35 | `run api / ✓ fetch-vessels.use-case.spec.ts > FetchVesselsUseCase > customer-ui C35 returns every vessel of the` | pass |
| C35 | `run api / ✓ vessel.http.spec.ts > GET /vessels > customer-ui C35 answers every vessel without page and 10 with` | pass |
| C35 | `run api / ✓ vessel.http.spec.ts > GET /vessels > customer-ui C35 answers 401 without a token` | pass |
| C35 | `run api / ✓ vessel.repository.spec.ts > PrismaVesselsRepository > customer-ui C35 asks for every vessel when n` | pass |
| C36 | `run web / ✓ vessel-list.spec.ts > VesselList > customer-ui C36 sorts by name and shows IMO, type, length and t` | pass |
| C37 | `run web / ✓ vessel-list.spec.ts > VesselList > customer-ui C37 filters by name, customer, IMO and type and Lim` | pass |
| C38 | `run web / ✓ vessel-list.spec.ts > VesselList > customer-ui C38 selects every shown row, goes indeterminate and` | pass |
| C39 | `run web / ✓ vessel-list.spec.ts > VesselList > customer-ui C39 Exportar is disabled with no selection and coun` | pass |
| C40 | `run web / ✓ vessel-csv.spec.ts > vesselsCsv > customer-ui C40 writes the header and one quoted line per vessel` | pass |
| C40 | `run web / ✓ vessel-csv.spec.ts > vesselsCsv > customer-ui C40 guards formulas and doubles quotes` | pass |
| C40 | `run web / ✓ vessel-list.spec.ts > VesselList > customer-ui C40 Exportar downloads embarcacoes.csv with every s` | pass |
| C41 | `run web / ✓ vessel-list.spec.ts > VesselList > customer-ui C41 Nova embarcação lists every customer and Salvar` | pass |
| C41 | `browser - open "Nova embarcação" on /vessels at 1440x1000, save captures/vessel-drawer.running.png` | **not judged** (screens.md) |
| C42 | `run web / ✓ vessel-list.spec.ts > VesselList > customer-ui C42 Editar embarcação opens the values without cust` | pass |
| C43 | `run web / ✓ vessel-list.spec.ts > VesselList > customer-ui C43 Excluir embarcação deletes after the confirmati` | pass |
| C44 | `run web / ✓ vessel-list.spec.ts > VesselList > customer-ui C44 a 409 keeps the drawer open with the values and` | pass |
| C45 | `run web / ✓ vessel-list.inspector.spec.ts > VesselList for an inspector > customer-ui C45 renders no write con` | pass |
| C46 | `run web / ✓ vessel-detail.spec.ts > VesselDetail > customer-ui C46 shows the FROTA profile and Voltar à frota ` | pass |
| C46 | `browser - open a Vessel with one WorkOrder at 1440x1000, save captures/vessel-detail.running.png` | **not judged** (screens.md) |
| C47 | `run web / ✓ vessel-detail.spec.ts > VesselDetail > customer-ui C47 shows the IMO number and the length in pt-B` | pass |
| C48 | `run web / ✓ vessel-detail.spec.ts > VesselDetail > customer-ui C48 Editar saves the vessel and shows the new v` | pass |
| C49 | `run web / ✓ vessel-detail.spec.ts > VesselDetail > customer-ui C49 lists the work orders with the code and the` | pass |
| C49 | `run web / ✓ vessel-detail.spec.ts > VesselDetail > customer-ui C49 says Nenhuma ordem vinculada when there is ` | pass |
| C50 | `run web / ✓ vessel-detail.spec.ts > VesselDetail > customer-ui C50 Nova ordem posts the work order and lists i` | pass |
| C51 | `run web / ✓ vessel-detail.spec.ts > VesselDetail > customer-ui C51 deletes a work order only after Confirmar a` | pass |
| C52 | `run web / ✓ vessel-detail.spec.ts > VesselDetail > customer-ui C52 pages the work orders ten at a time` | pass |
| C53 | `run web / ✓ vessel-detail.spec.ts > VesselDetail > customer-ui C53 the customer panel shows the contact and Ve` | pass |
| C54 | `run web / ✓ vessel-detail.spec.ts > VesselDetail > customer-ui C54 a 404 shows Embarcação não encontrada with ` | pass |
| C55 | `run web / ✓ vessel-detail.inspector.spec.ts > VesselDetail for an inspector > customer-ui C55 renders no write` | pass |
| Build | `cd api && npm run lint` | pass |
| Build | `cd api && npm run build` | pass |
| Build | `cd web && npm run build` | pass |

## Output

`Run web` - exit 0

```
stderr | src/package/shared/testing/write-access.inspector.spec.ts > write access by Role > inspector C28 the five pages show the same content to an inspector as to an operator
No icon named lucideHistory was found. You may need to import it using the withIcons function.
No icon named lucideHistory was found. You may need to import it using the withIcons function.

stderr | src/package/shared/testing/write-access.inspector.spec.ts > write access by Role > inspector C28 the five pages show the same content to an inspector as to an operator
No icon named lucideHistory was found. You may need to import it using the withIcons function.
No icon named lucideHistory was found. You may need to import it using the withIcons function.

stderr | src/package/shared/testing/write-access.inspector.spec.ts > write access by Role > inspector C31 the five pages render no write control while the Role is not loaded or is not a writer
No icon named lucideHistory was found. You may need to import it using the withIcons function.
No icon named lucideHistory was found. You may need to import it using the withIcons function.

stderr | src/package/shared/testing/write-access.inspector.spec.ts > write access by Role > inspector C31 the five pages render no write control while the Role is not loaded or is not a writer
No icon named lucideHistory was found. You may need to import it using the withIcons function.
No icon named lucideHistory was found. You may need to import it using the withIcons function.
```

`Run api` - exit 0

```
 ✓ src/package/customer/vessel/__test__/vessel-tenancy.spec.ts > Vessel tenancy > [C36] rejects an IMO number repeated in another letter case in one Organization 2ms
 ✓ src/package/customer/vessel/__test__/vessel-tenancy.spec.ts > Vessel tenancy > [C36] CreateVesselUseCase answers customer not found for a Customer of another Organization 1ms
 ✓ src/package/customer/vessel/__test__/vessel-tenancy.spec.ts > Vessel tenancy > [C36] get, edit and delete answer vessel not found for a Vessel of another Organization 1ms
 ✓ src/package/customer/vessel/__test__/vessel-tenancy.spec.ts > Vessel tenancy > [C36] FetchVesselsUseCase lists only the Organization vessels, with and without customerId 1ms
 ✓ src/package/customer/vessel/__test__/vessel.repository.spec.ts > PrismaVesselsRepository > customer-ui C35 asks for every vessel when no page is given 2ms
 ✓ src/package/customer/customer/__test__/customer.repository.spec.ts > PrismaCustomersRepository > customer-ui C13 asks for every customer with its vessel count when no page is given 3ms
 ✓ src/package/customer/customer/__test__/customer.http.spec.ts > GET /customers > customer-ui C13 answers every customer with vesselCount without page and 10 with page 1 15ms
 ✓ src/package/customer/customer/__test__/customer.http.spec.ts > GET /customers > customer-ui C13 answers 401 without a token 2ms
 ✓ src/package/customer/vessel/__test__/vessel.http.spec.ts > GET /vessels > customer-ui C35 answers every vessel without page and 10 with page 1 16ms
 ✓ src/package/customer/vessel/__test__/vessel.http.spec.ts > GET /vessels > customer-ui C35 answers 401 without a token 2ms

 Test Files  17 passed (17)
      Tests  52 passed (52)
   Start at  12:37:34
   Duration  722ms (transform 1.54s, setup 0ms, import 5.22s, tests 276ms, environment 2ms)
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

`cd web/src && for t in '--background: #f7f8fa' '--foreground: #17283b' '--primary: #087f8c' '--primary-foregro` - exit 0

```
(no output)
```

`cd web/src && awk '/^\.dark \{/,/^\}/' styles.css > /tmp/dark-$$.css && for t in '--background: #0c131b' '--fo` - exit 0

```
(no output)
```
