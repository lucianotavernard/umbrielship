import { Component, computed, effect, input, output, signal, untracked } from '@angular/core';
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
import { AssigneeKey, assigneeIds } from '../../../workforce/staff/assignee';
import { AssigneeOptions, AssigneeSelect } from '../../../workforce/staff/components/assignee-select';
import type { WorkOrderServiceStatus } from '../../work-order-service/work-order-service.service';
import {
  CreateWorkOrderRequest,
  WORK_ORDER_STATUSES,
  WorkOrderServiceAssignee,
  WorkOrderStatus,
  workOrderStatusLabels,
} from '../work-order.service';

/** A Vessel the drawer offers, with the Customer it belongs to. */
export type WorkOrderFormVessel = { id: string; name: string; customerId: string };

/** A service of the WorkOrder being edited, with its current Responsável (AD-077). */
export type WorkOrderFormService = { id: string; name: string; status: WorkOrderServiceStatus; assignee: AssigneeKey };

/** The WorkOrder the drawer edits: its Vessel stays; only the Responsável of its services changes here. */
export type WorkOrderFormValue = {
  vesselId: string;
  startDate: string;
  endDate: string;
  status: WorkOrderStatus;
  services?: WorkOrderFormService[];
};

/** What the drawer sends: the new WorkOrder, or the edit with the Responsável of each listed service. */
export type WorkOrderFormSubmit = CreateWorkOrderRequest & { assignees?: WorkOrderServiceAssignee[] };

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
  services: { name: string; description: string; assignee: AssigneeKey }[];
  /** The services of the WorkOrder being edited; `original` is the Responsável it had when opened. */
  existing: (WorkOrderFormService & { original: AssigneeKey })[];
};

const blankService = () => ({ name: '', description: '', assignee: '' });

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
    AssigneeSelect,
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
                @if (assignees(); as options) {
                  <t-form-group>
                    <label tLabel [for]="'wo-service-assignee-' + index">Responsável</label>
                    <assignee-select-ui
                      [selectId]="'wo-service-assignee-' + index"
                      [options]="options"
                      [formField]="workOrderForm.services[index].assignee"
                    />
                  </t-form-group>
                }
              </div>
            }
            <button tDrawerAdd type="button" (click)="addService()">
              <ng-icon name="lucidePlus" class="!size-3.5" />
              Adicionar serviço
            </button>
          </section>
        }

        @if (workOrder() && assignees() && model().existing.length) {
          <section
            tDrawerCard
            heading="Serviços a realizar"
            subheading="Defina o responsável de cada serviço"
            icon="lucideWrench"
          >
            @for (service of model().existing; track service.id; let index = $index) {
              <div tDrawerEntry data-slot="existing-service" [heading]="'Serviço ' + (index + 1)">
                <t-form-group>
                  <label tLabel [for]="'wo-existing-name-' + index">Nome do serviço</label>
                  <input
                    tInput
                    type="text"
                    readonly
                    class="text-muted-foreground"
                    [id]="'wo-existing-name-' + index"
                    [value]="service.name"
                  />
                </t-form-group>
                <t-form-group>
                  <label tLabel [for]="'wo-existing-assignee-' + index">Responsável</label>
                  <assignee-select-ui
                    [selectId]="'wo-existing-assignee-' + index"
                    [options]="assignees()!"
                    [only]="isClosed(service) ? service.original : null"
                    [formField]="workOrderForm.existing[index].assignee"
                  />
                </t-form-group>
              </div>
            }
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
  /** The "Responsável" choices, for an administrator only; null hides the field (AD-079). */
  assignees = input<AssigneeOptions | null>(null);

  submitted = output<WorkOrderFormSubmit>();
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

  model = signal<Model>({
    vesselId: '',
    startDate: '',
    endDate: '',
    status: 'PENDING',
    services: [blankService()],
    existing: [],
  });

  /**
   * A service that takes no new Responsável: it is COMPLETED, or the WorkOrder is being closed
   * (AD-068); it keeps the one it had or none.
   */
  protected isClosed(service: { status: WorkOrderServiceStatus }) {
    return this.isClosedAt(service, this.model().status);
  }

  constructor() {
    // A service that turns closed goes back to the Responsável it had, unless it was cleared: the
    // select then shows what will be sent, and the API would refuse a new one (AD-068).
    effect(() => {
      const status = this.model().status;
      untracked(() => {
        const existing = this.model().existing;
        const reverted = existing.map((service) =>
          this.isClosedAt(service, status) && service.assignee !== '' && service.assignee !== service.original
            ? { ...service, assignee: service.original }
            : service,
        );
        if (reverted.some((service, index) => service !== existing[index])) {
          this.model.update((model) => ({ ...model, existing: reverted }));
        }
      });
    });
  }

  private isClosedAt(service: { status: WorkOrderServiceStatus }, status: WorkOrderStatus) {
    return service.status === 'COMPLETED' || status === 'COMPLETED' || status === 'CANCELLED';
  }

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
      existing: [],
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
      existing: (workOrder.services ?? []).map((service) => ({ ...service, original: service.assignee })),
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
    const request: WorkOrderFormSubmit = {
      vesselId: value.vesselId,
      startDate: new Date(value.startDate).toISOString(),
      endDate: new Date(value.endDate).toISOString(),
      status: value.status,
    };
    const assigning = this.assignees() !== null;
    if (!this.workOrder()) {
      request.services = value.services.map((service) => ({
        name: service.name.trim(),
        description: service.description.trim(),
        ...(assigning ? assigneeIds(service.assignee) : {}),
      }));
    } else if (assigning && value.existing.length) {
      request.assignees = value.existing.map((service) => ({ id: service.id, ...assigneeIds(service.assignee) }));
    }
    this.submitted.emit(request);
  }
}
