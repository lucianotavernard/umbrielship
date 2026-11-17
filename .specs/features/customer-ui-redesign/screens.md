# Customer UI redesign screens

**Verifier**: independent sub-agent (author != verifier)
**Round**: 2
**HEAD**: 420572b

| Screen | Compared with | Verdict | Finding |
| --- | --- | --- | --- |
| `captures/customer-list.running.png` | `captures/customer-list.png` | matches | the 3 round-1 rows are now `same` |
| `captures/customer-list-dark.running.png` | `captures/customer-list-dark.jpg` | matches | the 4 round-1 rows are now `same` |
| `captures/shell-organization-menu.running.png` | `captures/shell-organization-menu.png` | diverges | the 6 round-1 rows are now `same`; 1 row `differs - regression` |
| `captures/customer-drawer.running.png` | `captures/customer-drawer.jpg` | matches | the 3 round-1 rows are now `same` |
| `captures/customer-detail.running.png` | `captures/customer-detail.png` | matches | the 3 round-1 rows are now `same` |
| `captures/vessel-list.running.png` | `captures/vessel-list.png` | matches | the 2 round-1 rows are now `same` |
| `captures/vessel-drawer.running.png` | `captures/vessel-drawer.jpg` | matches | the 2 round-1 rows are now `same` |
| `captures/vessel-detail.running.png` | `captures/vessel-detail.png` | matches | the 3 round-1 rows are now `same` |

Sizes are given at the 1440 px window. The `.jpg` captures (800 px wide) were measured and scaled by 1.8. Sample data (names, numbers, dates, e-mails), the "1 Insight" dev overlay and every row of `## Differences from the source` are not differences.

Round 2 reopened only the rows marked `differs` in round 1, on the pictures re-saved at `420572b`, and checked the `same` rows for visible regressions. Since round 1, `.specs/STATE.md` AD-031 removes the sidebar's "Recolher menu" button, so the capture's brand-only sidebar header is the target. The `shell-organization-menu` capture frames the window region 0,0-1296,900 scaled to 720x500.

### `captures/customer-list.running.png`

| Element | Result | Picture draws |
| --- | --- | --- |
| render: the whole 1440x1250 page in view, nothing cut off or overlapping | same | |
| shell arrangement: full-height sidebar on the left, topbar across the content, page column centred | same | Note: the sidebar is about 256 px wide; the capture's is about 246 px |
| sidebar brand: teal anchor tile and two-tone wordmark | same | "UMBRIELSHIP" with "SHIP" in teal (AD-025) |
| sidebar header: brand alone, no control beside it | same | Round 2: the brand alone (AD-031). Round 1: a sidebar-collapse button beside the brand |
| Organization switcher trigger: bordered card with initials tile, name, second line, chevron | same | Note: the second line is the Role ("Administrador") where the capture shows "Filial" |
| group label "MENU PRINCIPAL" | same | |
| menu items: icon and label per row | same | the four items of AD-024 |
| active item "Clientes": tinted full-width rounded background | same | Note: the label is teal and bold; the capture's is dark and regular |
| counter "12" on a menu item | same | omitted (AD-025) |
| group "GESTÃO" with its item | same | "Organizações" (AD-024) |
| "Precisa de ajuda?" card | same | omitted (AD-025) |
| profile footer: divider, initials avatar, name, Role, "..." button | same | |
| topbar left: breadcrumb "Operação > Clientes" | same | |
| topbar right: theme toggle (moon), divider, initials avatar | same | "Oficina em operação", help and bell omitted (AD-025) |
| kicker: short line and "OPERAÇÃO / RELACIONAMENTO" | same | |
| title "Clientes" and "Gerencie os proprietários das embarcações e seus dados de contato." | same | |
| "Novo cliente" filled teal button with "+", right of the header | same | |
| four metric cards in one row: icon tile, label, two-digit value, caption | same | "Clientes cadastrados"/"proprietários", "Embarcações vinculadas"/"na frota", "Com e-mail cadastrado"/"contatos", "Com telefone cadastrado"/"contatos" |
| list panel header: "Lista de clientes", subtitle, search field with magnifier on the right | same | subtitle from AD-027; placeholder "Buscar por nome, contato ou cidade..." |
| column headers CLIENTE, CONTATO, LOCALIZAÇÃO, EMBARCAÇÕES with a line under them | same | Note: the columns sit further left to make room for the third action |
| row, client cell: initials tile, bold name, street line | same | |
| row, contact cell: envelope and e-mail line, phone and phone line | same | |
| row, location cell: pin and "<city>, <state>" | same | |
| row, vessels cell: ship and "1 embarcação" | same | |
| row actions: bordered square buttons, arrow and pencil | same | plus a trash button (AD-022) |
| dividers between rows | same | |
| list footer: "Exibindo 8 de 8 clientes" on the left | same | "Cadastro vinculado à frota" omitted (AD-027) |
| no line between the last row and the list footer | same | Round 2: no line. Round 1: a divider under the last row (y about 938) |
| page footer "MARÉOS · Operação com rumo certo." / "Gestão de clientes" | same | omitted (AD-025) |
| icon glyphs across the page (menu, metric tiles, row cells, row actions, topbar): about 14-15 px | same | Round 2: menu 15 px, metric 15, row envelope 13, row pencil 13, topbar moon 14. Round 1: about 9-11 px |

### `captures/customer-list-dark.running.png`

| Element | Result | Picture draws |
| --- | --- | --- |
| render: the whole 1440x1000 window in view, nothing cut off or overlapping | same | Note: the capture's page scrolls (scrollbar, page footer at the bottom); the picture's fits |
| shell arrangement: sidebar, topbar, page column | same | |
| sidebar surface: light sidebar | same | dark sidebar `#141e29` (AD-030) |
| sidebar brand: anchor tile and two-tone wordmark | same | "UMBRIELSHIP" (AD-025) |
| sidebar header: brand alone, no control beside it | same | Round 2: the brand alone (AD-031). Round 1: a sidebar-collapse button beside the brand |
| Organization switcher trigger: card with initials tile, name, second line, chevron | same | bordered card on the dark sidebar (AD-030) |
| "MENU PRINCIPAL" items, faint on the light sidebar | same | light grey labels on the dark sidebar (AD-030) |
| active item "Clientes": tinted rounded background | same | dark teal background, teal label (AD-030 tokens) |
| counter "12", "Precisa de ajuda?" card | same | omitted (AD-025) |
| group "GESTÃO" with its item | same | "Organizações" (AD-024) |
| profile footer: divider, avatar, name, Role, "..." | same | |
| topbar left: breadcrumb "Operação > Clientes" | same | |
| theme toggle in the pressed state: teal sun on a tinted square | same | Round 2: a teal sun on a tinted square. Round 1: a plain grey sun with no pressed background |
| topbar right: divider and initials avatar | same | "Oficina em operação", help and bell omitted (AD-025) |
| kicker, title "Clientes", subtitle | same | |
| "Novo cliente" filled teal button with "+" | same | |
| four metric cards: icon tile, label, value, caption | same | Note: the icon tiles are dark tinted; the capture's are light pastel |
| list panel header: title, subtitle, search field | same | subtitle from AD-027 |
| column headers and the line under them | same | |
| row, client cell: initials tile, name, street line | same | names at full contrast (AD-030). Note: the initials tiles are dark tinted; the capture's are light |
| row, contact, location and vessels cells | same | |
| row actions: square buttons, arrow and pencil | same | plus trash (AD-022). Note: dark outlined buttons; the capture's are white filled |
| dividers between rows | same | |
| no line between the last row and the list footer | same | Round 2: no line. Round 1: a divider under the last row (y about 938) |
| list footer "Exibindo 8 de 8 clientes" | same | "Cadastro vinculado à frota" omitted (AD-027) |
| icon glyphs across the page: about 14-15 px | same | Round 2: menu 15 px, row envelope 13, row pencil 12. Round 1: about 9-11 px |

### `captures/shell-organization-menu.running.png`

| Element | Result | Picture draws |
| --- | --- | --- |
| render: the window region 0,0-1296,900 scaled to 720x500 (the capture's framing) | same | Round 2: the same framing; the page title is 47 px wide in both. Round 1: a 1:1 crop of the window's top-left 720x500 |
| sidebar brand: anchor tile and wordmark | same | "UMBRIELSHIP" (AD-025) |
| sidebar header: brand alone, no control beside it | same | Round 2: the brand alone (AD-031). Round 1: a sidebar-collapse button beside the brand |
| switcher trigger: card with initials tile, name, second line, chevron | same | |
| menu placement: opens just under the trigger, left-aligned, about as wide, over the menu items, with a shadow | same | |
| menu label "TROCAR ORGANIZAÇÃO" | same | |
| menu items: initials tile, bold name, second line | differs - regression | the first item, "Marina Serviços Navais", which is not the active one, is drawn on a tinted background (`#edf4f5`) as well as the active "Umbrielship" (`#e6f2f3`), so two rows are tinted. The capture tints only the active row, and the round-1 picture did too. Role labels "Operador", "Inspetor", "Administrador" in place of "Filial" (criterion 6) |
| active item: tinted background, check on the right | same | Note: the check is small and grey; the capture's is teal and heavier |
| sidebar items under and below the menu, "Clientes" active | same | |
| topbar left: breadcrumb "Operação > Clientes" | same | |
| topbar right: theme toggle and avatar | same | Round 2: none in the frame. The capture's moon sits inside x 1296 only because the status, help and bell (omitted, AD-025) push it there; the product's toggle and avatar sit at the window edge, as `customer-list.running.png` shows. Round 1: cut off |
| page header: kicker, title, subtitle, "Novo cliente" | same | Round 2: the full subtitle, and "Novo cli…" cut by the frame's edge as in the capture. Round 1: subtitle and button cut off |
| four metric cards | same | Round 2: four cards, the fourth cut by the frame's edge as in the capture. Round 1: one and a half cards |
| list panel: header, search, columns, eight rows | same | Round 2: header, search, the four columns and the rows down to the frame's bottom, the actions cut by the right edge as in the capture. Round 1: two rows, cut off |

### `captures/customer-drawer.running.png`

| Element | Result | Picture draws |
| --- | --- | --- |
| render: the whole window, drawer open over the Customer list | same | |
| backdrop: page dimmed and blurred behind the drawer | same | |
| drawer: docked right, full height, about 40% of the window | same | about 580 px of 1440 |
| header: teal kicker "RELACIONAMENTO / CLIENTES", title "Novo cliente", subtitle "Cadastre os dados de contato do proprietário da embarcação.", bordered "×" top right, line under | same | |
| body: light grey background | same | |
| section drawing: each section flat on the body, an icon tile and heading, then its fields, with no border, no card and no header strip | same | Round 2: flat sections, no card or strip. Round 1: white bordered cards with tinted header strips |
| section "Dados do cliente": building icon tile, heading, "Identificação e formas de contato" | same | |
| "Nome do cliente *": full-width input "Ex.: Náutica Costa Sul" | same | Note: the asterisks are red; the capture's are grey |
| "E-mail *" and "Telefone para contato *" side by side: "contato@empresa.com.br", "(00) 00000-0000" | same | |
| "Logo (URL da imagem)" | same | omitted (AD-021) |
| section "Endereço": pin icon tile, heading, "Localização do cliente" | same | |
| "Rua e número *": full-width input "Rua, número e complemento" | same | |
| "Cidade *" and "Estado (UF) *" side by side | same | "Estado (UF) *" is a select starting at "Selecione o estado" (AD-028) |
| Estado select caret (no select in this capture; the capture set draws selects with a chevron, as in `vessel-drawer.jpg` "Tipo de embarcação") | same | Round 2: a chevron. Round 1: a filled "▼" triangle |
| footer content: "Campos com * são obrigatórios", outlined "Cancelar", filled "+ Cadastrar cliente" | same | Note: "Cancelar" has a grey fill; the capture's is white |
| footer placement: a strip just under the last field row, the drawer empty below it | same | Round 2: just under "Cidade"/"Estado", the drawer empty below. Round 1: pinned to the window's bottom |

### `captures/customer-detail.running.png`

| Element | Result | Picture draws |
| --- | --- | --- |
| render: the whole page in view, text on its lines | same | Round 2: the e-mail wraps before the "@" ("marcos" / "@oliveira.test"); both parts read whole. Round 1: it broke mid-word ("marcos@oliveira.te" / "st") |
| shell: sidebar with "Clientes" active, topbar "Operação > Clientes", theme toggle, avatar | same | |
| sidebar header: brand alone | same | Round 2: the brand alone (AD-031). Round 1: a sidebar-collapse button beside the brand |
| breadcrumb: back arrow, link "Clientes", "/", Customer name | same | |
| header card: initials tile, kicker, name, "Proprietário de 1 embarcação na frota.", "Proprietário" pill with a building icon on the right | same | kicker "CADASTRO DE CLIENTE" (AD-027) |
| no "Editar", "Nova embarcação" or map | same | |
| two-column grid under the header: contact card left, location card right, linked Vessels under the contact card | same | |
| "Contato e endereço" card: phone tile, title, "Dados cadastrados para este cliente." | same | |
| "E-mail" and "Telefone": label with icon, value below, side by side | same | Note: the values are indented past the label text |
| "Endereço": label with pin, "<street>, <city>, <state>" | same | |
| "Localização" card: pin tile, title, "Santos, SP", divider, pin and street, divider, building and "Santos — SP" | same | |
| "Embarcações vinculadas" card: ship tile, title, "Frota registrada em nome deste cliente.", count pill "1" on the right, line under | same | |
| linked Vessel row: ship tile, bold name, second line, arrow on the right | same | type "Pesca" with no port and no status (AD-021); trash button (AD-022) |
| page footer "MARÉOS · ..." and "Voltar à lista" | same | omitted (AD-025) |
| icon glyphs (breadcrumb arrow, card tiles, field labels, location rows, pill): about 13-18 px | same | Round 2: the same size as the capture's (phone and ship tiles 14 px, label envelope 14, pins 10x12, pill building 13x11). Round 1: about 8-12 px |

### `captures/vessel-list.running.png`

| Element | Result | Picture draws |
| --- | --- | --- |
| render: the whole 1440x1250 page in view | same | |
| shell: sidebar with "Embarcações" active, topbar "Operação > Embarcações", theme toggle, avatar | same | items from AD-024; help, bell, counter and help card omitted (AD-025) |
| sidebar header: brand alone | same | Round 2: the brand alone (AD-031). Round 1: a sidebar-collapse button beside the brand |
| kicker "OPERAÇÃO / FROTA", title "Embarcações", subtitle | same | subtitle "Gerencie os dados cadastrais da sua frota." (AD-027) |
| "Nova embarcação" filled teal button with "+" | same | |
| metric row | same | one card "Total na frota" / "08" / "embarcações" in the first quarter column (AD-021) |
| list panel header: "Lista de embarcações", "Consulte, cadastre e atualize os dados da sua frota.", disabled outlined "Exportar" with download icon top right | same | |
| status tabs on the left, search field on the right | same | tabs omitted (AD-021); search "Buscar por nome, cliente ou IMO..." on the right |
| column headers: select-all checkbox, EMBARCAÇÃO, NÚMERO IMO, TIPO, COMPRIMENTO, CLIENTE / PORTO BASE, STATUS, line under | same | "CLIENTE", no STATUS (AD-021) |
| row: checkbox, ship avatar tile, bold name, code beneath | same | one teal tile, no code (AD-021) |
| row: IMO, type label, length "32,5 m" | same | types from AD-021. Note: IMO and length are muted grey; the capture's are dark |
| row: Customer name with a city line beneath | same | name only (AD-021, base port) |
| row: status badge | same | omitted (AD-021) |
| row actions: outlined "Editar" with pencil | same | plus a trash button (AD-022). Note: the "Editar" label is lighter |
| dividers between rows and under the last row | same | |
| list footer: "Exibindo 8 de 8 embarcações" | same | "Frota atualizada" omitted (AD-027) |
| page footer | same | omitted (AD-025) |
| icon glyphs (ship tiles, metric, menu, pencil, export, search): about 14 px | same | Round 2: row ship 14 px, metric 15, pencil 13, export 13, search 13. Round 1: about 8-11 px |

### `captures/vessel-drawer.running.png`

| Element | Result | Picture draws |
| --- | --- | --- |
| render: the whole window, drawer open over the Vessel list | same | |
| backdrop: page dimmed and blurred | same | |
| drawer: docked right, full height, about 39% of the window | same | about 560 px of 1440 |
| header: teal kicker "FROTA / EMBARCAÇÕES", "Nova embarcação", "Preencha os dados abaixo para registrar uma embarcação na frota.", bordered "×", line under | same | |
| body: light grey with white bordered section cards, each with a tinted header strip | same | |
| card "Detalhes da embarcação": ship tile, "Informações básicas sobre a embarcação" | same | |
| "Nome *": full-width input "Ex.: Aurora", focused (teal ring, caret) as the drawer opens | same | Round 2: focused, with a teal border and ring. Note: the ring is heavier than the capture's soft glow, and the blinking caret is not in the frame. Round 1: not focused |
| "Cliente responsável *" | same | a select "Selecione o cliente" (AD-028) |
| card "Tipo e comprimento": ruler tile, "Identificação e dimensões da embarcação" | same | |
| "Número IMO": full-width input "Ex.: 1234567" | same | required "*" (AD-028) |
| "Tipo de embarcação *" select "Selecione o tipo" and "Comprimento (m) *" "Ex.: 32,5", side by side | same | |
| select caret: a chevron | same | Round 2: a chevron on "Tipo de embarcação" and "Cliente responsável". Round 1: a filled "▼" triangle |
| card "Operação" (Porto base, Status) | same | omitted (AD-021) |
| footer pinned to the bottom with a line above: "* Campos obrigatórios", outlined "× Cancelar", filled "✓ Salvar embarcação" | same | Note: "Cancelar" has a grey fill; the asterisk is red |

### `captures/vessel-detail.running.png`

| Element | Result | Picture draws |
| --- | --- | --- |
| render: the whole page in view | same | |
| shell: sidebar with "Embarcações" active, topbar "Operação > Embarcações", theme toggle, avatar | same | |
| sidebar header: brand alone | same | Round 2: the brand alone (AD-031). Round 1: a sidebar-collapse button beside the brand |
| breadcrumb: back arrow, "Voltar à frota", ">", Vessel name | same | |
| two columns: Vessel and WorkOrder cards on the left, "CLIENTE RESPONSÁVEL" panel on the right | same | |
| Vessel card head: ship tile, kicker, name, type pill, "Informações cadastrais e operacionais da embarcação." | same | kicker "FROTA" and type "Pesca" (AD-021) |
| Vessel card right: status badge and outlined "Editar" with pencil | same | "Editar" only; no status badge (AD-021) |
| facts under a divider: "Número IMO" with bold value, "Comprimento" with ruler and bold "32,5 m", "Porto base" | same | no "Porto base" (AD-021) |
| "Ordens de serviço" card: title, "Ordens vinculadas a esta embarcação.", outlined "+ Nova ordem" | same | Note: extra empty space under the table |
| table headers "Ordem", "Docagem", "Desdocagem", "Status" with a line under | same | |
| WorkOrder row: document icon and bold "#CODE", calendar and date, calendar and date, blue "Em andamento" badge | same | |
| WorkOrder row action (AD-029: delete with confirmation) | same | Round 2: a bordered trash button at the right end of the row. Round 1: no delete control |
| pagination (AD-029: 10 per page) | same | one WorkOrder, so no pagination |
| "CLIENTE RESPONSÁVEL" panel head: initials avatar, kicker, name, "Cliente" tag on the right, a base-port line under the name | same | no base-port line (AD-021). Note: the tag lines up with the kicker, not the name |
| panel body: divider, "Porto base" row, info note | same | Customer e-mail and phone rows (AD-029); no base-port row (AD-021) |
| full-width tinted button with icon | same | "Ver cliente" (AD-029) |
| page footer and "Voltar à frota" | same | omitted (AD-025) |
| icon glyphs (ship tile, calendars, document, breadcrumb arrow, pencil, ruler): about 14-20 px | same | Round 2: the same size as the capture's (ship tile 20 px, calendar 12, pencil 14, breadcrumb arrow 10). Round 1: about 8-11 px |
