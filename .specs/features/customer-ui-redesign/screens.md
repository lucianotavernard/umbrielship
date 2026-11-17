# Customer UI redesign screens

**Verifier**: independent sub-agent (author != verifier)
**Round**: 1
**HEAD**: 325531a

| Screen | Compared with | Verdict | Finding |
| --- | --- | --- | --- |
| `captures/customer-list.running.png` | `captures/customer-list.png` | diverges | 3 rows differ |
| `captures/customer-list-dark.running.png` | `captures/customer-list-dark.jpg` | diverges | 4 rows differ |
| `captures/shell-organization-menu.running.png` | `captures/shell-organization-menu.png` | diverges | 6 rows differ |
| `captures/customer-drawer.running.png` | `captures/customer-drawer.jpg` | diverges | 3 rows differ |
| `captures/customer-detail.running.png` | `captures/customer-detail.png` | diverges | 3 rows differ |
| `captures/vessel-list.running.png` | `captures/vessel-list.png` | diverges | 2 rows differ |
| `captures/vessel-drawer.running.png` | `captures/vessel-drawer.jpg` | diverges | 2 rows differ |
| `captures/vessel-detail.running.png` | `captures/vessel-detail.png` | diverges | 3 rows differ |

Sizes are given at the 1440 px window. The `.jpg` captures (800 px wide) were measured and scaled by 1.8. Sample data (names, numbers, dates, e-mails), the "1 Insight" dev overlay and every row of `## Differences from the source` are not differences.

### `captures/customer-list.running.png`

| Element | Result | Picture draws |
| --- | --- | --- |
| render: the whole 1440x1250 page in view, nothing cut off or overlapping | same | |
| shell arrangement: full-height sidebar on the left, topbar across the content, page column centred | same | Note: the sidebar is about 256 px wide; the capture's is about 246 px |
| sidebar brand: teal anchor tile and two-tone wordmark | same | "UMBRIELSHIP" with "SHIP" in teal (AD-025) |
| sidebar header: brand alone, no control beside it | differs | a sidebar-collapse button (panel icon) at the right of the brand |
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
| row actions: bordered square buttons, arrow and pencil | same | plus a trash button (AD-022). Note: the glyphs are fainter |
| dividers between rows | same | |
| list footer: "Exibindo 8 de 8 clientes" on the left | same | "Cadastro vinculado à frota" omitted (AD-027) |
| no line between the last row and the list footer | differs | a divider under the last row (y about 938), above "Exibindo 8 de 8 clientes" |
| page footer "MARÉOS · Operação com rumo certo." / "Gestão de clientes" | same | omitted (AD-025) |
| icon glyphs across the page (menu, metric tiles, row cells, row actions, topbar): about 14-15 px | differs | about 9-11 px: menu icon 10 px (capture 14), metric icon 11 px (15), row envelope 9 px (13), row pencil 9 px (12) |

### `captures/customer-list-dark.running.png`

| Element | Result | Picture draws |
| --- | --- | --- |
| render: the whole 1440x1000 window in view, nothing cut off or overlapping | same | Note: the capture's page scrolls (scrollbar, page footer at the bottom); the picture's fits |
| shell arrangement: sidebar, topbar, page column | same | |
| sidebar surface: light sidebar | same | dark sidebar `#141e29` (AD-030) |
| sidebar brand: anchor tile and two-tone wordmark | same | "UMBRIELSHIP" (AD-025) |
| sidebar header: brand alone, no control beside it | differs | a sidebar-collapse button (panel icon) at the right of the brand |
| Organization switcher trigger: card with initials tile, name, second line, chevron | same | bordered card on the dark sidebar (AD-030) |
| "MENU PRINCIPAL" items, faint on the light sidebar | same | light grey labels on the dark sidebar (AD-030) |
| active item "Clientes": tinted rounded background | same | dark teal background, teal label (AD-030 tokens) |
| counter "12", "Precisa de ajuda?" card | same | omitted (AD-025) |
| group "GESTÃO" with its item | same | "Organizações" (AD-024) |
| profile footer: divider, avatar, name, Role, "..." | same | |
| topbar left: breadcrumb "Operação > Clientes" | same | |
| theme toggle in the pressed state: teal sun on a tinted square | differs | a plain grey sun with no pressed background |
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
| no line between the last row and the list footer | differs | a divider under the last row (y about 938) |
| list footer "Exibindo 8 de 8 clientes" | same | "Cadastro vinculado à frota" omitted (AD-027) |
| icon glyphs across the page: about 14-15 px | differs | about 9-11 px, as in `customer-list.running.png` |

### `captures/shell-organization-menu.running.png`

| Element | Result | Picture draws |
| --- | --- | --- |
| render: the whole 1440x1000 window scaled to 720x500 | differs | cropped, not scaled: a 1:1 crop of the window's top-left 720x500. Every label reads about twice the capture's relative size, and the right half and the bottom half of the window are cut off. Retake it as the whole window scaled to 720x500 |
| sidebar brand: anchor tile and wordmark | same | "UMBRIELSHIP" (AD-025) |
| sidebar header: brand alone, no control beside it | differs | a sidebar-collapse button (panel icon) at the right of the brand |
| switcher trigger: card with initials tile, name, second line, chevron | same | |
| menu placement: opens just under the trigger, left-aligned, about as wide, over the menu items, with a shadow | same | |
| menu label "TROCAR ORGANIZAÇÃO" | same | |
| menu items: initials tile, bold name, second line | same | Role labels "Operador", "Inspetor", "Administrador" in place of "Filial" (criterion 6) |
| active item: tinted background, check on the right | same | Note: the check is small and grey; the capture's is teal and heavier |
| sidebar items under and below the menu, "Clientes" active | same | |
| topbar left: breadcrumb "Operação > Clientes" | same | |
| topbar right: theme toggle and avatar | differs | cut off at the picture's right edge |
| page header: kicker, title, subtitle, "Novo cliente" | differs | the subtitle is cut at "...dados de conta"; "Novo cliente" is cut off |
| four metric cards | differs | only the first card and part of the second; the rest is cut off |
| list panel: header, search, columns, eight rows | differs | only the title, the subtitle, "CLIENTE" and two rows, cut off at the right and the bottom |

### `captures/customer-drawer.running.png`

| Element | Result | Picture draws |
| --- | --- | --- |
| render: the whole window, drawer open over the Customer list | same | |
| backdrop: page dimmed and blurred behind the drawer | same | Note: the sidebar-collapse button flagged in `customer-list.running.png` shows through the blur |
| drawer: docked right, full height, about 40% of the window | same | about 580 px of 1440 |
| header: teal kicker "RELACIONAMENTO / CLIENTES", title "Novo cliente", subtitle "Cadastre os dados de contato do proprietário da embarcação.", bordered "×" top right, line under | same | Note: the header and field text read about 13-16% larger relative to the window than the capture's (title 100 px wide vs about 88 px, subtitle 302 vs about 268). The vessel drawer matches its capture |
| body: light grey background | same | |
| section drawing: each section flat on the body, an icon tile and heading, then its fields, with no border, no card and no header strip | differs | each section is a white bordered card with a tinted header strip and a line under the strip |
| section "Dados do cliente": building icon tile, heading, "Identificação e formas de contato" | same | |
| "Nome do cliente *": full-width input "Ex.: Náutica Costa Sul" | same | Note: the asterisks are red; the capture's are grey |
| "E-mail *" and "Telefone para contato *" side by side: "contato@empresa.com.br", "(00) 00000-0000" | same | |
| "Logo (URL da imagem)" | same | omitted (AD-021) |
| section "Endereço": pin icon tile, heading, "Localização do cliente" | same | |
| "Rua e número *": full-width input "Rua, número e complemento" | same | |
| "Cidade *" and "Estado (UF) *" side by side | same | "Estado (UF) *" is a select starting at "Selecione o estado" (AD-028) |
| Estado select caret (no select in this capture; the capture set draws selects with a chevron, as in `vessel-drawer.jpg` "Tipo de embarcação") | differs | a filled "▼" triangle |
| footer content: "Campos com * são obrigatórios", outlined "Cancelar", filled "+ Cadastrar cliente" | same | Note: "Cancelar" has a grey fill; the capture's is white |
| footer placement: a strip just under the last field row, the drawer empty below it | differs | pinned to the bottom of the window, about 330 px below the last field |

### `captures/customer-detail.running.png`

| Element | Result | Picture draws |
| --- | --- | --- |
| render: the whole page in view, text on its lines | differs | the e-mail value breaks mid-word over two lines: "marcos@oliveira.te" / "st" |
| shell: sidebar with "Clientes" active, topbar "Operação > Clientes", theme toggle, avatar | same | |
| sidebar header: brand alone | differs | a sidebar-collapse button at the right of the brand |
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
| icon glyphs (breadcrumb arrow, card tiles, field labels, location rows, pill): about 13-18 px | differs | about 8-12 px; the label and location icons are about 8 px and the pill's building is squashed |

### `captures/vessel-list.running.png`

| Element | Result | Picture draws |
| --- | --- | --- |
| render: the whole 1440x1250 page in view | same | |
| shell: sidebar with "Embarcações" active, topbar "Operação > Embarcações", theme toggle, avatar | same | items from AD-024; help, bell, counter and help card omitted (AD-025) |
| sidebar header: brand alone | differs | a sidebar-collapse button at the right of the brand |
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
| row actions: outlined "Editar" with pencil | same | plus a trash button (AD-022). Note: the "Editar" label and pencil are lighter |
| dividers between rows and under the last row | same | |
| list footer: "Exibindo 8 de 8 embarcações" | same | "Frota atualizada" omitted (AD-027) |
| page footer | same | omitted (AD-025) |
| icon glyphs (ship tiles, metric, menu, pencil, export, search): about 14 px | differs | about 8-11 px; the row ship glyph is 8 px in its tile (capture 14) |

### `captures/vessel-drawer.running.png`

| Element | Result | Picture draws |
| --- | --- | --- |
| render: the whole window, drawer open over the Vessel list | same | |
| backdrop: page dimmed and blurred | same | |
| drawer: docked right, full height, about 39% of the window | same | about 560 px of 1440 |
| header: teal kicker "FROTA / EMBARCAÇÕES", "Nova embarcação", "Preencha os dados abaixo para registrar uma embarcação na frota.", bordered "×", line under | same | |
| body: light grey with white bordered section cards, each with a tinted header strip | same | |
| card "Detalhes da embarcação": ship tile, "Informações básicas sobre a embarcação" | same | Note: the ship glyph is about 11 px (capture about 14) |
| "Nome *": full-width input "Ex.: Aurora", focused (teal ring, caret) as the drawer opens | differs | the input is not focused: no ring, no caret |
| "Cliente responsável *" | same | a select "Selecione o cliente" (AD-028) |
| card "Tipo e comprimento": ruler tile, "Identificação e dimensões da embarcação" | same | |
| "Número IMO": full-width input "Ex.: 1234567" | same | required "*" (AD-028) |
| "Tipo de embarcação *" select "Selecione o tipo" and "Comprimento (m) *" "Ex.: 32,5", side by side | same | |
| select caret: a chevron | differs | a filled "▼" triangle, on "Tipo de embarcação" and "Cliente responsável" |
| card "Operação" (Porto base, Status) | same | omitted (AD-021) |
| footer pinned to the bottom with a line above: "* Campos obrigatórios", outlined "× Cancelar", filled "✓ Salvar embarcação" | same | Note: "Cancelar" has a grey fill; the asterisk is red |

### `captures/vessel-detail.running.png`

| Element | Result | Picture draws |
| --- | --- | --- |
| render: the whole page in view | same | |
| shell: sidebar with "Embarcações" active, topbar "Operação > Embarcações", theme toggle, avatar | same | |
| sidebar header: brand alone | differs | a sidebar-collapse button at the right of the brand |
| breadcrumb: back arrow, "Voltar à frota", ">", Vessel name | same | |
| two columns: Vessel and WorkOrder cards on the left, "CLIENTE RESPONSÁVEL" panel on the right | same | |
| Vessel card head: ship tile, kicker, name, type pill, "Informações cadastrais e operacionais da embarcação." | same | kicker "FROTA" and type "Pesca" (AD-021) |
| Vessel card right: status badge and outlined "Editar" with pencil | same | "Editar" only; no status badge (AD-021) |
| facts under a divider: "Número IMO" with bold value, "Comprimento" with ruler and bold "32,5 m", "Porto base" | same | no "Porto base" (AD-021) |
| "Ordens de serviço" card: title, "Ordens vinculadas a esta embarcação.", outlined "+ Nova ordem" | same | Note: extra empty space under the table |
| table headers "Ordem", "Docagem", "Desdocagem", "Status" with a line under | same | |
| WorkOrder row: document icon and bold "#CODE", calendar and date, calendar and date, blue "Em andamento" badge | same | Note: the Status column starts further left, leaving the right of the row empty |
| WorkOrder row action (AD-029: delete with confirmation) | differs | no delete control in the row |
| pagination (AD-029: 10 per page) | same | one WorkOrder, so no pagination |
| "CLIENTE RESPONSÁVEL" panel head: initials avatar, kicker, name, "Cliente" tag on the right, a base-port line under the name | same | no base-port line (AD-021). Note: the tag lines up with the kicker, not the name |
| panel body: divider, "Porto base" row, info note | same | Customer e-mail and phone rows (AD-029); no base-port row (AD-021) |
| full-width tinted button with icon | same | "Ver cliente" (AD-029) |
| page footer and "Voltar à frota" | same | omitted (AD-025) |
| icon glyphs (ship tile, calendars, document, breadcrumb arrow, pencil, ruler): about 14-20 px | differs | about 8-11 px; the Vessel tile's ship glyph is 11 px (capture 20) |
