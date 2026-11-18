# Workforce screens

**Verifier**: independent sub-agent (author != verifier)
**Round**: 2
**HEAD**: b080d34

| Screen | Compared with | Verdict | Finding |
| --- | --- | --- | --- |
| `captures/staff-list.running.png` | `captures/staff-list.png` | matches | round 2: the 4 rows that differed are same; no regression |
| `captures/staff-list-filtered.running.png` | `captures/staff-list-filtered.png` | matches | round 2: the 4 rows that differed are same; no regression |
| `captures/staff-list-empty.running.png` | `captures/staff-list-empty.png` | matches | round 2: the 4 rows that differed are same; no regression |
| `captures/staff-drawer.running.png` | `captures/staff-drawer.png` | matches | round 2: no regression |
| `captures/staff-detail.running.png` | `captures/staff-detail.png` | matches | round 2: no regression |
| `captures/staff-detail-not-found.running.png` | `captures/staff-detail-not-found.png` | matches | round 2: the 2 rows that differed are same; no regression |

### `captures/staff-list.running.png`

| Element | Result | Picture draws |
| --- | --- | --- |
| shell: sidebar (brand, Organization switcher, menu, user) and topbar (theme button, avatar) | same | earlier approved decisions (AD-020, AD-024, AD-025): "UMBRIELSHIP", "Organizações" under "GESTÃO", no menu counter |
| sidebar: `Equipe técnica` after `Agenda`, highlighted as the current page | same | |
| sidebar: `Estoque e peças` and `Relatórios` | same | omitted, as `## Differences from the source` lists (AD-024) |
| sidebar: `Precisa de ajuda?` card with `Falar com suporte` | same | omitted, as listed (help, AD-025) |
| topbar: breadcrumb `Operação > Equipe técnica` on the left | same | |
| topbar: `Oficina em operação`, help and notifications buttons | same | omitted, as listed (AD-025) |
| page arrangement: header, metrics row, then the `Profissionais` panel, in one centred column | same | note: the column is wider (about 970px against 790px) |
| header: kicker line and `OPERAÇÃO / PESSOAS` | same | |
| header: title `Equipe técnica` | same | |
| header: subtitle `Conheça os profissionais e organize os times da oficina.` | same | "Conheça os profissionais e organize as equipes da oficina.", as listed (AD-081) |
| header: `Cadastrar profissional` button, filled teal with a plus, on the right | same | |
| metrics: three cards in a row, each with an icon tile, a label and a two-digit value | same | |
| metric 1: people icon (blue tile), `Profissionais cadastrados`, `06` | same | |
| metric 2: anchor icon (teal tile), `Times em operação`, `03` | same | "Equipes cadastradas", as listed (AD-080); value is sample data |
| metric 3: pulse icon (green tile), `Disponíveis agora`, `03` | same | value is sample data |
| metric notes: `na equipe`, `equipes` and `• disponíveis` on the right of each card, centred between the label and the value | same | round 2: all three notes centred on the right, between the label and the value |
| (no tabs) | same | tabs `Profissionais` (selected) and `Equipes` between the metrics and the panel, as listed (AD-066, AD-074) |
| panel: white card, title `Profissionais` and subtitle `Cadastro e alocação dos técnicos da oficina.` on the left | same | |
| toolbar on the right of the panel title: `Exportar` (disabled, download icon), search box, team select, in this order | same | |
| search: magnifier and placeholder `Buscar profissional...` | same | note: placeholder a shade darker |
| team select: `Todas as equipes` and a chevron on the right, label centred in the box | same | round 2: label and chevron centred in the box, level with the search placeholder |
| specialty chips: `Todas 6` selected (teal outline and tint), then `Especialista hidráulico 1`, `Mecânico naval 2`, `Técnica de docagem 1`, `Técnica de manutenção 1`, `Técnica elétrica 1`, each count in a pill | same | |
| line under the chips, across the panel, above the table header | same | round 2: a line across the panel under the chips, above the header row |
| table header: select-all checkbox, `PROFISSIONAL`, `ESPECIALIDADE`, `EQUIPE`, `CONTATO`, `STATUS` in small caps, line beneath | same | |
| row: checkbox, initials avatar (tinted rounded square), bold name | same | rows by name (criterion 11); names are sample data |
| row: specialty with a wrench icon | same | |
| row: team with a people icon | same | |
| row: contact, email with a mail icon over phone with a phone icon | same | note: email and phone a size smaller than the specialty; the capture draws them at the same size |
| row: status badge on the right, dot and text: amber `Em serviço`, green `Disponível`, grey `Folga` | same | no `Folga`, as listed (AD-067); note: badge text a size smaller |
| (no row actions) | same | a `...` button at the end of each row, as listed (AD-069) |
| line between rows | same | |
| line under the last row, above the panel footer | same | round 2: a line under the last row, above `Exibindo 6 de 6 profissionais` |
| panel footer: `Exibindo 6 de 6 profissionais` on the left | same | |
| panel footer right: `Equipe técnica MARÉOS` | same | omitted, as listed (AD-081) |
| page footer: `MARÉOS · Operação com rumo certo.` and `Gestão da equipe técnica` | same | omitted, as listed (AD-025, AD-081) |

### `captures/staff-list-filtered.running.png`

| Element | Result | Picture draws |
| --- | --- | --- |
| shell: sidebar (brand, Organization switcher, menu, user) and topbar (theme button, avatar) | same | earlier approved decisions (AD-020, AD-024, AD-025) |
| sidebar: `Equipe técnica` after `Agenda`, highlighted | same | |
| sidebar: `Estoque e peças`, `Relatórios` and the `Precisa de ajuda?` card | same | omitted, as listed (AD-024, AD-025) |
| topbar: breadcrumb `Operação > Equipe técnica` | same | |
| topbar: `Oficina em operação`, help and notifications buttons | same | omitted, as listed |
| page arrangement: header, metrics row, then the `Profissionais` panel, in one centred column | same | note: the column is wider |
| header: kicker `OPERAÇÃO / PESSOAS`, title `Equipe técnica`, subtitle | same | subtitle with "equipes", as listed (AD-081) |
| header: `Cadastrar profissional` button, filled teal with a plus, on the right | same | |
| metrics: `Profissionais cadastrados` `06`, `Times em operação` `03`, `Disponíveis agora` `03`, each with its icon tile | same | "Equipes cadastradas", as listed (AD-080); values are sample data |
| metric notes: `na equipe`, `equipes` and `• disponíveis` centred on the right of each card | same | round 2: all three notes centred on the right, between the label and the value |
| (no tabs) | same | tabs `Profissionais` (selected) and `Equipes`, as listed (AD-066, AD-074) |
| panel: title `Profissionais`, subtitle `Cadastro e alocação dos técnicos da oficina.` | same | |
| toolbar: `Exportar` (disabled), search `Buscar profissional...`, team select, on the right | same | |
| team select: `Todas as equipes` and a chevron, label centred in the box | same | round 2: label and chevron centred in the box, level with the search placeholder |
| specialty chips: `Mecânico naval 2` selected (teal outline and tint), `Todas 6` and the others unselected | same | |
| line under the chips, above the table header | same | round 2: a line across the panel under the chips, above the header row |
| table header: select-all checkbox, `PROFISSIONAL`, `ESPECIALIDADE`, `EQUIPE`, `CONTATO`, `STATUS`, line beneath | same | |
| rows: only the two `Mecânico naval` Staff, each checkbox, avatar, bold name, wrench specialty, people team, mail and phone contact | same | ordered by name (criterion 11); note: contact text a size smaller |
| status badges: amber `Em serviço`, grey `Folga` | same | no `Folga`, as listed (AD-067); note: badge text a size smaller |
| (no row actions) | same | `...` at the end of each row, as listed (AD-069) |
| line between the two rows | same | |
| line under the last row, above the panel footer | same | round 2: a line under the last row, above `Exibindo 2 de 6 profissionais` |
| panel footer: `Exibindo 2 de 6 profissionais` | same | |
| panel footer right `Equipe técnica MARÉOS`; page footer `MARÉOS · Operação com rumo certo.` and `Gestão da equipe técnica` | same | omitted, as listed (AD-025, AD-081) |

### `captures/staff-list-empty.running.png`

| Element | Result | Picture draws |
| --- | --- | --- |
| shell: sidebar (brand, Organization switcher, menu, user) and topbar (theme button, avatar) | same | earlier approved decisions (AD-020, AD-024, AD-025) |
| sidebar: `Equipe técnica` after `Agenda`, highlighted | same | |
| sidebar: `Estoque e peças`, `Relatórios` and the `Precisa de ajuda?` card | same | omitted, as listed (AD-024, AD-025) |
| topbar: breadcrumb `Operação > Equipe técnica` | same | |
| topbar: `Oficina em operação`, help and notifications buttons | same | omitted, as listed |
| page arrangement: header, metrics row, then the `Profissionais` panel, in one centred column | same | note: the column is wider |
| header: kicker `OPERAÇÃO / PESSOAS`, title `Equipe técnica`, subtitle | same | subtitle with "equipes", as listed (AD-081) |
| header: `Cadastrar profissional` button, filled teal with a plus, on the right | same | |
| metrics: `Profissionais cadastrados` `06`, `Times em operação` `03`, `Disponíveis agora` `03`, each with its icon tile | same | "Equipes cadastradas", as listed (AD-080); values are sample data |
| metric notes: `na equipe`, `equipes` and `• disponíveis` centred on the right of each card | same | round 2: all three notes centred on the right, between the label and the value |
| (no tabs) | same | tabs `Profissionais` (selected) and `Equipes`, as listed (AD-066, AD-074) |
| panel: title `Profissionais`, subtitle `Cadastro e alocação dos técnicos da oficina.` | same | |
| toolbar: `Exportar` (disabled), team select, on the right | same | |
| search: `zzz` typed, teal border of the focused box | same | |
| team select: `Todas as equipes` and a chevron, label centred in the box | same | round 2: label and chevron centred in the box, level with the search placeholder |
| specialty chips: `Todas 6` selected, then the five specialties with their counts | same | |
| line under the chips, above the table header | same | round 2: a line across the panel under the chips, above the header row |
| table header: select-all checkbox, `PROFISSIONAL`, `ESPECIALIDADE`, `EQUIPE`, `CONTATO`, `STATUS` spread across the panel, no line beneath | same | |
| empty message `Nenhum profissional encontrado com esses filtros.` centred under the header | same | |
| line above the panel footer | same | round 2: a line between the message and `Exibindo 0 de 6 profissionais` |
| panel footer: `Exibindo 0 de 6 profissionais` | same | |
| panel footer right `Equipe técnica MARÉOS`; page footer `MARÉOS · Operação com rumo certo.` and `Gestão da equipe técnica` | same | omitted, as listed (AD-025, AD-081) |

### `captures/staff-drawer.running.png`

| Element | Result | Picture draws |
| --- | --- | --- |
| backdrop: the list page dimmed and blurred behind the drawer | same | |
| drawer: right side, full height | same | note: 580px wide against 560px (AD-053) |
| header: kicker `OPERAÇÃO / EQUIPE TÉCNICA` in teal | same | |
| header: title `Novo profissional` | same | |
| header: description `Adicione um técnico e vincule-o a uma equipe.` | same | |
| header: close button `×` in a bordered square, top right | same | |
| line under the header | same | |
| body: white form, fields stacked without cards | same | grey body with the cards `Dados do profissional` (user icon, `Identifique o profissional e sua equipe`) and `Contato` (phone icon, `Como falar com o profissional`), as listed (AD-053, AD-082) |
| `Nome completo` label and input, placeholder `Ex.: Ana Souza`, focused with a teal border | same | red `*` on the label (AD-053); note: focus ring thicker |
| `Especialidade` label and input, placeholder `Ex.: Mecânica naval` | same | red `*` on the label (AD-053) |
| `Equipe` select, full width, showing `Equipe Alfa` | same | shows `Sem equipe`, as listed (AD-060, AD-070); note: thin chevron |
| `E-mail` and `Telefone` side by side on one row | same | in the `Contato` card |
| `E-mail` input, placeholder `nome@mareos.com.br` | same | `nome@empresa.com.br`, as listed; red `*` (AD-053) |
| `Telefone` input, placeholder `(00) 00000-0000` | same | red `*` (AD-053) |
| line, then `Cancelar` (outline) and `Cadastrar profissional` (filled teal, plus) under the fields, on the right | same | pinned footer: `* Campos obrigatórios` on the left, `Cancelar` with an X and `Criar profissional` with a check on the right, as listed (AD-053, AD-054, AD-082) |

### `captures/staff-detail.running.png`

| Element | Result | Picture draws |
| --- | --- | --- |
| shell: sidebar (brand, Organization switcher, menu, user) and topbar (theme button, avatar) | same | earlier approved decisions (AD-020, AD-024, AD-025) |
| sidebar: `Equipe técnica` after `Agenda`, highlighted | same | |
| sidebar: `Estoque e peças`, `Relatórios` and the `Precisa de ajuda?` card | same | omitted, as listed (AD-024, AD-025) |
| topbar: breadcrumb `Operação > Equipe técnica` | same | |
| topbar: `Oficina em operação`, help and notifications buttons | same | omitted, as listed |
| page arrangement: one centred column: breadcrumb, hero card, three summary cards, then two cards side by side | same | |
| breadcrumb: `←` `Equipe técnica` `/` bold `Rafael Mendes` | same | |
| hero: initials avatar `RM` in a teal-tinted square on the left | same | |
| hero: kicker `PERFIL PROFISSIONAL` in teal, name as the title, specialty beneath | same | note: card a little taller |
| hero: amber badge `• Em serviço` on the right | same | note: badge text a size smaller |
| summary: three cards in a row | same | |
| summary 1: wrench icon (blue tile), `Especialidade`, bold `Mecânico naval` | same | note: small label a size smaller |
| summary 2: people icon (teal tile), `Equipe vinculada`, bold `Equipe Alfa` | same | |
| summary 3: shield-check icon (green tile), `Situação atual`, bold `Em serviço` | same | |
| contact card (left half): briefcase icon tile, `Contato profissional`, `Informações para comunicação direta.` | same | note: heading and subtitle a size smaller |
| contact: line, then `E-mail` row: mail icon, label, address on the right with `↗` | same | address is sample data |
| contact: line, then `Telefone` row: phone icon, label, number on the right with `↗` | same | |
| allocation card (right half): people icon tile, `Alocação na oficina`, `Vínculo atual do profissional.` | same | |
| allocation: team tile with people icon, bold `Equipe Alfa`, `Equipe técnica`, amber `• Em serviço` | same | |
| allocation: only the team | same | a service card follows the team tile: `Revisão do motor principal`, `#0A16306B · Santa Maria · 17/11/2026 08:00 – 21/11/2026 17:00`, as listed (AD-071) |
| allocation: `← Voltar à lista da equipe` link at the bottom | same | |
| the two bottom cards of equal height | same | |
| page footer: `MARÉOS · Operação com rumo certo.` and `Equipe técnica ←` | same | omitted, as listed (AD-025, AD-081) |

### `captures/staff-detail-not-found.running.png`

| Element | Result | Picture draws |
| --- | --- | --- |
| shell: sidebar (brand, Organization switcher, menu, user) and topbar (theme button, avatar) | same | earlier approved decisions (AD-020, AD-024, AD-025) |
| sidebar: `Equipe técnica` after `Agenda`, highlighted | same | |
| sidebar: `Estoque e peças`, `Relatórios` and the `Precisa de ajuda?` card | same | omitted, as listed (AD-024, AD-025) |
| topbar: breadcrumb `Operação > Equipe técnica` | same | |
| topbar: `Oficina em operação`, help and notifications buttons | same | omitted, as listed |
| one white card, horizontally centred at the top of the content, about 300px wide and 245px tall | same | round 2: a card about 300px wide and 247px tall, centred at the top of the content |
| icon: people icon in a teal-tinted rounded square, centred | same | round 2: a people icon in a teal-tinted rounded square |
| title `Profissional não encontrado`, centred | same | note: a size smaller |
| sentence `Este cadastro não está disponível na equipe técnica.`, centred | same | |
| link `← Voltar para a equipe`, centred | same | note: teal and bold; the capture draws it grey and regular |
