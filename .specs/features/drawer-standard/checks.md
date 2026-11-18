# Drawer standard after "Nova ordem de serviço" checks

Build: `cd web && npm run build`
Run web: `cd web && npx ng test --watch=false --reporters=verbose`
Plan: `.specs/features/drawer-standard/plan.md`

39 checks in 3 slices (C39 appended from the Verifier) · 0 one-way doors · 0 open, of which 0 block

## Checks

### S1 - Every drawer in the frame of "Nova ordem de serviço"

**C1** - "Nova ordem de serviço" (D1) in the light theme matches `.specs/features/drawer-standard/captures/work-order-drawer.light.png` (AC 1, 10)
Proof: browser - open "Nova ordem de serviço" on `/work-orders` in the light theme in a 1440x1000 window, save `captures/work-order-drawer.light.running.png`

**C2** - "Nova ordem de serviço" (D1) in the dark theme matches `.specs/features/drawer-standard/captures/work-order-drawer.dark.png` (AC 1, 10)
Proof: browser - open "Nova ordem de serviço" on `/work-orders` in the dark theme in a 1440x956 window, keep the 593 rightmost pixels unscaled, save `captures/work-order-drawer.dark.running.png`

**C3** - `t-sheet` draws the kicker, title and description it is given at the reference's size (title 20px, no smaller header) and labels its close button "Fechar formulário" unless told otherwise (AC 1)
Proof: run web | ✓ drawer.spec.ts > Drawer > drawer-standard C3 the sheet header shows the kicker, title, description and Fechar formulário

**C4** - `t-sheet` is 580px wide from 640px and fills the window below it: 1280 → 580, 640 → 580, 639 → 639, 375 → 375 with the footer buttons in view (AC 2)
Proof: run web | ✓ drawer.spec.ts > Drawer > drawer-standard C4 the sheet fills the window below 640px and is 580px wide from 640px
Proof: walk - open D1, D10, D13 and D18 at 1280, 640, 639 and 375 px wide and read the dialog's width and the footer buttons' boxes

**C5** - A drawer card draws a 34px icon tile, its title (12px semibold) and subtitle (10px) in its header and its fields in its body; the grey body scrolls while the drawer header and footer stay in view (AC 3)
Proof: run web | ✓ drawer.spec.ts > Drawer > drawer-standard C5 a card shows a 34px icon tile, its title and subtitle above its fields
Proof: walk - open D13 with 20 questions in a 1280x800 window, scroll the body and read that "Criar modelo" stays in view

**C6** - A label inside a drawer takes 10px semibold, and the required mark is a red `*` (`text-destructive`) after the label text (AC 4)
Proof: run web | ✓ drawer.spec.ts > Drawer > drawer-standard C6 a drawer label takes the 10px semibold style and a required mark is a red *

**C7** - The drawer footer shows "* Campos obrigatórios" on the left and, on the right, "Cancelar" then the save button (AC 5)
Proof: run web | ✓ drawer.spec.ts > Drawer > drawer-standard C7 the footer shows * Campos obrigatórios, then Cancelar, then the save button

**C8** - "Cancelar" is a 35px-high outline button whose first child is the `lucideX` icon, and using it emits the footer's cancel (AC 6)
Proof: run web | ✓ drawer.spec.ts > Drawer > drawer-standard C8 Cancelar is the 35px outline button with lucideX and emits cancel

**C9** - The save button is a 35px-high primary `type="submit"` button whose first child is the `lucideCheck` icon, followed by the label it is given, and never `lucidePlus` (AC 7)
Proof: run web | ✓ drawer.spec.ts > Drawer > drawer-standard C9 the save button is the 35px primary submit with lucideCheck and its label

**C10** - While loading, the save button is disabled and shows the spinning `lucideLoader2` and "Salvando..."; when loading ends it shows its label again, enabled (AC 8)
Proof: run web | ✓ drawer.spec.ts > Drawer > drawer-standard C10 while loading the save button is disabled with lucideLoader2 and Salvando...

**C11** - When a sheet opens it focuses the first field of its form that accepts input, passing over a read-only input and a disabled select (AC 9)
Proof: run web | ✓ drawer.spec.ts > Drawer > drawer-standard C11 the sheet focuses its first field that accepts input

**C12** - In the dark theme D10, D13 and D18 show the same computed backgrounds as D1 for the grey body, the card header, the icon tile and the footer; in the light theme too (AC 10)
Proof: walk - open D1, D10, D13 and D18 in each theme and compare the computed background colours of the body, the first card header, its icon tile and the footer

### S2 - Each drawer's cards and copy

Each of C13-C30 is proven by one test that opens the drawer from its trigger on its page and, in this order: reads the kicker, title, description, close label "Fechar formulário", the `sm:max-w-[580px]` width with no other page width, the cards (title, subtitle, icon) and their labels with and without `*`, the focused field, "Cancelar" with `lucideX` and the save label with `lucideCheck`; uses the save button with an invalid form and reads that no request went and each invalid field shows its message; uses "Cancelar" and reads the drawer closed with no request; opens it again and reads no message and no red field (on an edit drawer, the same record with its stored values); fills it validly, uses the save button, reads "Salvando..." on the disabled button while the request is pending and the one request's method, URL and body.

**C13** - D1 "Nova ordem de serviço" from "Nova ordem de serviço" on `/work-orders`: kicker "NOVA SOLICITAÇÃO", cards "Embarcação e cliente", "Serviços a realizar", "Planejamento", focus on "Embarcação", save "Criar ordem", `POST /api/work-orders` once with the services (AC 1-9, 26-29)
Proof: run web | ✓ work-order-drawer.spec.ts > WorkOrderDrawer > drawer-standard D1 Nova ordem de serviço keeps the standard frame, focuses Embarcação and posts once

**C14** - D2 "Editar ordem de serviço" from the row menu "Editar" on `/work-orders`: kicker "ORDEM DE SERVIÇO", cards "Embarcação e cliente" and "Planejamento", Vessel locked, focus on "Docagem", save "Salvar alterações", `PUT /api/work-orders/:id` once (AC 1-9, 26-29)
Proof: run web | ✓ work-order-drawer.spec.ts > WorkOrderDrawer > drawer-standard D2 Editar ordem de serviço keeps the standard frame, focuses Docagem and puts once

**C15** - D3 "Nova ordem de serviço" from "Nova ordem" on `/vessels/:id`: kicker "NOVA SOLICITAÇÃO", that Vessel chosen and locked, focus on "Nome do serviço", save "Criar ordem", `POST /api/work-orders` once with that `vesselId` (AC 1-9, 26-29)
Proof: run web | ✓ vessel-detail.spec.ts > VesselDetail > drawer-standard D3 Nova ordem focuses Nome do serviço with the Vessel locked and posts once

**C16** - D4 "Editar ordem de serviço" from "Editar" on `/work-orders/:id`: kicker "ORDEM DE SERVIÇO", Vessel locked, focus on "Docagem", save "Salvar alterações", `PUT /api/work-orders/:id` once (AC 1-9, 26-29)
Proof: run web | ✓ work-order-detail.spec.ts > WorkOrderDetail > drawer-standard D4 Editar ordem de serviço focuses Docagem and puts once

**C17** - D5 "Novo serviço" from "Novo serviço" on `/work-orders/:id`: kicker "ORDEM DE SERVIÇO", card "Serviço" (wrench, "Identifique o serviço a realizar") with "Nome *" and "Descrição *" as a `textarea` with no `maxLength`, card "Planejamento" (calendar-days, "Defina o período e o status do serviço") with "Início *", "Fim *", "Status"; focus on "Nome"; save "Criar serviço"; `POST /api/work-orders/:id/services` once (AC 1-9, 13, 26-29)
Proof: run web | ✓ work-order-detail.spec.ts > WorkOrderDetail > drawer-standard D5 Novo serviço opens with the Serviço and Planejamento cards and posts once

**C18** - D6 "Atribuir modelo de inspeção" from "Atribuir modelo" on `/work-orders/:id`: kicker "ATRIBUIR INSPEÇÃO", card "Atribuição" (clipboard-check, "Escolha o modelo e o alvo") with "Modelo *" and "Alvo"; focus on "Modelo"; save "Atribuir inspeção"; `POST /api/work-orders/:id/inspection-assignments` once (AC 1-9, 19, 26-29)
Proof: run web | ✓ work-order-detail.spec.ts > WorkOrderDetail > drawer-standard D6 Atribuir modelo de inspeção opens with the Atribuição card and posts once

**C19** - D7 "Nova embarcação" from "Nova embarcação" on `/vessels`: kicker "FROTA / EMBARCAÇÕES", cards "Detalhes da embarcação" and "Tipo e comprimento" with today's fields; focus on "Nome"; save "Criar embarcação"; `POST /api/vessels` once (AC 1-9, 12, 26-29)
Proof: run web | ✓ vessel-list.spec.ts > VesselList > drawer-standard D7 Nova embarcação opens in the standard frame and posts once

**C20** - D8 "Editar embarcação" from a row's "Editar" on `/vessels`: kicker "FROTA / EMBARCAÇÕES", no "Cliente responsável" and no "Número IMO"; focus on "Nome"; reopening the same Vessel after "Cancelar" shows its stored values; save "Salvar alterações"; `PUT /api/customers/:customerId/vessels/:id` once (AC 1-9, 12, 26-29)
Proof: run web | ✓ vessel-list.spec.ts > VesselList > drawer-standard D8 Editar embarcação opens in the standard frame and puts once

**C21** - D9 "Editar embarcação" from "Editar" on `/vessels/:id`: kicker "FROTA / EMBARCAÇÕES"; focus on "Nome"; save "Salvar alterações"; `PUT /api/customers/:customerId/vessels/:id` once (AC 1-9, 12, 26-29)
Proof: run web | ✓ vessel-detail.spec.ts > VesselDetail > drawer-standard D9 Editar embarcação opens in the standard frame and puts once

**C22** - D10 "Novo cliente" from "Novo cliente" on `/customers`: kicker "RELACIONAMENTO / CLIENTES" at the normal header size, card "Dados do cliente" (building-2, "Identificação e formas de contato") with "Nome do cliente *", "E-mail *", "Telefone para contato *", card "Endereço" (map-pin, "Localização do cliente") with "Rua e número *", "Cidade *", "Estado (UF) *"; footer "* Campos obrigatórios"; focus on "Nome do cliente"; save "Criar cliente"; `POST /api/customers` once (AC 1-9, 11, 26-29)
Proof: run web | ✓ customer-list.spec.ts > CustomerList > drawer-standard D10 Novo cliente opens with the Dados do cliente and Endereço cards and posts once

**C23** - D11 "Editar cliente" from a row's "Editar" on `/customers`: the same cards; reopening the same Customer after typing and "Cancelar" shows its stored values and no message; save "Salvar alterações"; `PUT /api/customers/:id` once (AC 1-9, 11, 26-29)
Proof: run web | ✓ customer-list.spec.ts > CustomerList > drawer-standard D11 Editar cliente reopens clean on the same customer and puts once

**C24** - D12 "Adicionar à agenda" from "Novo compromisso" on `/agenda`: kicker "NOVO COMPROMISSO", card "Serviço" (wrench, "Escolha a ordem e descreva o serviço") with "Ordem de serviço *", "Serviço *" and "Descrição *" as a `textarea` with no `maxLength`, card "Planejamento" (calendar-days, "Defina o início e o fim do serviço") with "Início *" and "Fim *"; an empty save shows five messages under their fields and none at the end; focus on "Ordem de serviço"; a drawer opened from a cell keeps that cell's day and hour in "Início"; save "Agendar serviço"; `POST /api/work-orders/:id/services` once (AC 1-9, 14, 26-29)
Proof: run web | ✓ agenda.spec.ts > Agenda > drawer-standard D12 Adicionar à agenda opens with the Serviço and Planejamento cards and posts once

**C25** - D13 "Novo modelo" from "Novo modelo" on `/inspections`: kicker "BIBLIOTECA DE INSPEÇÕES", card "Modelo" (clipboard-list, "Identifique o modelo de inspeção") with "Nome do modelo *", card "Perguntas" (list-checks, "Todas as perguntas precisam ser respondidas; “Não se aplica” vale como resposta.") with the block "Pergunta 01" holding "Enunciado *" and "Tipo de resposta", a dashed "Adicionar pergunta" under it and no "Adicionar" above; focus on "Nome do modelo"; save "Criar modelo"; `POST /api/inspection-templates` once (AC 1-9, 15, 26-29)
Proof: run web | ✓ inspections-hub.spec.ts > InspectionsHub > drawer-standard D13 Novo modelo opens with the Modelo and Perguntas cards and posts once

**C26** - D14 "Editar modelo" from "Editar" on `/inspection-templates/:id`: kicker "BIBLIOTECA DE INSPEÇÕES", the same cards filled with the template's questions; focus on "Nome do modelo"; save "Salvar alterações"; `PUT /api/inspection-templates/:id` once (AC 1-9, 15, 26-29)
Proof: run web | ✓ inspection-template-detail.spec.ts > InspectionTemplateDetail > drawer-standard D14 Editar modelo opens with the Modelo and Perguntas cards and puts once

**C27** - D15 "Escolha a OS e o alvo" from a template card's "Atribuir à OS" on `/inspections`: kicker "ATRIBUIR INSPEÇÃO", card "Atribuição" (clipboard-check, "Escolha a ordem de serviço e o alvo") with "Ordem de serviço *", "Alvo" and the question count inside the card; focus on "Ordem de serviço"; save "Atribuir inspeção"; `POST /api/work-orders/:id/inspection-assignments` once (AC 1-9, 18, 26-29)
Proof: run web | ✓ inspections-hub.spec.ts > InspectionsHub > drawer-standard D15 Atribuir à OS opens with the Atribuição card and posts once

**C28** - D16 "Nova organização" from "Nova Organização" on `/organizations`: kicker "GESTÃO / ORGANIZAÇÕES", card "Detalhes da organização" (building-2, "Informações básicas sobre a organização") with "Nome *" and "E-mail *"; "Criar organização" enabled on the empty form; focus on "Nome"; "Salvando..." while the request runs, and a failed request brings "Criar organização" back enabled with the values kept; `POST /api/organizations` once (AC 1-9, 21, 24, 26-29)
Proof: run web | ✓ organization-list.spec.ts > OrganizationList > drawer-standard D16 Nova organização opens with GESTÃO / ORGANIZAÇÕES and posts once

**C29** - D17 "Novo usuário" from "Novo usuário" on `/organizations/:id`: kicker "ORGANIZAÇÃO / USUÁRIOS", card "Detalhes do usuário" (user, "Informações básicas sobre o usuário") with "Nome *" and "E-mail *", card "Acesso" (shield, "Senha e papel do usuário na organização") with "Senha *" and "Papel"; focus on "Nome"; "Salvando..." while the request runs, and a failed request brings "Criar usuário" back with the values kept; save "Criar usuário"; `POST /api/users` once with the Organization's `organizationId` (AC 1-9, 22, 26-29)
Proof: run web | ✓ organization-detail.spec.ts > OrganizationDetail > drawer-standard D17 Novo usuário opens with the Detalhes do usuário and Acesso cards and posts once

**C30** - D18 "Novo convite" from "Novo convite" on `/organizations/:id`: kicker "ORGANIZAÇÃO / CONVITES", card "Convite" (send, "Quem será convidado e com qual papel") with "Usuário *" and "Papel"; focus on "Usuário"; "Salvando..." while the request runs, and a failed request brings "Enviar convite" back with the values kept; save "Enviar convite"; `POST /api/invitations` once with the Organization's `organizationId` (AC 1-9, 23, 26-29)
Proof: run web | ✓ organization-detail.spec.ts > OrganizationDetail > drawer-standard D18 Novo convite opens with the Convite card and posts once

**C31** - D6 with no template, and D6 whose template request failed, show "Nenhum modelo de inspeção cadastrado" or the load error inside a drawer card and a footer with only "Cancelar" (no "* Campos obrigatórios", no save button) (AC 20)
Proof: run web | ✓ work-order-detail.spec.ts > WorkOrderDetail > drawer-standard D6 without templates shows the message in a card and only Cancelar
Proof: run web | ✓ work-order-detail.spec.ts > WorkOrderDetail > drawer-standard D6 with a failed template load shows the error in a card and only Cancelar

**C32** - "Adicionar pergunta" adds a block at the end numbered after the last, with an empty "Enunciado" and "Texto livre": 1 → "Pergunta 02"; 99 → the 100th, then the button is disabled; at 100 a use adds nothing (AC 16)
Proof: run web | ✓ inspection-template-form.spec.ts > InspectionTemplate form > drawer-standard C32 Adicionar pergunta adds the next block with Texto livre and stops at 100

**C33** - With one question no block shows "Subir", "Descer" or "Remover pergunta 1"; with two each block shows them, "Remover pergunta <n>" with the `lucideTrash` icon (AC 17)
Proof: run web | ✓ inspection-template-form.spec.ts > InspectionTemplate form > drawer-standard C33 Subir, Descer and Remover pergunta show from two questions with the trash icon

### S3 - Every drawer validates as the WorkOrder drawer

**C34** - In each of the 11 drawer forms the save button is enabled on the empty form and with an invalid value (the user form with the password "12345"), and disabled only while loading (AC 24)
Proof: run web | ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C34 work-order-form keeps the save button enabled while empty and while invalid
Proof: run web | ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C34 vessel-form keeps the save button enabled while empty and while invalid
Proof: run web | ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C34 work-order-service-form keeps the save button enabled while empty and while invalid
Proof: run web | ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C34 customer-form keeps the save button enabled while empty and while invalid
Proof: run web | ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C34 appointment-form keeps the save button enabled while empty and while invalid
Proof: run web | ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C34 inspection-template-form keeps the save button enabled while empty and while invalid
Proof: run web | ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C34 assign-to-work-order-form keeps the save button enabled while empty and while invalid
Proof: run web | ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C34 inspection-assignment-form keeps the save button enabled while empty and while invalid
Proof: run web | ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C34 organization-form keeps the save button enabled while empty and while invalid
Proof: run web | ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C34 user-form keeps the save button enabled while empty and while invalid
Proof: run web | ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C34 invitation-form keeps the save button enabled while empty and while invalid

**C35** - In each of the 11 drawer forms, focusing a required field and leaving it empty before any save attempt leaves no field red and no message (AC 25)
Proof: run web | ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C35 work-order-form shows no red and no message after a field is left before saving
Proof: run web | ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C35 vessel-form shows no red and no message after a field is left before saving
Proof: run web | ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C35 work-order-service-form shows no red and no message after a field is left before saving
Proof: run web | ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C35 customer-form shows no red and no message after a field is left before saving
Proof: run web | ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C35 appointment-form shows no red and no message after a field is left before saving
Proof: run web | ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C35 inspection-template-form shows no red and no message after a field is left before saving
Proof: run web | ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C35 assign-to-work-order-form shows no red and no message after a field is left before saving
Proof: run web | ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C35 inspection-assignment-form shows no red and no message after a field is left before saving
Proof: run web | ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C35 organization-form shows no red and no message after a field is left before saving
Proof: run web | ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C35 user-form shows no red and no message after a field is left before saving
Proof: run web | ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C35 invitation-form shows no red and no message after a field is left before saving

**C36** - Saving any of the 11 drawer forms empty emits nothing and each invalid field turns red with exactly one message beneath it, its form's own text, and no other error text in the drawer; the examples hold: user-form password "12345" → only "Senha deve ter no mínimo 8 caracteres" under "Senha"; customer-form e-mail "ana@" → only "E-mail inválido" under "E-mail"; inspection-template-form with a 101-character name → "Nome deve ter no máximo 100 caracteres" under "Nome do modelo" (AC 26)
Proof: run web | ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C36 work-order-form saved empty sends nothing and shows one message under each invalid field
Proof: run web | ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C36 vessel-form saved empty sends nothing and shows one message under each invalid field
Proof: run web | ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C36 work-order-service-form saved empty sends nothing and shows one message under each invalid field
Proof: run web | ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C36 customer-form saved empty sends nothing and shows one message under each invalid field
Proof: run web | ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C36 appointment-form saved empty sends nothing and shows one message under each invalid field
Proof: run web | ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C36 inspection-template-form saved empty sends nothing and shows one message under each invalid field
Proof: run web | ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C36 assign-to-work-order-form saved empty sends nothing and shows one message under each invalid field
Proof: run web | ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C36 inspection-assignment-form saved empty sends nothing and shows one message under each invalid field
Proof: run web | ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C36 organization-form saved empty sends nothing and shows one message under each invalid field
Proof: run web | ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C36 user-form saved empty sends nothing and shows one message under each invalid field
Proof: run web | ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C36 invitation-form saved empty sends nothing and shows one message under each invalid field
Proof: run web | ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C36 a short password, ana@ and a 101-character model name speak only under their field

**C37** - After a failed save in each of the 11 drawer forms, correcting one invalid field removes its red and its message at once while every other invalid field keeps both (AC 27)
Proof: run web | ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C37 work-order-form clears a corrected field at once and keeps the others
Proof: run web | ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C37 vessel-form clears a corrected field at once and keeps the others
Proof: run web | ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C37 work-order-service-form clears a corrected field at once and keeps the others
Proof: run web | ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C37 customer-form clears a corrected field at once and keeps the others
Proof: run web | ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C37 appointment-form clears a corrected field at once and keeps the others
Proof: run web | ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C37 inspection-template-form clears a corrected field at once and keeps the others
Proof: run web | ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C37 assign-to-work-order-form clears a corrected field at once and keeps the others
Proof: run web | ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C37 inspection-assignment-form clears a corrected field at once and keeps the others
Proof: run web | ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C37 organization-form clears a corrected field at once and keeps the others
Proof: run web | ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C37 user-form clears a corrected field at once and keeps the others
Proof: run web | ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C37 invitation-form clears a corrected field at once and keeps the others

**C38** - Each drawer form that a page keeps between openings shows no red field and no message after the reset or load its page calls on opening, following a failed save (AC 28)
Proof: run web | ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C38 work-order-form shows no red and no message after reset
Proof: run web | ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C38 vessel-form shows no red and no message after reset
Proof: run web | ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C38 work-order-service-form shows no red and no message after reset
Proof: run web | ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C38 customer-form shows no red and no message after reset
Proof: run web | ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C38 appointment-form shows no red and no message after reset
Proof: run web | ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C38 inspection-template-form shows no red and no message after reset
Proof: run web | ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C38 assign-to-work-order-form shows no red and no message after reset
Proof: run web | ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C38 organization-form shows no red and no message after reset
Proof: run web | ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C38 user-form shows no red and no message after reset
Proof: run web | ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C38 invitation-form shows no red and no message after reset

**C39** - A form outside a drawer keeps today's validation: on the sign-in form, leaving an empty "E-mail" before any submit shows "E-mail é obrigatório" in `t-input-error`, the input turns red through its touched rule (`[&.ng-invalid.ng-touched]:border-destructive`, no drawer field style), the label keeps `text-sm` and its touched red rule, and nothing carries `data-invalid` or a drawer `[data-slot="error"]` (plan `## Shape` shared UI row, `## Out of scope` forms outside drawers)
Proof: run web | ✓ authentication-form.spec.ts > AuthenticationForm > drawer-standard C39 the sign-in form outside a drawer keeps its touched message, red field and label

## Coverage

| Set (size) | Member -> proof | Unproven |
| --- | --- | --- |
| drawers opened from their trigger, AC 1 (18) | D1 C13 · D2 C14 · D3 C15 · D4 C16 · D5 C17 · D6 C18 · D7 C19 · D8 C20 · D9 C21 · D10 C22 · D11 C23 · D12 C24 · D13 C25 · D14 C26 · D15 C27 · D16 C28 · D17 C29 · D18 C30 | - |
| binding captures (2) | `work-order-drawer.light.png` C1 · `work-order-drawer.dark.png` C2 | - |
| source controls: D1 capture (5) | "Embarcação" select C13 · "Adicionar serviço" C13 · close button C13 · "Cancelar" C13 · "Criar ordem" C13 | - |
| width examples, AC 2 (4) | 1280 C4 · 640 C4 · 639 C4 · 375 C4 | - |
| star examples, AC 4 (10) | "Nome do cliente *" C22 · "Nome do modelo *" C25 · "Enunciado *" C25 · "Usuário *" C30 · "Modelo *" C18 · "Ordem de serviço *" C27 · "Status" C17 · "Papel" C29 · "Alvo" C27 · "Tipo de resposta" C25 | - |
| footer sentence examples, AC 5 (2) | D10 C22 · D12 C24 | - |
| save label examples, AC 7 (2) | D10 "Criar cliente" C22 · D18 "Enviar convite" C30 | - |
| focus examples, AC 9 (6) | D1 C13 · D3 C15 · D4 C16 · D10 C22 · D12 C24 · D16 C28 | - |
| new card copy, AC 11-23 (17 cards) | Dados do cliente C22 · Endereço C22 · Serviço (D5) C17 · Planejamento (D5) C17 · Serviço (D12) C24 · Planejamento (D12) C24 · Modelo C25 C26 · Perguntas C25 C26 · Atribuição (D15) C27 · Atribuição (D6) C18 · Detalhes da organização C28 · Detalhes do usuário C29 · Acesso C29 · Convite C30 · Detalhes da embarcação C19 · Tipo e comprimento C19 · D6 message card C31 | - |
| kickers added, AC 19-23 (4) | ATRIBUIR INSPEÇÃO C18 · GESTÃO / ORGANIZAÇÕES C28 · ORGANIZAÇÃO / USUÁRIOS C29 · ORGANIZAÇÃO / CONVITES C30 | - |
| "Adicionar pergunta" examples, AC 16 (3) | 1 question C32 · 99 questions C32 · 100 questions C32 | - |
| drawer forms, AC 24-27 (11) | `work-order-form` C34 C35 C36 C37 · `vessel-form` C34 C35 C36 C37 · `work-order-service-form` C34 C35 C36 C37 · `customer-form` C34 C35 C36 C37 · `appointment-form` C34 C35 C36 C37 · `inspection-template-form` C34 C35 C36 C37 · `assign-to-work-order-form` C34 C35 C36 C37 · `inspection-assignment-form` C34 C35 C36 C37 · `organization-form` C34 C35 C36 C37 · `user-form` C34 C35 C36 C37 · `invitation-form` C34 C35 C36 C37 | - |
| invalid-value examples, AC 26 (5) | D16 empty C36 · D17 "12345" C36 · D10 "ana@" C36 · D12 empty C24 · D13 101 characters C36 | - |
| reopening, AC 28 (11 forms) | `work-order-form` C38 · `vessel-form` C38 · `work-order-service-form` C38 · `customer-form` C38 · `appointment-form` C38 · `inspection-template-form` C38 · `assign-to-work-order-form` C38 · `organization-form` C38 · `user-form` C38 · `invitation-form` C38 · `inspection-assignment-form` (created on each opening) C18 | - |
| request once, AC 29 (18) | D1 C13 · D2 C14 · D3 C15 · D4 C16 · D5 C17 · D6 C18 · D7 C19 · D8 C20 · D9 C21 · D10 C22 · D11 C23 · D12 C24 · D13 C25 · D14 C26 · D15 C27 · D16 C28 · D17 C29 · D18 C30 | - |
| saving state, AC 8 (18 drawers) | D1 C13 · D2 C14 · D3 C15 · D4 C16 · D5 C17 · D6 C18 · D7 C19 · D8 C20 · D9 C21 · D10 C22 · D11 C23 · D12 C24 · D13 C25 · D14 C26 · D15 C27 · D16 C28 · D17 C29 · D18 C30 | - |

## Swept

- validation: C34, C35, C36, C37; forms outside drawers keep today's touched validation C39
- failure modes: C28, C29, C30 (a failed request brings the save button back with the values kept); existing - `work-order-drawer.spec.ts` "work-order-ui C23 keeps the drawer and the values when the API fails" and each page's error toast (AD-026)
- idempotency: C13-C30 - one request per save, the button disabled while it runs (C10)
- authorization: existing - write controls render only for a Role that may write (AD-017, `shared/testing/write-access.ts`); this change adds no control and no route
- concurrency: n/a - one user's form in one tab; no shared state is written by the drawer itself
- data lifecycle: C20, C23, C26 - an edit drawer reopened after "Cancelar" shows the stored values
- dependency failure: C31 - D6 when the template request fails
- state transitions: C10, C34, C36, C37, C38 - Clean, Marked and Saving of the plan's state diagram
- observability: n/a - the web logs nothing for forms and the plan asks for nothing

## Handoff

- **Settled mid-build:** none
- **Dispatched:** four test-builder sub-agents at `16aa2a2` plus the uncommitted build (shared pieces, 11 forms, 10 pages), each writing only its spec files and committing nothing: (A) shared `drawer.spec.ts` and `drawer-forms.spec.ts` - C3-C11, C34-C38; (B) `work-order-drawer.spec.ts`, `work-order-detail.spec.ts`, `vessel-detail.spec.ts` - C13-C16, C17, C18, C21, C31; (C) `inspections-hub.spec.ts`, `inspection-template-detail.spec.ts`, `inspection-template-form.spec.ts`, `inspection-assignment-form.spec.ts`, `agenda.spec.ts` - C24-C27, C32, C33; (D) `vessel-list.spec.ts`, `customer-list.spec.ts`, `organization-list.spec.ts`, `organization-detail.spec.ts`, `organization-form.spec.ts`, `user-form.spec.ts` - C19, C20, C22, C23, C28-C30 - all four returned: every new title passes in its own run, no defect in the built code; B and D found the wrong routes in C20, C21, C29 and C30 (see Corrected); A notes the customer form's own message "Cidade é obrigatório" (asserted as written); D kept the titles of `customer-ui C21` and `C41`, which are proof lines of `customer-ui-redesign/checks.md`, changing only their assertions; Verifier at `66dfc38` (diff `16aa2a2..66dfc38`, `proofs.md` at `66dfc38`); screens round 1 at `66dfc38` (pictures taken at `315114f`, no code change since) - returned, both pictures match, no row differs (notes: the focus ring reads a stronger teal than in both captures, the dark surfaces 5-7 RGB units darker than the user's screenshot and its crop 5px lower); Verifier - returned FAIL, one finding (no check that forms outside drawers keep today's validation), closed by C39 at `5cf4de3`, then resumed for the C39 row only - returned, holds, verdict PASS; screens round 2 at `5cf4de3`, resuming the round-1 screens sub-agent, pictures retaken at `5cf4de3` (byte-identical to round 1) - returned, both pictures match, no regression
- **Boundary:** C1-C38 closed at `315114f`
- **Abandoned:** none
- **Corrected:** C20, C21, C29 and C30 named routes that do not exist (`PUT /api/vessels/:id`, `POST /api/organizations/:id/users`, `POST /api/organizations/:id/invitations`), a derivation error of the checks; the approved plan fixes the request each drawer sends today (AC 29, `## Surface` None), so the claims now name today's `PUT /api/customers/:customerId/vessels/:id`, `POST /api/users` and `POST /api/invitations` (found by test-builder B)
- **Walked:** at `315114f`, on an isolated stack started for the walk (PostgreSQL, Redis and Mailpit in new containers `ds-walk-pg`, `ds-walk-redis`, `ds-walk-mailpit` on ports 55600, 56600, 51600/58600; the API built from this checkout on 3335; `ng serve` on 4301 with a proxy to 3335), seeded through the API with fictional data only: the Customers "Pescados Atlântico" and "Cooperativa Mar Azul", the Vessels "Aurora" and "Ventania", one `IN_PROGRESS` WorkOrder on Aurora with "Pintura do casco" and "Revisão do motor", the template "Inspeção de segurança de bordo" (3 questions) and the client Organization "Estaleiro Baía Sul"; signed in as the seeded internal Administrator. Pictures by headless Google Chrome driven over the DevTools protocol (focus emulated so the focused field draws its ring): C1 `captures/work-order-drawer.light.running.png` - "Nova ordem de serviço" on `/work-orders` in the light theme in a 1440x1000 window, scrollbars hidden as in the Playwright run that took the light capture; C2 `captures/work-order-drawer.dark.running.png` - the same drawer in the dark theme in a 1440x956 window with classic scrollbars, as the user's capture shows them, keeping the 593 rightmost pixels unscaled (13px of the page and the 580px drawer, the composition of the capture; the window is wider than 593 because below 640px the drawer fills the window). C4: D1, D10, D13 and D18 at 1280/640/639/375 px read dialog widths 580/580/639/360 (D1, D10) and 580/580/624/360 (D13, D18): below 640px the dialog fills the window minus the page's own 15px vertical scrollbar where the page is long enough to have one (`scrollWidth` equals the dialog width, no horizontal scroll); every footer button ends at or before x=346 at 375px and at y≤789 of 800. C5: D13 with 20 questions in a 1280x800 window - body `scrollHeight` 4496 over `clientHeight` 615, scrolled to the end, "Criar modelo" at y 748-783 of 800 and the sheet title still at y 47. C12: computed backgrounds identical for D1, D10, D13 and D18 - light: body `oklab(0.968 -0.002 -0.003 / 0.6)`, card header `rgb(243, 247, 248)`, icon tile `rgb(227, 240, 239)`, footer `rgb(255, 255, 255)`; dark: body `oklab(0.263 -0.010 -0.026 / 0.6)`, card header `rgb(26, 38, 50)`, icon tile `rgb(23, 48, 47)`, footer `rgb(20, 30, 41)`. Also opened and looked at D5, D6, D10, D12, D13, D15, D16 and D17 at 1440x1000: each shows its kicker, title, description, its cards with icon tiles, red `*` on required labels, the focus ring on its first field and the footer "* Campos obrigatórios", "Cancelar" with the X and the save label with the check. A user reaches the states from "Nova ordem de serviço" (`/work-orders`), "Novo cliente" (`/customers`), "Novo modelo" and a card's "Atribuir à OS" (`/inspections`), "Novo serviço" and "Atribuir modelo" (`/work-orders/:id`), "Novo compromisso" (`/agenda`), "Nova Organização" (`/organizations`), "Novo usuário" and "Novo convite" (`/organizations/:id` of a client Organization). Seen in the walk: the first full suite run beside `ng serve` and Chrome exhausted the machine's memory and the desktop session restarted; the suite was rerun alone (311 tests green)
