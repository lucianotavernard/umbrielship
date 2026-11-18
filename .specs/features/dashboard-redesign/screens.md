# Dashboard redesign screens

**Verifier**: independent sub-agent (author != verifier)
**Round**: 1
**HEAD**: 6bd121d

| Screen | Compared with | Verdict | Finding |
| --- | --- | --- | --- |
| `captures/dashboard.running.png` | `captures/dashboard.png` | diverges | 1 row differs (sun beside the heading) |
| `captures/dashboard-period-today.running.png` | `captures/dashboard-period-today.png` | diverges | 1 row differs (sun beside the heading) |
| `captures/dashboard-tab-em-andamento.running.png` | `captures/dashboard-tab-em-andamento.png` | diverges | 1 row differs (sun beside the heading) |
| `captures/dashboard-search-empty.running.png` | `captures/dashboard-search-empty.png` | diverges | 2 rows differ (sun beside the heading; rule under the column headers) |
| `captures/dashboard-dark.running.png` | `captures/dashboard-dark.png` | diverges | 2 rows differ (sun beside the heading; boxed page controls) |

Judged on the page inside the shell. The shell (sidebar, topbar, brand, organization switcher,
"Oficina em operação", help, notifications, support card) belongs to another feature and AD-025 and
is not inventoried. Names, counts, codes and dates come from the fictional data of Wednesday
18 November 2026 and are not a difference. Every picture is the capture's size and its labels measure
the capture's width ("Ordens em aberto" 78px in both, "Agenda de serviços" 111px in both), so none
is resized.

### `captures/dashboard.running.png`

| Element | Result | Picture draws |
| --- | --- | --- |
| arrangement: header block, one row of four cards, "Agenda de serviços" (wide, left) beside "Equipes em campo" (right) at one height, "Ordens de serviço" full width below | same | |
| kicker: short rule, then the upper-case date | same | "QUARTA-FEIRA, 18 DE NOVEMBRO DE 2026", the day the picture was taken |
| heading "Bom dia, Lucas" | same | |
| sun beside the heading: a filled amber sun (solid disc with eight rays, the `☀` glyph) | differs | an outline sun: eight amber rays around a hollow ring |
| subtitle "Aqui está o resumo da operação da sua oficina hoje." | same | |
| `Nova ordem de serviço` button, teal filled, "+" icon, right of the header | same | |
| four cards of equal width, each a label top-left, a tinted icon tile top-right and a two-digit value | same | |
| card "Ordens em aberto", blue clipboard tile | same | "06" |
| card "Em execução", green wrench tile, note "4 equipes mobilizadas" at the right of the bottom line | same | "02", "2 equipes mobilizadas" in the same place (AD-088) |
| card "Aguardando peças", amber clock tile | same | "Pendentes", "04" (AD-088) |
| card "Concluídas no mês", green anchor tile | same | "01" |
| trends and notes "12% vs. semana passada", "6 com prioridade alta", "2 desde ontem", "1 desde ontem", "2 entregas previstas hoje", "8,4% vs. mês passado", "92% no prazo" | same | nothing (AD-091); the cards keep their height |
| "Agenda de serviços" header: title, subtitle "O que está acontecendo na oficina", period button `Esta semana` with a chevron at the top right | same | |
| day block: bordered tile "QUA" over "18", a dashed vertical line under it beside the items | same | note: the line runs centred under the tile; the capture's sits about 9px right of centre |
| Agenda items: time, dot, Vessel name in bold, tag pill, and beneath "<serviço> · Equipe <x>"; three items by time | same | three items, each tag "Serviço" with a blue dot and a blue pill (AD-091), beneath "<serviço> · Equipe Alfa / Bravo / Charlie" (AD-087) |
| "Mais opções" (⋯) on each Agenda item | same | nothing (AD-091) |
| link `Ver agenda completa` with a chevron, under the list | same | note: about 14px lower, a wider gap under the last item |
| "Equipes em campo" header: title, subtitle "Disponibilidade das equipes", "Mais opções" (⋯) at the top right | same | |
| Team rows: wrench tile in blue, teal, violet; name in bold; "<especialidade> · <n> técnicos"; status dot and label at the right ("Em serviço" amber, "Disponível" green); rules between rows | same | "Alfa", "Bravo", "Charlie", the Teams' names (criterion 10) |
| footer: "7 técnicos ativos" at the left, two initial avatars and "+5" at the right, under a rule | same | "JP", "RM", "+5", the first two Staff by name |
| "Ordens de serviço" header: title, subtitle "Acompanhe e gerencie os serviços da sua frota", `Exportar` outlined with a download icon | same | |
| `Filtros 2` button | same | nothing (AD-091) |
| tabs: "Todas as ordens" active (teal, count badge, underline), "Em andamento", "Aguardando", "Agendadas", over a rule | same | "Todas as ordens 6", "Em andamento", "Pendentes" (AD-090) |
| search field at the right of the tabs: magnifier, placeholder "Buscar ordem..." | same | |
| "⌘K" inside the search field | same | nothing (AD-091) |
| column headers EMBARCAÇÃO, SERVIÇO, EQUIPE, PRAZO, STATUS and an unlabelled actions column | same | "RESPONSÁVEL" for "EQUIPE" (AD-086); note: the columns from SERVIÇO on start 25-40px further right |
| five rows, a rule between each | same | |
| EMBARCAÇÃO cell: boat avatar tile (coloured per row), Vessel name in bold, "OS-2481 · <Customer>" beneath | same | one teal avatar on every row (AD-044), "#B9779D89 · Marcos Oliveira" (AD-034) |
| SERVIÇO cell: the service name | same | |
| EQUIPE cell: small initials avatar and "Equipe <x>" | same | RESPONSÁVEL: "A" Equipe Alfa, "B" Equipe Bravo, "RM" Rafael Mendes, "C" Equipe Charlie (AD-086) |
| PRAZO cell: clock icon and "Hoje, 14:30" / "Amanhã, 09:00" / "18 jun, 15:00" | same | "27 nov, 15:00" for the later date |
| STATUS cell: pill badge with a dot | same | "Em andamento" (blue) and "Pendente" (grey) (AD-034) |
| row menu (⋯) at the end of each row | same | |
| table footer: "Exibindo **1–5** de **24** ordens" at the left; pager at the right: previous, "1" boxed, "2", "3", "…", "8", next | same | "Exibindo 1–5 de 6 ordens"; previous, "1" boxed, "2", next (AD-044); note: previous drawn grey on page 1, dark in the capture |
| page footer "MARÉOS · Operação com rumo certo." and "Última atualização há 2 min" | same | nothing (AD-025) |
| render: nothing overlaps, is cut off or scrolls off the window | same | |

### `captures/dashboard-period-today.running.png`

| Element | Result | Picture draws |
| --- | --- | --- |
| arrangement: header block, four cards, "Agenda de serviços" beside "Equipes em campo", "Ordens de serviço" below | same | |
| kicker: short rule, then the upper-case date | same | "QUARTA-FEIRA, 18 DE NOVEMBRO DE 2026" |
| heading "Bom dia, Lucas" | same | |
| sun beside the heading: a filled amber sun (solid disc with eight rays) | differs | an outline sun: eight amber rays around a hollow ring |
| subtitle "Aqui está o resumo da operação da sua oficina hoje." | same | |
| `Nova ordem de serviço` button, teal filled, "+" icon | same | |
| four cards: label, tinted icon tile, two-digit value; "Em execução" with "<n> equipes mobilizadas" at the right of the bottom line | same | "Ordens em aberto 06", "Em execução 02" with "2 equipes mobilizadas", "Pendentes 04", "Concluídas no mês 01" (AD-088) |
| trends and notes on the cards | same | nothing (AD-091) |
| period button reads `Hoje` with a chevron, at the top right of "Agenda de serviços" | same | note: the label is drawn dark, the capture's lighter grey |
| "Agenda de serviços" title and subtitle | same | |
| day block "QUA" / "18" with a dashed line under it | same | note: the line centred under the tile, the capture's right of centre |
| Agenda items of the day: time, dot, Vessel name, tag, "<serviço> · <responsável>" | same | three items of 18 Nov, tags "Serviço" (AD-091), "· Equipe Alfa / Bravo / Charlie" (AD-087) |
| "Mais opções" (⋯) on each Agenda item | same | nothing (AD-091) |
| link `Ver agenda completa` with a chevron | same | note: about 14px lower |
| "Equipes em campo": header with "Mais opções", three Team rows (tile, name, specialty and count, status), footer "7 técnicos ativos" with two initials and "+5" | same | "Alfa", "Bravo", "Charlie"; "JP", "RM", "+5" |
| "Ordens de serviço" header with `Exportar` | same | |
| `Filtros 2` | same | nothing (AD-091) |
| tabs, "Todas as ordens" active with count badge | same | "Todas as ordens 6", "Em andamento", "Pendentes" (AD-090) |
| search field "Buscar ordem..." | same | without "⌘K" (AD-091) |
| table: column headers, five rows (avatar, Vessel, code · Customer; service; initials and Responsável; clock and Prazo; status badge; ⋯) | same | "RESPONSÁVEL" (AD-086), one teal avatar (AD-044), "#code" (AD-034), "Pendente" / "Em andamento" (AD-034) |
| table footer "Exibindo 1–5 de <n> ordens" and pager | same | "Exibindo 1–5 de 6 ordens"; previous, "1" boxed, "2", next (AD-044) |
| page footer "MARÉOS · …" and "Última atualização há 2 min" | same | nothing (AD-025) |
| render: nothing overlaps, is cut off or scrolls off the window | same | |

### `captures/dashboard-tab-em-andamento.running.png`

| Element | Result | Picture draws |
| --- | --- | --- |
| arrangement: header block, four cards, "Agenda de serviços" beside "Equipes em campo", "Ordens de serviço" below, the whole panel in the window | same | |
| kicker, heading "Bom dia, Lucas", subtitle | same | "QUARTA-FEIRA, 18 DE NOVEMBRO DE 2026" |
| sun beside the heading: a filled amber sun (solid disc with eight rays) | differs | an outline sun: eight amber rays around a hollow ring |
| `Nova ordem de serviço` button | same | |
| four cards with values, "Em execução" with its mobilised-Teams note | same | "Pendentes" for "Aguardando peças" (AD-088); no trends or other notes (AD-091) |
| "Agenda de serviços": header, `Esta semana`, day block "QUA 18", three items, `Ver agenda completa` | same | tags "Serviço" (AD-091), no ⋯ on the items (AD-091); note: link about 14px lower |
| "Equipes em campo": header with ⋯, three Team rows, footer with count, initials and "+5" | same | |
| "Ordens de serviço" header with `Exportar` | same | without `Filtros 2` (AD-091) |
| tabs: "Todas as ordens" inactive (grey) with its count badge, "Em andamento" active (teal, underline), "Aguardando", "Agendadas" | same | "Todas as ordens 6" inactive, "Em andamento" active with the underline, "Pendentes" (AD-090) |
| search field "Buscar ordem..." | same | without "⌘K" (AD-091) |
| column headers EMBARCAÇÃO, SERVIÇO, EQUIPE, PRAZO, STATUS | same | "RESPONSÁVEL" (AD-086) |
| two rows, both "Em andamento": Santa Maria and Estrela do Sul, avatar, Vessel, code · Customer, service, initials and team, clock and Prazo, blue badge, ⋯ | same | one teal avatar (AD-044), "#B9779D89" and "#66A2B093" (AD-034), "A Equipe Alfa", "C Equipe Charlie" (AD-086) |
| table footer "Exibindo **1–2** de **24** ordens"; pager previous, "1" boxed, "2", "3", "…", "8", next | same | "Exibindo 1–2 de 2 ordens", the tab's count (criterion 14); previous, "1" boxed, next (AD-044); note: previous and next drawn grey (disabled), dark in the capture |
| page footer "MARÉOS · …" and "Última atualização há 2 min" | same | nothing (AD-025) |
| render: nothing overlaps, is cut off or scrolls off the window | same | |

### `captures/dashboard-search-empty.running.png`

| Element | Result | Picture draws |
| --- | --- | --- |
| arrangement: header block, four cards, "Agenda de serviços" beside "Equipes em campo", "Ordens de serviço" below, the whole panel in the window | same | |
| kicker, heading "Bom dia, Lucas", subtitle | same | "QUARTA-FEIRA, 18 DE NOVEMBRO DE 2026" |
| sun beside the heading: a filled amber sun (solid disc with eight rays) | differs | an outline sun: eight amber rays around a hollow ring |
| `Nova ordem de serviço` button | same | |
| four cards with values, "Em execução" with its mobilised-Teams note | same | "Pendentes" (AD-088); no trends or other notes (AD-091) |
| "Agenda de serviços": header, `Esta semana`, day block, three items, `Ver agenda completa` | same | tags "Serviço", no ⋯ on the items (AD-091) |
| "Equipes em campo": header with ⋯, three Team rows, footer | same | |
| "Ordens de serviço" header, `Exportar` outlined with a download icon | same | note: `Exportar` drawn faded (disabled, criterion 20), the capture's at full strength |
| `Filtros 2` | same | nothing (AD-091) |
| tabs, "Todas as ordens" active with count badge | same | "Todas as ordens 6", "Em andamento", "Pendentes" (AD-090) |
| search field holding "zzz" with the magnifier | same | without "⌘K" (AD-091); note: teal focus border, the capture's grey |
| column headers EMBARCAÇÃO, SERVIÇO, EQUIPE, PRAZO, STATUS, spread over the empty table | same | "RESPONSÁVEL" (AD-086); note: the columns sit at other offsets |
| no rule between the column headers and the empty message: the capture's table draws the rule under the tabs and the rule above the footer only | differs | a rule under the column headers, between them and "Nenhuma ordem encontrada." |
| "Nenhuma ordem encontrada." centred in the table | same | |
| table footer "Exibindo **0–0** de **24** ordens" at the left | same | "Exibindo 0–0 de 0 ordens", the count of the search (criterion 14) |
| pager: previous, "1" boxed, "2", "3", "…", "8", next | same | previous and next only, both grey; one button per page (AD-044) draws none for no row, as criterion 24 does for no open order |
| page footer "MARÉOS · …" and "Última atualização há 2 min" | same | nothing (AD-025) |
| render: nothing overlaps, is cut off or scrolls off the window | same | |

### `captures/dashboard-dark.running.png`

| Element | Result | Picture draws |
| --- | --- | --- |
| arrangement: dark page, header block, four cards, "Agenda de serviços" beside "Equipes em campo", "Ordens de serviço" below | same | |
| kicker: short rule, upper-case date in muted grey | same | "QUARTA-FEIRA, 18 DE NOVEMBRO DE 2026" |
| heading "Bom dia, Lucas" in light text | same | |
| sun beside the heading: a filled amber sun (solid disc with eight rays) | differs | an outline sun: eight amber rays around a hollow ring |
| subtitle in light grey | same | |
| `Nova ordem de serviço` button, teal filled, "+" icon | same | note: a lighter teal with a dark label, the capture's darker teal with a white label |
| four dark cards with a border: label, icon tile top-right, value | same | note: the icon tiles are dark tints of blue, green, amber, green; the capture's are near-white |
| card values faint (low contrast) | same | "06", "02", "04", "01" in bright text, as Differences (AD-092) |
| card "Em execução" with "<n> equipes mobilizadas" at the right of the bottom line | same | "2 equipes mobilizadas" |
| card "Aguardando peças" | same | "Pendentes" (AD-088) |
| trends and notes on the cards | same | nothing (AD-091) |
| "Agenda de serviços" header: light title, grey subtitle, dark `Esta semana` button with border and chevron | same | |
| day block: dark bordered tile "QUA" / "18", dashed line | same | note: the line centred under the tile |
| Agenda items: time, ringed dot, Vessel name in light bold, tag pill, "<serviço> · <responsável>" | same | tags "Serviço" (AD-091) on dark blue pills, the capture's light pills; note: the dot's ring is dark, the capture's white |
| "Mais opções" (⋯) on each Agenda item | same | nothing (AD-091) |
| link `Ver agenda completa` in teal with a chevron | same | note: brighter teal, about 14px lower |
| "Equipes em campo": header with ⋯, Team rows with icon tile, light name, grey specialty, status dot and label | same | "Alfa", "Bravo", "Charlie"; note: dark tinted tiles, the capture's near-white |
| footer: "7 técnicos ativos", two initial avatars and "+5" | same | "JP", "RM", "+5"; note: dark tinted avatars, the capture's light fills with a dark ring |
| "Ordens de serviço" header with `Exportar` outlined | same | |
| `Filtros` with its badge | same | nothing (AD-091) |
| tabs: "Todas as ordens" active in teal with count badge and underline | same | "Todas as ordens 6", "Em andamento", "Pendentes" (AD-090); note: the badge is a dark tint, the capture's light |
| search field "Buscar ordem..." | same | without "⌘K" (AD-091) |
| column headers in light upper-case | same | "RESPONSÁVEL" (AD-086); note: headers in muted grey, the capture's near-white |
| five rows with rules: avatar tile, Vessel, code · Customer, service, initials and team, clock and Prazo, status badge, ⋯ | same | one teal avatar (AD-044) on a dark tint; codes "#…" (AD-034); Responsável "A Equipe Alfa", "RM Rafael Mendes" (AD-086) in light text where the capture's team names are faint; badges "Em andamento" / "Pendente" (AD-034) on dark tints where the capture's are light pills |
| table footer "Exibindo **1–5** de **24** ordens" | same | "Exibindo 1–5 de 6 ordens" |
| pager: every control - previous, "1", "2", "3", "8", next - drawn as a bordered square box | differs | only the current page "1" boxed (teal border); previous, "2" and next plain, with no box (the light capture also boxes only the current page) |
| page footer "MARÉOS · …" and "Última atualização há 2 min" | same | nothing (AD-025) |
| render: nothing overlaps, is cut off or scrolls off the window | same | |
