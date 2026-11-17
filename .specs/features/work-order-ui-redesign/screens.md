# Work order UI redesign screens

**Verifier**: independent sub-agent (author != verifier)
**Round**: 2
**HEAD**: bd7ee26

| Screen | Compared with | Verdict | Finding |
| --- | --- | --- | --- |
| `captures/work-order-list.running.png` | `captures/work-order-list.png` | matches | 0 rows differ |
| `captures/work-order-drawer.running.png` | `captures/work-order-drawer.png` | matches | 5 rows of round 1 now same |
| `captures/inspection-templates.running.png` | `captures/inspection-templates.png` | matches | 2 rows of round 1 now same |
| `captures/inspection-template-drawer.running.png` | `captures/inspection-template-drawer.png` | matches | 6 rows of round 1 now same |
| `captures/inspection-assignment-drawer.running.png` | `captures/inspection-assignment-drawer.png` | matches | 2 rows of round 1 now same |
| `captures/inspection-assignments.running.png` | `captures/inspection-assignments.png` | matches | 4 rows of round 1 now same |
| `captures/inspection-inspector-view.running.png` | `captures/inspection-inspector-view.png` | matches | 4 rows of round 1 now same |
| `captures/inspection-run.running.png` | `captures/inspection-run.png` | matches | 3 rows of round 1 now same |
| `captures/agenda.running.png` | `captures/agenda.png` | diverges | 9 rows of round 1 now same; 1 row differs - regression |

Round 2 reopens the rows round 1 marked `differs` on the pictures re-saved at the capture's size
after the fix pass (code at `f89463f`; `bd7ee26` changes no screen), and applies the departures
settled since round 1: AD-048 (the inspection pages read "Operação > Inspeções"), AD-049 (the Agenda
follows the mareos copy), AD-050 (singular counts) and AD-051 ("Subir" / "Descer" only with two or
more questions). A row that passed in round 1 is not re-judged; one the new picture visibly breaks
is marked `differs - regression`. Reopened rows say "round 2:" in the last column.

Every pair has the same size as its capture (1440 wide, same height), and no label the capture
also draws reads smaller from a resize. The shell rows apply AD-020 to AD-031: brand
"UMBRIELSHIP", no workshop status, help, notifications, help card, menu counter or page footer, no
"Recolher menu", a theme toggle in the topbar (the mareos captures of the hub and the Agenda draw
it too), and a menu with only routes that exist. The "1 Insight" pill is the Next.js dev overlay
and is not judged. Sample data (names, codes, counts, dates, order of sample records) is not a
difference.

### `captures/work-order-list.running.png`

| Element | Result | Picture draws |
| --- | --- | --- |
| sidebar brand: anchor tile and wordmark, top left | same | "UMBRIELSHIP" (AD-025) |
| sidebar Organization switcher card: initials avatar, name, subtitle, chevron | same | |
| sidebar "MENU PRINCIPAL": Visão geral, Ordens de serviço, Inspeções, Embarcações, Clientes, Agenda, in that order | same | Equipe técnica, Organizações and Estoque e peças omitted (AD-024); operator, so no "GESTÃO" |
| active item "Ordens de serviço": tinted full-width pill, counter "12" | same | no counter (AD-025); note: label and icon teal and bold, the capture's are dark and regular |
| "GESTÃO" / "Relatórios" | same | omitted (AD-024) |
| help card "Precisa de ajuda?" | same | omitted (AD-025) |
| profile footer: avatar, name, Role, "…" | same | |
| topbar breadcrumb "Operação > Ordens de serviço" | same | |
| topbar right: "Oficina em operação", help, bell, avatar | same | status, help and bell omitted (AD-025); moon theme toggle (AD-020) and avatar |
| page column under the topbar | same | note: about 969px wide with 108px gutters; the capture's is about 1030px with 82px |
| header kicker "OPERAÇÃO / SERVIÇOS" with a leading rule | same | note: the rule is grey, the capture's teal |
| header title "Ordens de serviço" and subtitle "Gerencie os serviços e acompanhe cada embarcação da sua frota." | same | |
| "Nova ordem de serviço" filled teal button with "+", right of the header | same | |
| metrics: four cards in one row, each icon tile, label, two-digit value | same | |
| metric "Total de ordens", blue clipboard tile, footer "no período" | same | no footer (AD-034) |
| metric "Em andamento", teal wrench tile, footer "4 equipes ativas" | same | no footer (AD-034) |
| metric "Aguardando ação", amber clock tile, footer "Peças ou aprovação" | same | "Pendentes", no footer (AD-044) |
| metric "Concluídas no mês", green check tile, footer "92% no prazo" | same | "Concluídas", no footer (AD-044) |
| panel heading "Lista de ordens" and "Visualize prazos, responsáveis e andamento dos serviços." | same | |
| "Exportar" outlined button with download icon, disabled, top right of the panel | same | |
| "Prioridade" filter button | same | omitted (AD-034) |
| tabs row: active tab tinted with border and teal count chip, others with grey count chips | same | "Todas", "Pendente", "Em andamento", "Concluído", "Cancelado" (AD-034) |
| search field, magnifier, "Buscar ordem, embarcação ou cliente...", full panel width | same | |
| table header: select-all checkbox, "ORDEM / EMBARCAÇÃO", "SERVIÇO", "PRAZO", "STATUS" | same | "EQUIPE RESPONSÁVEL" and "PRIORIDADE" omitted (AD-034) |
| row checkbox, left | same | |
| row avatar: rounded tile with a vessel icon, colour per row | same | one teal tone (AD-044) |
| row Vessel name bold, "<code> · <Customer>" beneath | same | "#FDF70AB0 · Marcos Oliveira" (AD-034) |
| "SERVIÇO" cell: service name, category beneath | same | first service, "+1 serviço" beneath when there are more, name alone otherwise (AD-041) |
| "PRAZO" cell: clock icon and "Hoje, 14:30", "Aberta em …" beneath | same | Desdocagem and "Docagem em 17 nov, 09:12" (AD-044) |
| "STATUS" cell: pill with leading dot, tone per status | same | "Em andamento" blue, "Pendente" grey, "Concluído" green |
| row actions "…" at the right end | same | |
| thin separators between rows | same | |
| footer "Exibindo 1–8 de 8 ordens" with bold numbers, left | same | |
| pagination at right: previous arrow, page buttons, next arrow | same | one button per page (AD-044); "1" only, both arrows disabled |
| page footer "MARÉOS · Operação com rumo certo." and "Última atualização há 2 min" | same | omitted (AD-025) |

### `captures/work-order-drawer.running.png`

| Element | Result | Picture draws |
| --- | --- | --- |
| backdrop: page dimmed and blurred behind the drawer | same | |
| drawer on the right edge, about 579px wide, full height | same | |
| header: kicker "NOVA SOLICITAÇÃO" teal, title "Nova ordem de serviço", "Preencha os dados dos serviços para programar o atendimento da embarcação.", outlined close "×" top right, divider below | same | |
| body: grey, section cards stacked, running under the pinned footer (Planejamento continues below the fold) | same | round 2: the cards keep their full height and Planejamento runs under the footer, the "Status" field behind it |
| card "Embarcação e cliente": header band with ship tile, title, "Identifique a embarcação atendida" | same | |
| "Embarcação *" label with red asterisk, select "Selecione uma embarcação" | same | note: thin chevron, the capture's native chevron |
| "Embarcação" select as the drawer opens: focused, teal border and ring | same | round 2: teal border and ring |
| "Cliente responsável *" select and dashed "Adicionar cliente" | same | read-only "Cliente responsável" field, no "Adicionar cliente" (AD-044) |
| card "Embarcação e cliente": padding under its last field | same | round 2: padding under "Cliente responsável" |
| card "Serviços a realizar": header band with wrench tile, title, "Adicione um ou mais serviços para esta embarcação" | same | |
| inner card "Serviço 1": "Tipo de serviço *" select, "Descrição do serviço *" textarea "Ex.: Revisão do motor principal e troca de filtros" with resize handle | same | "Nome do serviço *" text field "Ex.: Revisão do motor principal" (AD-044); no "Remover serviço" with one service |
| dashed teal "Adicionar serviço" button with "+" under the inner card, padding below it | same | round 2: whole button, padding below |
| card "Planejamento": header band with calendar tile, title and subtitle | same | "Defina o período e o status da ordem" (AD-034) |
| Planejamento fields: two on one row, the third beneath | same | "Docagem *" and "Desdocagem *" (date and time), "Status" "Pendente" beneath (AD-034) |
| card "Planejamento": padding under its last field | same | round 2: the card runs under the footer as in the capture; nothing is clipped by the card's edge |
| pinned footer with top border: "* Campos obrigatórios" left, "Cancelar" outlined with "×", "Criar ordem" filled teal with check, right | same | note: "Cancelar" is filled #f7f8fa, the capture's white |

### `captures/inspection-templates.running.png`

| Element | Result | Picture draws |
| --- | --- | --- |
| sidebar brand, switcher, "MENU PRINCIPAL" with "Inspeções" active | same | six routes (AD-024, AD-032); note: active label teal and bold |
| sidebar "GESTÃO" | same | "Organizações" under "GESTÃO" for the internal Administrator; "Relatórios", Equipe técnica, Estoque e peças omitted (AD-024) |
| help card, profile footer | same | help card omitted (AD-025) |
| topbar: breadcrumb "Operação > Inspeções", theme toggle, avatar | same | status, help, bell omitted (AD-025) |
| page column: about 1046px wide with 75px gutters, metrics and cards spanning it | same | round 2: about 1045px wide (325 to 1370) |
| header kicker "OPERAÇÃO / QUALIDADE" with a leading rule | same | note: rule grey |
| header title "Inspeções" and "Crie roteiros, atribua ordens e acompanhe as inspeções de campo." | same | |
| "Gestão" / "Inspetor" switch | same | omitted (AD-038) |
| filled teal button with "+", right of the header | same | "Novo modelo" (AD-046) |
| metrics: three cards, icon tile, label, two-digit value, footer word | same | "Modelos ativos" / "roteiros", "Aguardando conclusão" / "atribuições", "Concluídas" / "inspeções" (AD-046) |
| metric footer word: right side, centred vertically in the card | same | round 2: right side, centred vertically |
| panel heading "Central de inspeções" and "Gerencie os modelos e acompanhe as execuções por ordem de serviço." | same | |
| tabs: active tab tinted and bordered, joined to the underline, each with a count chip | same | "Modelos 2" active, "Atribuições 1" (AD-046) |
| card grid: three columns, template cards then a dashed card last | same | |
| template card top: file-plus tile left, kicker right | same | "MODELO" (AD-046) |
| template card name | same | |
| template card description | same | omitted (AD-034) |
| template card meta row: clipboard "3 perguntas", "Fotos permitidas" / "Sem fotos" | same | "3 perguntas" only (AD-034) |
| template card divider and footer "Criado em …" left, small outlined teal "Atribuir à OS" right | same | note: the divider sits under the meta row with about 40px of empty card above the footer; the capture's sits about 14px above the footer |
| dashed card: "+" in a teal circle, bold title, "Monte um roteiro para uma nova rotina de inspeção" centred on two lines | same | "Criar outro modelo" (AD-046) |
| page footer "MARÉOS · Operação com rumo certo." and "Templates de inspeção" | same | omitted (AD-025) |

### `captures/inspection-template-drawer.running.png`

| Element | Result | Picture draws |
| --- | --- | --- |
| backdrop: hub dimmed and blurred | same | |
| drawer about 590px wide | same | round 2: about 589px wide; the "Perguntas" sentence on one line |
| header: kicker "BIBLIOTECA DE INSPEÇÕES", title, "Defina as perguntas que o inspetor deverá responder em campo.", outlined close "×", divider below | same | "Novo modelo" (AD-046); note: kicker teal and larger, the capture's grey |
| body arrangement: white, fields top to bottom, the footer following the content under a divider, white space below | same | round 2: white body, "Cancelar" and "Criar modelo" under a divider right after the question card |
| "Nome do template" label and input "Ex.: Inspeção do casco" | same | "Nome do modelo" (AD-046); note: input filled light grey |
| name input as the drawer opens: focused, teal border and ring | same | round 2: teal border and ring; note: the ring reads a little heavier |
| "Descrição" textarea | same | omitted (AD-034) |
| "Perguntas" heading, sentence beneath, outlined "Adicionar" with "+" at the right | same | "Todas as perguntas precisam ser respondidas; “Não se aplica” vale como resposta." (AD-019); note: heading bold and "Adicionar" teal bold, the capture's regular and grey |
| question card: grey bordered card, "Pergunta 01" alone on its header line | same | round 2: "Pergunta 01" alone; "Subir" / "Descer" only with two or more questions (AD-051) |
| "Enunciado" label and input "Digite a pergunta" | same | |
| "Tipo de resposta" select showing "Texto livre" | same | round 2: "Texto livre" |
| "Obrigatória" checkbox beside the select | same | omitted (AD-034) |
| "Permitir fotos na inspeção" box | same | omitted (AD-034) |
| "Cancelar" outlined text button, no icon | same | round 2: outlined, no icon |
| filled teal submit with "+", right of "Cancelar" | same | "Criar modelo" (AD-046) |

### `captures/inspection-assignment-drawer.running.png`

| Element | Result | Picture draws |
| --- | --- | --- |
| backdrop: hub dimmed and blurred | same | |
| drawer about 500px wide | same | round 2: about 499px wide |
| header: kicker "ATRIBUIR INSPEÇÃO", title, "A inspeção usará o template <name>.", outlined close "×", divider below | same | "Escolha a OS e o alvo", "A inspeção usará o modelo Checklist de manutenção preventiva." (AD-046); note: the template name is regular, the capture's bold; kicker teal |
| body arrangement: white, fields top to bottom, the footer following the content under a divider, white space below | same | round 2: white body, "Cancelar" and "Atribuir inspeção" under a divider right after the info box |
| "Ordem de serviço" label and select "Selecione uma ordem" | same | note: select filled light grey, placeholder grey, thin chevron |
| "Inspetor responsável" select "Selecione um profissional" | same | "Alvo" select "Ordem de serviço inteira" (AD-046) |
| info box "3 perguntas" left, "Fotos permitidas" right | same | "3 perguntas" only (AD-046) |
| footer buttons: "Cancelar" outlined, "Atribuir inspeção" filled teal with "+", right-aligned | same | note: "Cancelar" filled #f7f8fa |

### `captures/inspection-assignments.running.png`

| Element | Result | Picture draws |
| --- | --- | --- |
| sidebar, topbar | same | as on `inspection-templates.running.png` |
| page column: about 728px wide, centred | same | round 2: about 727px wide (484 to 1211) |
| header kicker, title, subtitle | same | |
| "Gestão" / "Inspetor" switch | same | omitted (AD-038) |
| filled teal button with "+", right of the header | same | "Novo modelo" (AD-046) |
| metrics: three cards, icon tile, label, value, footer word | same | "Modelos ativos" and the AD-046 wording |
| metric footer word: right side, centred vertically in the card | same | round 2: right side, centred vertically |
| panel heading "Central de inspeções" and its sentence | same | |
| tabs, "Atribuições 1" active | same | "Modelos 2", "Atribuições 1" (AD-046) |
| assignment row: bordered card, amber shield tile left | same | |
| row line 1: code and Vessel, small bold grey | same | "#FDF70AB0 · Santa Maria" (AD-034) |
| row line 2: template name | same | |
| row line 3: person icon and inspector, "3 perguntas", photo icon "Fotos" | same | "Ordem de serviço inteira · 3 perguntas" (AD-046, AD-034) |
| status pill: amber, label about 10–11px | same | round 2: "Sem inspeção" (AD-046) amber, label the capture's size |
| action: small outlined button, label about 10px semibold, right of the pill | same | round 2: "Abrir ordem" (AD-046), small outlined button, label the capture's size |
| page footer | same | omitted (AD-025) |

### `captures/inspection-inspector-view.running.png`

| Element | Result | Picture draws |
| --- | --- | --- |
| sidebar, topbar | same | inspector: six routes, no "GESTÃO"; avatar "CR" |
| page column: about 728px wide, centred | same | round 2: about 727px wide (484 to 1211) |
| header kicker, title, subtitle | same | |
| "Gestão" / "Inspetor" switch | same | omitted (AD-038); no "Novo modelo" for an inspector |
| demo notice with the "Inspetor" select | same | omitted (AD-038) |
| metrics: three cards, icon tile, label, value, footer word | same | "Modelos ativos" and the AD-046 wording |
| metric footer word: right side, centred vertically in the card | same | round 2: right side, centred vertically |
| panel heading and sentence, no tabs | same | "Atribuições de inspeção", "Abra uma atribuição para preencher o roteiro em campo." (AD-046) |
| assignment row: bordered card, amber shield tile, code and Vessel, template name, meta line | same | "#FDF70AB0 · Santa Maria", "Ordem de serviço inteira · 3 perguntas" (AD-046) |
| status pill: amber, label about 10–11px | same | round 2: "Sem inspeção" (AD-046) amber, label the capture's size |
| action: one small outlined white button, label about 10px semibold | same | round 2: "Inspecionar" and "Abrir ordem" (AD-046), both small outlined white buttons, labels the capture's size |
| page footer | same | omitted (AD-025) |

### `captures/inspection-run.running.png`

| Element | Result | Picture draws |
| --- | --- | --- |
| sidebar brand, switcher, menu, profile | same | inspector |
| active menu item "Inspeções" and topbar breadcrumb "Operação > Inspeções" | same | round 2: "Inspeções" active and "Operação > Inspeções" (AD-048) |
| page column: narrow, centred | same | note: about 479px against about 451px |
| back link "← Voltar às inspeções" | same | (AD-045, opened from the hub) |
| kicker "INSPEÇÃO DE CAMPO · <code>" | same | "#FDF70AB0" (AD-034) |
| status pill "Em andamento" right of the kicker | same | omitted (AD-045) |
| title: template name | same | |
| sentence under the title (the template description) | same | "Responda às perguntas e registre as condições encontradas." (AD-034 drops the description; criterion 47 fixes the sentence) |
| three meta cards: "Embarcação", "Inspetor", "Progresso" | same | "0 de 3 respondidas" (AD-045) |
| panel header: shield tile, "Roteiro de inspeção", "Preencha cada item antes de concluir.", "3 perguntas" right, divider below | same | note: "3 perguntas" is top-aligned, the capture's centred |
| question card: number chip "01" left, bold label, answers beneath | same | |
| required mark: red "*" after each required question's label | same | round 2: red "*" after all three labels (every question is required, AD-034, AD-019) |
| question 01: "Conforme", "Não conforme", "Não se aplica" outlined chips with radio circles, one row | same | plus "Observação (opcional)" textarea (AD-019); note: chips 40px tall (criterion 48), the capture's 32px |
| question 02: "Sim", "Não" chips | same | plus "Não se aplica" and "Observação (opcional)" (AD-019) |
| question 03: textarea "Registre sua observação" with resize handle | same | plus "Não se aplica" beneath (AD-019) |
| "Fotos de evidência" section | same | omitted (AD-034) |
| panel footer: divider, sentence left, filled teal "Concluir inspeção" with check right | same | round 2: in view: divider, "As respostas só são gravadas ao concluir a inspeção." (AD-045) left, "Concluir inspeção" right |

### `captures/agenda.running.png`

| Element | Result | Picture draws |
| --- | --- | --- |
| sidebar with "Agenda" active, topbar "Operação > Agenda" | same | |
| page column | same | note: about 1024px with 80px gutters, the capture's about 1089px with 53px |
| header kicker "OPERAÇÃO / PLANEJAMENTO" with rule, bold title "Agenda", subtitle | same | "Serviços e docagens em um só rumo." (AD-047) |
| "Novo compromisso" filled teal button with "+", right of the header | same | note: centred on the header block, the capture's level with the title |
| metrics row | same | two cards spanning the row; "Equipes escaladas" and "Janelas livres" omitted (AD-047) |
| metric "Compromissos na semana": blue calendar tile, label, value, "na programação" under the value, "↗" icon at the right | same | round 2: "na programação" under the value, "↗" at the right; note: the arrow is dark, the capture's teal |
| metric "Docagens programadas": teal ship tile, label, value, "berço e área técnica" under the value, anchor in a circle at the right | same | round 2: teal ship tile, footer under the value, anchor circle at the right |
| two columns: calendar panel left, day panel right | same | |
| toolbar: "Hoje", joined previous/next arrows, bold month label with the week range beneath | same | "Novembro 2026", "16 de nov — 22 de nov" |
| search "Buscar serviço..." with magnifier | same | |
| "Semana" / "Dia" segmented toggle at the right, "Semana" active | same | |
| "Tipo:" row: sliders icon before "Tipo:" | same | round 2: sliders icon before "Tipo:" |
| "Tipo:" chips: "Todas <n>" active with count, then one chip per type | same | "Serviço", "Docagem", "Desdocagem" (AD-036); "Todas as equipes" omitted (AD-047) |
| grid corner cell above the time column: clock icon | same | round 2: clock icon |
| day headers: weekday, day number, "n itens" / "Livre"; today with a filled teal circle and a tinted column | same | |
| time column labels "08:00", "10:00", "12:00", … | same | |
| row separators: dashed horizontal lines | same | round 2: dashed |
| column separators: light vertical lines | same | |
| grid item: tinted card with a coloured left border, "HH:mm" and dot, bold Vessel, service, team | differs - regression | round 2: where items share a cell (TER 08:00, QUI 08:00, SEG 10:00, 12:00 and 14:00) each card shows only "HH:mm" and the Vessel, without the service / "Docagem" / "Desdocagem" line or the `#` code, and past the second card the cell cuts off the rest: TER 08:00 shows two cards and a sliver of a third at the cell's bottom edge, and so does QUI 08:00. A card alone in its cell still draws all four lines (round 1 drew them all, with the cell growing to fit) |
| grid extent: six equal rows 08:00 to 18:00 in view, the legend under them | same | round 2: six equal rows 08:00 to 18:00 and the legend in view |
| legend: coloured squares per type, left; "Horário da oficina 08:00 — 18:00" right | same | round 2: "Serviço", "Docagem", "Desdocagem" (AD-036); no workshop hours (AD-047) |
| day panel header: "SELEÇÃO DO DIA", full date, outlined "+" top right | same | "Terça-feira, 17 de novembro" |
| day panel summary: calendar icon "<n> compromissos", clock icon "Dia produtivo", divider below | same | round 2: calendar icon "7 compromissos", clock icon "Dia produtivo" |
| day panel items: time left, a rail with a type-coloured circle icon, bold Vessel, service, team on its own line with a wrench icon, chevron ">" at the right | same | round 2: rail with a type-coloured circle, Vessel, service or "Docagem" / "Desdocagem", "#7D10FE6B" on its own line with the wrench icon (AD-047), chevron at the right; note: no tinted band behind the circle, chevron dark |
| "CONDIÇÕES DO PORTO" panel and "Equipes em operação" panel | same | omitted (AD-047) |
| page footer "MARÉOS · Planejamento com rumo certo." and "Dados de demonstração" | same | omitted (AD-025, AD-047) |
