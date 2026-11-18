import { Component, input, output, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';

import { provideIcons } from '@ng-icons/core';
import { lucideCalendarDays, lucideWrench } from '@ng-icons/lucide';

import { DrawerBody, DrawerCard, DrawerFooter, DrawerForm, RequiredMark } from '../../../shared/components/ui/drawer';
import { FormGroup, Input, Label, Select, Textarea } from '../../../shared/components/ui/form';
import { AssigneeKey, assigneeIds } from '../../../workforce/staff/assignee';
import { AssigneeOptions, AssigneeSelect } from '../../../workforce/staff/components/assignee-select';
import {
  CreateWorkOrderServiceRequest,
  WorkOrderServiceStatus,
  workOrderServiceStatusLabels,
} from '../work-order-service.service';

const blank = () => ({
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  status: 'PENDING' as WorkOrderServiceStatus,
  assignee: '' as AssigneeKey,
});

/** The "Novo serviço" drawer of a WorkOrder: the cards "Serviço" and "Planejamento" (AD-056, AD-058). */
@Component({
  selector: 'work-order-service-form-ui',
  imports: [
    FormField,
    FormGroup,
    Label,
    Input,
    Select,
    Textarea,
    DrawerForm,
    DrawerBody,
    DrawerCard,
    DrawerFooter,
    RequiredMark,
    AssigneeSelect,
  ],
  viewProviders: [provideIcons({ lucideCalendarDays, lucideWrench })],
  template: `
    <form [tDrawerForm]="shownErrors()" novalidate (submit)="submitForm($event)">
      <t-drawer-body>
        <section tDrawerCard heading="Serviço" subheading="Identifique o serviço a realizar" icon="lucideWrench">
          <t-form-group>
            <label tLabel for="svc-name">Nome <t-required /></label>
            <input tInput id="svc-name" type="text" placeholder="Pintura do casco" [formField]="serviceForm.name" />
          </t-form-group>
          <t-form-group>
            <label tLabel for="svc-description">Descrição <t-required /></label>
            <textarea
              tTextarea
              rows="3"
              id="svc-description"
              placeholder="Descreva o serviço executado"
              [formField]="serviceForm.description"
            ></textarea>
          </t-form-group>
          @if (assignees(); as options) {
            <t-form-group>
              <label tLabel for="svc-assignee">Responsável</label>
              <assignee-select-ui selectId="svc-assignee" [options]="options" [formField]="serviceForm.assignee" />
            </t-form-group>
          }
        </section>

        <section
          tDrawerCard
          heading="Planejamento"
          subheading="Defina o período e o status do serviço"
          icon="lucideCalendarDays"
          [columns]="2"
        >
          <t-form-group>
            <label tLabel for="svc-start">Início <t-required /></label>
            <input tInput id="svc-start" type="datetime-local" [formField]="serviceForm.startDate" />
          </t-form-group>
          <t-form-group>
            <label tLabel for="svc-end">Fim <t-required /></label>
            <input tInput id="svc-end" type="datetime-local" [formField]="serviceForm.endDate" />
          </t-form-group>
          <t-form-group>
            <label tLabel for="svc-status">Status</label>
            <select tSelect id="svc-status" [formField]="serviceForm.status">
              @for (status of statuses; track status) {
                <option [value]="status">{{ labels[status] }}</option>
              }
            </select>
          </t-form-group>
        </section>
      </t-drawer-body>

      <footer tDrawerFooter submitLabel="Criar serviço" [loading]="loading()" (cancelled)="closed.emit()"></footer>
    </form>
  `,
  host: { class: 'flex min-h-0 flex-1 flex-col' },
})
export class WorkOrderServiceForm {
  loading = input(false);
  /** The "Responsável" choices, for an administrator only; null hides the field (AD-078, AD-079). */
  assignees = input<AssigneeOptions | null>(null);

  submitted = output<CreateWorkOrderServiceRequest>();
  closed = output<void>();

  protected readonly statuses: WorkOrderServiceStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];
  protected readonly labels = workOrderServiceStatusLabels;
  protected readonly shownErrors = signal(false);

  model = signal(blank());

  serviceForm = form(this.model, (path) => {
    required(path.name, { message: 'Nome é obrigatório' });
    required(path.description, { message: 'Descrição é obrigatória' });
    required(path.startDate, { message: 'Data de início é obrigatória' });
    required(path.endDate, { message: 'Data de fim é obrigatória' });
  });

  reset() {
    this.shownErrors.set(false);
    this.serviceForm().reset(blank());
  }

  submitForm(event: Event) {
    event.preventDefault();
    this.shownErrors.set(true);
    if (this.serviceForm().invalid()) return;
    const value = this.serviceForm().value();
    this.submitted.emit({
      name: value.name,
      description: value.description,
      startDate: new Date(value.startDate).toISOString(),
      endDate: new Date(value.endDate).toISOString(),
      status: value.status,
      ...(this.assignees() ? assigneeIds(value.assignee) : {}),
    });
  }
}
