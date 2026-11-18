import { Component, input, output, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';

import { provideIcons } from '@ng-icons/core';
import { lucideCalendarDays, lucideWrench } from '@ng-icons/lucide';

import { DrawerBody, DrawerCard, DrawerFooter, DrawerForm, RequiredMark } from '../../../shared/components/ui/drawer';
import { FormGroup, Input, Label, Select, Textarea } from '../../../shared/components/ui/form';
import { toLocalInput } from '../../work-order/components/work-order-form';
import { workOrderCode } from '../../work-order/work-order.service';
import { AssigneeKey, assigneeIds } from '../../../workforce/staff/assignee';
import { AssigneeOptions, AssigneeSelect } from '../../../workforce/staff/components/assignee-select';

export type AppointmentWorkOrder = { id: string; vesselName: string };

export type AppointmentRequest = {
  workOrderId: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  staffId?: string;
  teamId?: string;
};

const blank = (start = '') => ({
  workOrderId: '',
  name: '',
  description: '',
  startDate: start,
  endDate: '',
  assignee: '' as AssigneeKey,
});

/** The "Novo compromisso" drawer: a new service on an open WorkOrder (AD-037). */
@Component({
  selector: 'appointment-form-ui',
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
  host: { class: 'flex min-h-0 flex-1 flex-col' },
  template: `
    <form [tDrawerForm]="shownErrors()" novalidate (submit)="submitForm($event)">
      <t-drawer-body>
        <section tDrawerCard heading="Serviço" subheading="Escolha a ordem e descreva o serviço" icon="lucideWrench">
          <t-form-group>
            <label tLabel for="appointment-work-order">Ordem de serviço <t-required /></label>
            <select tSelect id="appointment-work-order" [formField]="appointmentForm.workOrderId">
              <option value="">Selecione a ordem de serviço</option>
              @for (order of workOrders(); track order.id) {
                <option [value]="order.id">{{ code(order.id) }} · {{ order.vesselName }}</option>
              }
            </select>
          </t-form-group>
          <t-form-group>
            <label tLabel for="appointment-name">Serviço <t-required /></label>
            <input
              tInput
              id="appointment-name"
              type="text"
              placeholder="Ex.: Revisão do motor"
              [formField]="appointmentForm.name"
            />
          </t-form-group>
          <t-form-group>
            <label tLabel for="appointment-description">Descrição <t-required /></label>
            <textarea tTextarea rows="3" id="appointment-description" [formField]="appointmentForm.description"></textarea>
          </t-form-group>
          @if (assignees(); as options) {
            <t-form-group>
              <label tLabel for="appointment-assignee">Responsável</label>
              <assignee-select-ui
                selectId="appointment-assignee"
                [options]="options"
                [formField]="appointmentForm.assignee"
              />
            </t-form-group>
          }
        </section>

        <section
          tDrawerCard
          heading="Planejamento"
          subheading="Defina o início e o fim do serviço"
          icon="lucideCalendarDays"
          [columns]="2"
        >
          <t-form-group>
            <label tLabel for="appointment-start">Início <t-required /></label>
            <input tInput id="appointment-start" type="datetime-local" [formField]="appointmentForm.startDate" />
          </t-form-group>
          <t-form-group>
            <label tLabel for="appointment-end">Fim <t-required /></label>
            <input tInput id="appointment-end" type="datetime-local" [formField]="appointmentForm.endDate" />
          </t-form-group>
        </section>
      </t-drawer-body>

      <footer tDrawerFooter submitLabel="Agendar serviço" [loading]="loading()" (cancelled)="closed.emit()"></footer>
    </form>
  `,
})
export class AppointmentForm {
  workOrders = input<AppointmentWorkOrder[]>([]);
  loading = input(false);
  /** The "Responsável" choices, for an administrator only; null hides the field (AD-078, AD-079). */
  assignees = input<AssigneeOptions | null>(null);
  submitted = output<AppointmentRequest>();
  closed = output<void>();

  protected readonly code = workOrderCode;
  protected readonly shownErrors = signal(false);

  model = signal(blank());
  appointmentForm = form(this.model, (path) => {
    required(path.workOrderId, { message: 'Ordem de serviço é obrigatória' });
    required(path.name, { message: 'Serviço é obrigatório' });
    required(path.description, { message: 'Descrição é obrigatória' });
    required(path.startDate, { message: 'Início é obrigatório' });
    required(path.endDate, { message: 'Fim é obrigatório' });
  });

  /** Empties the drawer with "Início" at `start`. */
  open(start: Date | null) {
    this.shownErrors.set(false);
    this.appointmentForm().reset(blank(start ? toLocalInput(start.toISOString()) : ''));
  }

  submitForm(event: Event) {
    event.preventDefault();
    this.shownErrors.set(true);
    if (this.appointmentForm().invalid()) return;
    const value = this.appointmentForm().value();
    this.submitted.emit({
      workOrderId: value.workOrderId,
      name: value.name.trim(),
      description: value.description.trim(),
      startDate: new Date(value.startDate).toISOString(),
      endDate: new Date(value.endDate).toISOString(),
      ...(this.assignees() ? assigneeIds(value.assignee) : {}),
    });
  }
}
