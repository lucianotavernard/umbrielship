import { Component, computed, input, output, signal } from '@angular/core';
import { applyEach, disabled, form, FormField, maxLength, required } from '@angular/forms/signals';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCalendarDays, lucidePlus, lucideShip, lucideWrench, lucideX } from '@ng-icons/lucide';

import {
  DrawerAddButton,
  DrawerBody,
  DrawerCard,
  DrawerEntry,
  DrawerFooter,
  DrawerForm,
  RequiredMark,
} from '../../../shared/components/ui/drawer';
import { FormGroup, Input, Label, Select, Textarea } from '../../../shared/components/ui/form';
import {
  CreateWorkOrderRequest,
  WORK_ORDER_STATUSES,
  WorkOrderStatus,
  workOrderStatusLabels,
} from '../work-order.service';

/** A Vessel the drawer offers, with the Customer it belongs to. */
export type WorkOrderFormVessel = { id: string; name: string; customerId: string };

/** The WorkOrder the drawer edits: its Vessel stays, its services are edited on its page. */
export type WorkOrderFormValue = {
  vesselId: string;
  startDate: string;
  endDate: string;
  status: WorkOrderStatus;
};

export const SERVICE_DESCRIPTION_MAX = 240;

const pad = (value: number) => String(value).padStart(2, '0');

/** An ISO instant as a `datetime-local` value, in the browser's local time. */
export function toLocalInput(iso: string): string {
  if (!iso) return '';
  const date = new Date(iso);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

type Model = {
  vesselId: string;
  startDate: string;
  endDate: string;
  status: WorkOrderStatus;
  services: { name: string; description: string }[];
};

const blankService = () => ({ name: '', description: '' });

/**
 * The mareos "Nova ordem de serviço" drawer (AD-035, AD-044): Embarcação with its Customer read only,
 * "Serviços a realizar" (name and description each) and "Planejamento" (Docagem, Desdocagem, Status).
 * Editing hides the services and locks the Vessel.
 */
@Component({
  selector: 'work-order-form-ui',
  imports: [
    NgIcon,
    FormField,
    FormGroup,
    Label,
    Input,
    Select,
    Textarea,
    DrawerForm,
    DrawerBody,
    DrawerCard,
    DrawerEntry,
    DrawerAddButton,
    DrawerFooter,
    RequiredMark,
  ],
  viewProviders: [provideIcons({ lucideCalendarDays, lucidePlus, lucideShip, lucideWrench, lucideX })],
  template: `
    <form [tDrawerForm]="shownErrors()" novalidate (submit)="submitForm($event)">
      <t-drawer-body>
        <section tDrawerCard heading="Embarcação e cliente" subheading="Identifique a embarcação atendida" icon="lucideShip">
          <t-form-group>
            <label tLabel for="wo-vessel">Embarcação <t-required /></label>
            <select tSelect id="wo-vessel" [formField]="workOrderForm.vesselId">
              <option value="">Selecione uma embarcação</option>
              @for (vessel of sortedVessels(); track vessel.id) {
                <option [value]="vessel.id">{{ vessel.name }}</option>
              }
            </select>
          </t-form-group>
          <t-form-group>
            <label tLabel for="wo-customer">Cliente responsável</label>
            <input
              tInput
              id="wo-customer"
              type="text"
              readonly
              class="text-muted-foreground"
              placeholder="Definido pela embarcação"
              [value]="customerName()"
            />
          </t-form-group>
        </section>

        @if (!workOrder()) {
          <section
            tDrawerCard
            heading="Serviços a realizar"
            subheading="Adicione um ou mais serviços para esta embarcação"
            icon="lucideWrench"
          >
            @for (service of model().services; track $index; let index = $index) {
              <div tDrawerEntry data-slot="service-entry" [heading]="'Serviço ' + (index + 1)">
                @if (model().services.length > 1) {
                  <button
                    tDrawerEntryActions
                    type="button"
                    class="grid size-[26px] place-items-center rounded-[5px] text-muted-foreground hover:bg-muted hover:text-destructive"
                    [attr.aria-label]="'Remover serviço ' + (index + 1)"
                    (click)="removeService(index)"
                  >
                    <ng-icon name="lucideX" class="!size-3.5" />
                  </button>
                }
                <t-form-group>
                  <label tLabel [for]="'wo-service-name-' + index">Nome do serviço <t-required /></label>
                  <input
                    tInput
                    type="text"
                    [id]="'wo-service-name-' + index"
                    placeholder="Ex.: Revisão do motor principal"
                    [formField]="workOrderForm.services[index].name"
                  />
                </t-form-group>
                <t-form-group>
                  <label tLabel [for]="'wo-service-description-' + index">Descrição do serviço <t-required /></label>
                  <textarea
                    tTextarea
                    rows="3"
                    [id]="'wo-service-description-' + index"
                    placeholder="Ex.: Revisão do motor principal e troca de filtros"
                    [formField]="workOrderForm.services[index].description"
                  ></textarea>
                </t-form-group>
              </div>
            }
            <button tDrawerAdd type="button" (click)="addService()">
              <ng-icon name="lucidePlus" class="!size-3.5" />
              Adicionar serviço
            </button>
          </section>
        }

        <section
          tDrawerCard
          heading="Planejamento"
          subheading="Defina o período e o status da ordem"
          icon="lucideCalendarDays"
          [columns]="2"
        >
          <t-form-group>
            <label tLabel for="wo-start">Docagem <t-required /></label>
            <input tInput id="wo-start" type="datetime-local" [formField]="workOrderForm.startDate" />
          </t-form-group>
          <t-form-group>
            <label tLabel for="wo-end">Desdocagem <t-required /></label>
            <input tInput id="wo-end" type="datetime-local" [formField]="workOrderForm.endDate" />
          </t-form-group>
          <t-form-group>
            <label tLabel for="wo-status">Status</label>
            <select tSelect id="wo-status" [formField]="workOrderForm.status">
              @for (status of statuses; track status) {
                <option [value]="status">{{ labels[status] }}</option>
              }
            </select>
          </t-form-group>
        </section>
      </t-drawer-body>

      <footer
        tDrawerFooter
        [submitLabel]="workOrder() ? 'Salvar alterações' : 'Criar ordem'"
        [loading]="loading()"
        (cancelled)="closed.emit()"
      ></footer>
    </form>
  `,
  host: { class: 'flex min-h-0 flex-1 flex-col' },
})
export class WorkOrderForm {
  loading = input(false);
  vessels = input<WorkOrderFormVessel[]>([]);
  /** Customer names by id, for the read-only "Cliente responsável". */
  customerNames = input<ReadonlyMap<string, string>>(new Map());
  /** The WorkOrder being edited; null while creating one. */
  workOrder = input<WorkOrderFormValue | null>(null);
  /** A Vessel chosen by the page that opened the drawer (AD-042); the select is then locked. */
  lockedVesselId = input('');

  submitted = output<CreateWorkOrderRequest>();
  closed = output<void>();

  protected readonly statuses = WORK_ORDER_STATUSES;
  protected readonly labels = workOrderStatusLabels;

  /** Errors show once the save button was used, as the fields start empty (AD-057). */
  protected readonly shownErrors = signal(false);

  protected readonly sortedVessels = computed(() =>
    [...this.vessels()].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
  );

  protected readonly vesselLocked = computed(() => !!this.workOrder() || !!this.lockedVesselId());

  protected readonly customerName = computed(() => {
    const vessel = this.vessels().find((item) => item.id === this.model().vesselId);
    return vessel ? (this.customerNames().get(vessel.customerId) ?? '') : '';
  });

  model = signal<Model>({ vesselId: '', startDate: '', endDate: '', status: 'PENDING', services: [blankService()] });

  workOrderForm = form(this.model, (path) => {
    required(path.vesselId, { message: 'Embarcação é obrigatória' });
    disabled(path.vesselId, () => this.vesselLocked());
    required(path.startDate, { message: 'Data de início é obrigatória' });
    required(path.endDate, { message: 'Data de fim é obrigatória' });
    applyEach(path.services, (service) => {
      required(service.name, { message: 'Nome do serviço é obrigatório', when: () => !this.workOrder() });
      required(service.description, {
        message: 'Descrição do serviço é obrigatória',
        when: () => !this.workOrder(),
      });
      maxLength(service.description, SERVICE_DESCRIPTION_MAX);
    });
  });

  /** Empties the drawer for a new WorkOrder, keeping a Vessel the page chose. */
  reset() {
    this.shownErrors.set(false);
    this.workOrderForm().reset({
      vesselId: this.lockedVesselId(),
      startDate: '',
      endDate: '',
      status: 'PENDING',
      services: [blankService()],
    });
  }

  /** Puts the WorkOrder's values in the fields, whatever was typed before. */
  load(workOrder: WorkOrderFormValue) {
    this.shownErrors.set(false);
    this.workOrderForm().reset({
      vesselId: workOrder.vesselId,
      startDate: toLocalInput(workOrder.startDate),
      endDate: toLocalInput(workOrder.endDate),
      status: workOrder.status,
      services: [],
    });
  }

  addService() {
    this.model.update((model) => ({ ...model, services: [...model.services, blankService()] }));
  }

  removeService(index: number) {
    this.model.update((model) => ({ ...model, services: model.services.filter((_, at) => at !== index) }));
  }

  submitForm(event: Event) {
    event.preventDefault();
    this.shownErrors.set(true);
    this.workOrderForm().markAsTouched();
    if (this.workOrderForm().invalid()) return;

    const value = this.workOrderForm().value();
    const request: CreateWorkOrderRequest = {
      vesselId: value.vesselId,
      startDate: new Date(value.startDate).toISOString(),
      endDate: new Date(value.endDate).toISOString(),
      status: value.status,
    };
    if (!this.workOrder()) {
      request.services = value.services.map((service) => ({
        name: service.name.trim(),
        description: service.description.trim(),
      }));
    }
    this.submitted.emit(request);
  }
}
