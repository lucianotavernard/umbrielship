# Drawer standard screens

**Verifier**: independent sub-agent (author != verifier)
**Round**: 2
**HEAD**: 5cf4de3

| Screen | Compared with | Verdict | Finding |
| --- | --- | --- | --- |
| `captures/work-order-drawer.light.running.png` | `captures/work-order-drawer.light.png` | matches | 0 rows differ, no regression in round 2; note: the focus ring on "Embarcação" is a darker teal |
| `captures/work-order-drawer.dark.running.png` | `captures/work-order-drawer.dark.png` | matches | 0 rows differ, no regression in round 2; notes: every surface is 5-7 RGB units darker, the focus ring is a brighter teal, and the crop starts 5px lower |

### `captures/work-order-drawer.light.running.png`

| Element | Result | Picture draws |
| --- | --- | --- |
| render: 1440x1000, text the same size as the capture's (every label lands on the same pixels), nothing overlapping or cut off except the body's scrolled content under the footer | same | Not resized. Inside the drawer (x 860-1440) the picture matches the capture pixel for pixel, except the focus ring row below. |
| backdrop: the page dimmed and blurred across the window to the left of the drawer | same | Note: the page under the blur shows other data and another signed-in User (one order row instead of eight, other KPI values, an extra sidebar section with "Organizações", a different user at the bottom left). The dimming and blur are the same, and the page is not part of the drawer. |
| drawer: white panel docked at the right edge, full window height, 580px wide (x 860-1440) | same | |
| header region: white, kicker, title and description stacked on the left, close button top right, bottom border separating it from the body | same | |
| kicker `NOVA SOLICITAÇÃO`: small teal uppercase with wide spacing | same | |
| title `Nova ordem de serviço`: large, dark | same | |
| description `Preencha os dados dos serviços para programar o atendimento da embarcação.`: small grey, under the title | same | |
| close button: bordered rounded square with an X, top right of the header | same | |
| body: grey region under the header holding three cards stacked with gaps, its content scrolled under the pinned footer | same | |
| card "Embarcação e cliente": white card with a tinted header row and a bottom border, teal ship icon in a tinted square tile, title `Embarcação e cliente`, subtitle `Identifique a embarcação atendida` | same | |
| label `Embarcação` with red `*`, select with placeholder `Selecione uma embarcação` and a chevron on the right | same | |
| focused field ring: teal 1px border plus a light outer ring around the "Embarcação" select | same | Note: same place and width, darker teal in the picture (border #087f8c vs #6bb2ba, outer ring #83bfc5 vs #daecee), so the ring reads heavier |
| label `Cliente responsável` with no star, field with placeholder `Definido pela embarcação` | same | |
| card "Serviços a realizar": tinted header row, teal wrench icon in a tinted tile, title `Serviços a realizar`, subtitle `Adicione um ou mais serviços para esta embarcação` | same | |
| service block "Serviço 1": bordered white block inside the card body, bold title `Serviço 1` | same | |
| label `Nome do serviço` with red `*`, input with placeholder `Ex.: Revisão do motor principal` | same | |
| label `Descrição do serviço` with red `*`, multi-line textarea with placeholder `Ex.: Revisão do motor principal e troca de filtros` and a resize handle bottom right | same | |
| dashed `Adicionar serviço` button: teal dashed border, tinted fill, plus icon, left-aligned under the block | same | |
| card "Planejamento": tinted header row, teal calendar icon in a tinted tile, title `Planejamento`, subtitle `Defina o período e o status da ordem` | same | |
| planning fields: `Docagem` with red `*` and `Desdocagem` with red `*` side by side, each with a date-time input `dd/mm/aaaa, --:--` and a calendar icon; under them the label `Status` (no star) with the top of its field cut off by the footer | same | |
| footer region: white, pinned to the bottom of the drawer, top border, sentence on the left and buttons on the right | same | |
| footer sentence `* Campos obrigatórios`: red `*`, small grey text | same | |
| `Cancelar`: outline button with the X icon before the word | same | |
| `Criar ordem`: filled teal primary button with the check icon before the label, to the right of `Cancelar` | same | |
| scrollbar: none drawn | same | |

### `captures/work-order-drawer.dark.running.png`

| Element | Result | Picture draws |
| --- | --- | --- |
| render: 593x956, text the same size as the capture's, nothing overlapping or cut off except the body's scrolled content under the footer | same | Not resized. Note: the picture is framed 1px further right, and its top starts 5px lower in the drawer (kicker at y 30 vs y 25). The footer sits at the same y, so the visible body is 5px shorter. Once that offset is aligned, every text and drawing matches the capture pixel for pixel, except the shades noted below. |
| page strip: a narrow dark blurred strip of the page at the left edge, against the drawer's left border | same | Note: 13px wide vs 12px, from the 1px crop offset |
| header region: dark surface, kicker, title and description stacked on the left, close button top right, bottom border separating it from the body | same | Note: every surface in the picture is 5-7 RGB units darker, the page strip outside the drawer included. Examples: header and body #141e29 vs #1b232d, card header #1a2632 vs #202a35, field fill #192531 vs #212a35, icon tile #17302f vs #1d3333. The relative contrasts are kept: the card header is lighter than the body, fields are lighter than the card, and the icon tile has a teal tint. |
| kicker `NOVA SOLICITAÇÃO`: small teal uppercase with wide spacing | same | |
| title `Nova ordem de serviço`: large, light | same | |
| description `Preencha os dados dos serviços para programar o atendimento da embarcação.`: small grey | same | |
| close button: bordered rounded square with an X, top right of the header | same | |
| body: dark region under the header holding three cards stacked with gaps, its content scrolled under the pinned footer | same | |
| scrollbar: on the right of the body, up and down arrows and a grey thumb covering most of the track | same | Note: the thumb is 640px vs 648px because the visible body is 5px shorter |
| card "Embarcação e cliente": bordered dark card with a lighter header row and a bottom border, teal ship icon in a dark teal tile, title `Embarcação e cliente`, subtitle `Identifique a embarcação atendida` | same | |
| label `Embarcação` with red `*`, select with placeholder `Selecione uma embarcação` and a chevron on the right | same | |
| focused field ring: teal 1px border plus a dark teal outer ring around the "Embarcação" select | same | Note: same place and width, brighter teal in the picture (border #2da9ad vs #2b767d, outer ring #21646b vs #1e3740) |
| label `Cliente responsável` with no star, field with placeholder `Definido pela embarcação` | same | |
| card "Serviços a realizar": lighter header row, teal wrench icon in a dark teal tile, title `Serviços a realizar`, subtitle `Adicione um ou mais serviços para esta embarcação` | same | |
| service block "Serviço 1": bordered block inside the card body, bold title `Serviço 1` | same | |
| label `Nome do serviço` with red `*`, input with placeholder `Ex.: Revisão do motor principal` | same | |
| label `Descrição do serviço` with red `*`, multi-line textarea with placeholder `Ex.: Revisão do motor principal e troca de filtros` and a resize handle bottom right | same | |
| dashed `Adicionar serviço` button: teal dashed border, plus icon, left-aligned under the block | same | |
| card "Planejamento": lighter header row, teal calendar icon in a dark teal tile, title `Planejamento`, subtitle `Defina o período e o status da ordem` | same | |
| planning fields: `Docagem` with red `*` and `Desdocagem` with red `*` side by side, each with a date-time input `dd/mm/aaaa, --:--` and a calendar icon, their bottom edge cut off by the footer | same | Note: the footer hides 5px more of the inputs, from the crop offset |
| footer region: dark, pinned to the bottom of the drawer, top border, sentence on the left and buttons on the right | same | |
| footer sentence `* Campos obrigatórios`: red `*`, small grey text | same | |
| `Cancelar`: dark outline button with the X icon before the word | same | |
| `Criar ordem`: filled teal primary button with dark text and the check icon before the label, to the right of `Cancelar` | same | |
