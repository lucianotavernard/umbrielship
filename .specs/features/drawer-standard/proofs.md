# drawer-standard proofs

**HEAD**: 8f054e1
**Tree**: clean
**Shell**: /bin/sh
**Result**: 93 pass, 0 fail

| Check | Proof | Result |
| --- | --- | --- |
| C1 | `browser - open "Nova ordem de serviço" on /work-orders in the light theme in a 1440x1000 window, save captures` | pass |
| C2 | `browser - open "Nova ordem de serviço" on /work-orders in the dark theme in a 1440x956 window, keep the 593 ri` | pass |
| C3 | `run web / ✓ drawer.spec.ts > Drawer > drawer-standard C3 the sheet header shows the kicker, title, description` | pass |
| C4 | `run web / ✓ drawer.spec.ts > Drawer > drawer-standard C4 the sheet fills the window below 640px and is 580px w` | pass |
| C4 | `walk - open D1, D10, D13 and D18 at 1280, 640, 639 and 375 px wide and read the dialog's width and the footer ` | pass (Walked) |
| C5 | `run web / ✓ drawer.spec.ts > Drawer > drawer-standard C5 a card shows a 34px icon tile, its title and subtitle` | pass |
| C5 | `walk - open D13 with 20 questions in a 1280x800 window, scroll the body and read that "Criar modelo" stays in ` | pass (Walked) |
| C6 | `run web / ✓ drawer.spec.ts > Drawer > drawer-standard C6 a drawer label takes the 10px semibold style and a re` | pass |
| C7 | `run web / ✓ drawer.spec.ts > Drawer > drawer-standard C7 the footer shows * Campos obrigatórios, then Cancelar` | pass |
| C8 | `run web / ✓ drawer.spec.ts > Drawer > drawer-standard C8 Cancelar is the 35px outline button with lucideX and ` | pass |
| C9 | `run web / ✓ drawer.spec.ts > Drawer > drawer-standard C9 the save button is the 35px primary submit with lucid` | pass |
| C10 | `run web / ✓ drawer.spec.ts > Drawer > drawer-standard C10 while loading the save button is disabled with lucid` | pass |
| C11 | `run web / ✓ drawer.spec.ts > Drawer > drawer-standard C11 the sheet focuses its first field that accepts input` | pass |
| C12 | `walk - open D1, D10, D13 and D18 in each theme and compare the computed background colours of the body, the fi` | pass (Walked) |
| C13 | `run web / ✓ work-order-drawer.spec.ts > WorkOrderDrawer > drawer-standard D1 Nova ordem de serviço keeps the s` | pass |
| C14 | `run web / ✓ work-order-drawer.spec.ts > WorkOrderDrawer > drawer-standard D2 Editar ordem de serviço keeps the` | pass |
| C15 | `run web / ✓ vessel-detail.spec.ts > VesselDetail > drawer-standard D3 Nova ordem focuses Nome do serviço with ` | pass |
| C16 | `run web / ✓ work-order-detail.spec.ts > WorkOrderDetail > drawer-standard D4 Editar ordem de serviço focuses D` | pass |
| C17 | `run web / ✓ work-order-detail.spec.ts > WorkOrderDetail > drawer-standard D5 Novo serviço opens with the Servi` | pass |
| C18 | `run web / ✓ work-order-detail.spec.ts > WorkOrderDetail > drawer-standard D6 Atribuir modelo de inspeção opens` | pass |
| C19 | `run web / ✓ vessel-list.spec.ts > VesselList > drawer-standard D7 Nova embarcação opens in the standard frame ` | pass |
| C20 | `run web / ✓ vessel-list.spec.ts > VesselList > drawer-standard D8 Editar embarcação opens in the standard fram` | pass |
| C21 | `run web / ✓ vessel-detail.spec.ts > VesselDetail > drawer-standard D9 Editar embarcação opens in the standard ` | pass |
| C22 | `run web / ✓ customer-list.spec.ts > CustomerList > drawer-standard D10 Novo cliente opens with the Dados do cl` | pass |
| C23 | `run web / ✓ customer-list.spec.ts > CustomerList > drawer-standard D11 Editar cliente reopens clean on the sam` | pass |
| C24 | `run web / ✓ agenda.spec.ts > Agenda > drawer-standard D12 Adicionar à agenda opens with the Serviço and Planej` | pass |
| C25 | `run web / ✓ inspections-hub.spec.ts > InspectionsHub > drawer-standard D13 Novo modelo opens with the Modelo a` | pass |
| C26 | `run web / ✓ inspection-template-detail.spec.ts > InspectionTemplateDetail > drawer-standard D14 Editar modelo ` | pass |
| C27 | `run web / ✓ inspections-hub.spec.ts > InspectionsHub > drawer-standard D15 Atribuir à OS opens with the Atribu` | pass |
| C28 | `run web / ✓ organization-list.spec.ts > OrganizationList > drawer-standard D16 Nova organização opens with GES` | pass |
| C29 | `run web / ✓ organization-detail.spec.ts > OrganizationDetail > drawer-standard D17 Novo usuário opens with the` | pass |
| C30 | `run web / ✓ organization-detail.spec.ts > OrganizationDetail > drawer-standard D18 Novo convite opens with the` | pass |
| C31 | `run web / ✓ work-order-detail.spec.ts > WorkOrderDetail > drawer-standard D6 without templates shows the messa` | pass |
| C31 | `run web / ✓ work-order-detail.spec.ts > WorkOrderDetail > drawer-standard D6 with a failed template load shows` | pass |
| C32 | `run web / ✓ inspection-template-form.spec.ts > InspectionTemplate form > drawer-standard C32 Adicionar pergunt` | pass |
| C33 | `run web / ✓ inspection-template-form.spec.ts > InspectionTemplate form > drawer-standard C33 Subir, Descer and` | pass |
| C34 | `run web / ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C34 work-order-form keeps the save button en` | pass |
| C34 | `run web / ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C34 vessel-form keeps the save button enable` | pass |
| C34 | `run web / ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C34 work-order-service-form keeps the save b` | pass |
| C34 | `run web / ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C34 customer-form keeps the save button enab` | pass |
| C34 | `run web / ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C34 appointment-form keeps the save button e` | pass |
| C34 | `run web / ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C34 inspection-template-form keeps the save ` | pass |
| C34 | `run web / ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C34 assign-to-work-order-form keeps the save` | pass |
| C34 | `run web / ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C34 inspection-assignment-form keeps the sav` | pass |
| C34 | `run web / ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C34 organization-form keeps the save button ` | pass |
| C34 | `run web / ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C34 user-form keeps the save button enabled ` | pass |
| C34 | `run web / ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C34 invitation-form keeps the save button en` | pass |
| C35 | `run web / ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C35 work-order-form shows no red and no mess` | pass |
| C35 | `run web / ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C35 vessel-form shows no red and no message ` | pass |
| C35 | `run web / ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C35 work-order-service-form shows no red and` | pass |
| C35 | `run web / ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C35 customer-form shows no red and no messag` | pass |
| C35 | `run web / ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C35 appointment-form shows no red and no mes` | pass |
| C35 | `run web / ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C35 inspection-template-form shows no red an` | pass |
| C35 | `run web / ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C35 assign-to-work-order-form shows no red a` | pass |
| C35 | `run web / ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C35 inspection-assignment-form shows no red ` | pass |
| C35 | `run web / ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C35 organization-form shows no red and no me` | pass |
| C35 | `run web / ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C35 user-form shows no red and no message af` | pass |
| C35 | `run web / ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C35 invitation-form shows no red and no mess` | pass |
| C36 | `run web / ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C36 work-order-form saved empty sends nothin` | pass |
| C36 | `run web / ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C36 vessel-form saved empty sends nothing an` | pass |
| C36 | `run web / ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C36 work-order-service-form saved empty send` | pass |
| C36 | `run web / ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C36 customer-form saved empty sends nothing ` | pass |
| C36 | `run web / ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C36 appointment-form saved empty sends nothi` | pass |
| C36 | `run web / ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C36 inspection-template-form saved empty sen` | pass |
| C36 | `run web / ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C36 assign-to-work-order-form saved empty se` | pass |
| C36 | `run web / ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C36 inspection-assignment-form saved empty s` | pass |
| C36 | `run web / ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C36 organization-form saved empty sends noth` | pass |
| C36 | `run web / ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C36 user-form saved empty sends nothing and ` | pass |
| C36 | `run web / ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C36 invitation-form saved empty sends nothin` | pass |
| C36 | `run web / ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C36 a short password, ana@ and a 101-charact` | pass |
| C37 | `run web / ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C37 work-order-form clears a corrected field` | pass |
| C37 | `run web / ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C37 vessel-form clears a corrected field at ` | pass |
| C37 | `run web / ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C37 work-order-service-form clears a correct` | pass |
| C37 | `run web / ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C37 customer-form clears a corrected field a` | pass |
| C37 | `run web / ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C37 appointment-form clears a corrected fiel` | pass |
| C37 | `run web / ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C37 inspection-template-form clears a correc` | pass |
| C37 | `run web / ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C37 assign-to-work-order-form clears a corre` | pass |
| C37 | `run web / ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C37 inspection-assignment-form clears a corr` | pass |
| C37 | `run web / ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C37 organization-form clears a corrected fie` | pass |
| C37 | `run web / ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C37 user-form clears a corrected field at on` | pass |
| C37 | `run web / ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C37 invitation-form clears a corrected field` | pass |
| C38 | `run web / ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C38 work-order-form shows no red and no mess` | pass |
| C38 | `run web / ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C38 vessel-form shows no red and no message ` | pass |
| C38 | `run web / ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C38 work-order-service-form shows no red and` | pass |
| C38 | `run web / ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C38 customer-form shows no red and no messag` | pass |
| C38 | `run web / ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C38 appointment-form shows no red and no mes` | pass |
| C38 | `run web / ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C38 inspection-template-form shows no red an` | pass |
| C38 | `run web / ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C38 assign-to-work-order-form shows no red a` | pass |
| C38 | `run web / ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C38 organization-form shows no red and no me` | pass |
| C38 | `run web / ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C38 user-form shows no red and no message af` | pass |
| C38 | `run web / ✓ drawer-forms.spec.ts > Drawer forms > drawer-standard C38 invitation-form shows no red and no mess` | pass |
| C39 | `run web / ✓ authentication-form.spec.ts > AuthenticationForm > drawer-standard C39 the sign-in form outside a ` | pass |
| Build | `cd web && npm run build` | pass |

## Output

`Run web` - exit 0

```
 ✓  web  src/package/work-order/work-order/__test__/work-order-list.spec.ts > WorkOrderList > work-order-ui C12 selects rows and the page, shows indeterminate and keeps the selection 369ms
 ✓  web  src/package/work-order/work-order/__test__/work-order-list.spec.ts > WorkOrderList > work-order-ui C13 exports the selected work orders, hidden ones included 68ms
 ✓  web  src/package/work-order/work-order/__test__/work-order-drawer.spec.ts > WorkOrderDrawer > drawer-standard D2 Editar ordem de serviço keeps the standard frame, focuses Docagem and puts once 223ms
 ✓  web  src/package/work-order/agenda/__test__/agenda.spec.ts > Agenda > work-order-ui C67 a cell opens the drawer at its hour and adds a pending service to the grid 147ms
 ✓  web  src/package/work-order/work-order/__test__/work-order-list.spec.ts > WorkOrderList > work-order-ui C14 the row menu opens the detail and deletes after confirmation 122ms
 ✓  web  src/package/work-order/work-order/__test__/work-order-list.spec.ts > WorkOrderList > work-order-ui C14 a 409 on delete keeps the row and shows the API message 71ms
 ✓  web  src/package/work-order/agenda/__test__/agenda.spec.ts > Agenda > work-order-ui C67 Novo compromisso and Adicionar compromisso neste dia start at the selected day at 08:00 121ms
 ✓  web  src/package/work-order/agenda/__test__/agenda.spec.ts > Agenda > work-order-ui C69 shows no team, availability, tide or demo text 46ms
 ✓  web  src/package/work-order/agenda/__test__/agenda.spec.ts > Agenda > work-order-ui C70 shows skeletons while loading and a toast when a request fails 100ms
 ✓  web  src/package/work-order/agenda/__test__/agenda.spec.ts > Agenda > drawer-standard D12 Adicionar à agenda opens with the Serviço and Planejamento cards and posts once 144ms

 Test Files  48 passed (48)
      Tests  312 passed (312)
   Start at  22:46:07
   Duration  6.28s (transform 6.23s, setup 8.72s, import 16.68s, tests 50.88s, environment 37.59s)
```
