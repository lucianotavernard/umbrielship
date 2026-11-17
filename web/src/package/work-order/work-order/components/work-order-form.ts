import { Component, computed, ElementRef, input, output, signal, viewChild } from '@angular/core';
import { applyEach, disabled, form, FormField, maxLength, required } from '@angular/forms/signals';

import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCalendarDays,
  lucideCheck,
  lucideLoader2,
  lucidePlus,
  lucideShip,
  lucideWrench,
  lucideX,
} from '@ng-icons/lucide';

import { Button } from '../../../shared/components/ui/button';
import { FormGroup, Input, Label, Select } from '../../../shared/components/ui/form';
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

const card =
  'overflow-hidden rounded-[11px] border border-border bg-card';
const cardHeader =
  'flex min-h-[62px] items-center gap-[11px] border-b border-border bg-[#f3f7f8] px-[15px] py-[11px] dark:bg-muted';
const cardIcon =
  'grid size-[34px] shrink-0 place-items-center rounded-lg bg-[#e3f0ef] text-primary dark:bg-[#17302f]';
const fieldLabel = 'text-[10px] font-semibold';
const field = 'bg-card text-[11px] md:text-[11px]';
const textarea =
  'min-h-[75px] w-full resize-y rounded-md border border-input bg-card px-3 py-2 text-[11px] leading-[1.5] shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30';

/**
 * The mareos "Nova ordem de serviço" drawer (AD-035, AD-044): Embarcação with its Customer read only,
 * "Serviços a realizar" (name and description each) and "Planejamento" (Docagem, Desdocagem, Status).
 * Editing hides the services and locks the Vessel.
 */
@Component({
  selector: 'work-order-form-ui',
  imports: [NgIcon, FormField, FormGroup, Label, Input, Select, Button],
  viewProviders: [
    provideIcons({ lucideCalendarDays, lucideCheck, lucideLoader2, lucidePlus, lucideShip, lucideWrench, lucideX }),
  ],
  template: `
    <form class="flex min-h-0 flex-1 flex-col" novalidate (submit)="submitForm($event)">
      <div
        class="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto overscroll-y-contain bg-muted/60 px-[13px] py-[14px] sm:gap-[13px] sm:px-[25px] sm:py-[19px]"
      >
        <section [class]="card">
          <header [class]="cardHeader">
            <span [class]="cardIcon"><ng-icon name="lucideShip" class="!size-[17px]" /></span>
            <span>
              <strong class="block text-[12px] font-semibold text-foreground">Embarcação e cliente</strong>
              <small class="mt-0.5 block text-[10px] text-muted-foreground">Identifique a embarcação atendida</small>
            </span>
          </header>
          <div class="grid grid-cols-1 gap-[14px] px-[18px] pt-4 pb-[18px]">
            <t-form-group class="gap-[7px]">
              <label tLabel for="wo-vessel" [class]="fieldLabel">
                Embarcação <span class="text-destructive">*</span>
              </label>
              <select
                #vesselSelect
                tSelect
                id="wo-vessel"
                [class]="field"
                [formField]="workOrderForm.vesselId"
              >
                <option value="">Selecione uma embarcação</option>
                @for (vessel of sortedVessels(); track vessel.id) {
                  <option [value]="vessel.id">{{ vessel.name }}</option>
                }
              </select>
              @if (shownErrors()) {
                @for (error of workOrderForm.vesselId().errors(); track $index) {
                  <p data-slot="error" class="text-[10px] font-medium text-destructive">{{ error.message }}</p>
                }
              }
            </t-form-group>
            <t-form-group class="gap-[7px]">
              <label tLabel for="wo-customer" [class]="fieldLabel">Cliente responsável</label>
              <input
                tInput
                id="wo-customer"
                type="text"
                readonly
                [class]="field + ' text-muted-foreground'"
                placeholder="Definido pela embarcação"
                [value]="customerName()"
              />
            </t-form-group>
          </div>
        </section>

        @if (!workOrder()) {
          <section [class]="card">
            <header [class]="cardHeader">
              <span [class]="cardIcon"><ng-icon name="lucideWrench" class="!size-[17px]" /></span>
              <span>
                <strong class="block text-[12px] font-semibold text-foreground">Serviços a realizar</strong>
                <small class="mt-0.5 block text-[10px] text-muted-foreground">
                  Adicione um ou mais serviços para esta embarcação
                </small>
              </span>
            </header>
            <div class="flex flex-col gap-[14px] px-[18px] pt-4 pb-[18px]">
              @for (service of model().services; track $index; let index = $index) {
                <div
                  data-slot="service-entry"
                  class="flex flex-col gap-[12px] rounded-[9px] border border-border p-[13px]"
                  [attr.aria-label]="'Serviço ' + (index + 1)"
                  role="group"
                >
                  <div class="flex items-center justify-between">
                    <strong class="text-[11px] font-semibold text-foreground">Serviço {{ index + 1 }}</strong>
                    @if (model().services.length > 1) {
                      <button
                        type="button"
                        class="grid size-[26px] place-items-center rounded-[5px] text-muted-foreground hover:bg-muted hover:text-destructive"
                        [attr.aria-label]="'Remover serviço ' + (index + 1)"
                        (click)="removeService(index)"
                      >
                        <ng-icon name="lucideX" class="!size-3.5" />
                      </button>
                    }
                  </div>
                  <t-form-group class="gap-[7px]">
                    <label tLabel [for]="'wo-service-name-' + index" [class]="fieldLabel">
                      Nome do serviço <span class="text-destructive">*</span>
                    </label>
                    <input
                      tInput
                      type="text"
                      [id]="'wo-service-name-' + index"
                      [class]="field"
                      placeholder="Ex.: Revisão do motor principal"
                      [formField]="workOrderForm.services[index].name"
                    />
                    @if (shownErrors()) {
                      @for (error of workOrderForm.services[index].name().errors(); track $index) {
                        <p data-slot="error" class="text-[10px] font-medium text-destructive">{{ error.message }}</p>
                      }
                    }
                  </t-form-group>
                  <t-form-group class="gap-[7px]">
                    <label tLabel [for]="'wo-service-description-' + index" [class]="fieldLabel">
                      Descrição do serviço <span class="text-destructive">*</span>
                    </label>
                    <textarea
                      rows="3"
                      [id]="'wo-service-description-' + index"
                      [class]="textarea"
                      placeholder="Ex.: Revisão do motor principal e troca de filtros"
                      [formField]="workOrderForm.services[index].description"
                    ></textarea>
                    @if (shownErrors()) {
                      @for (error of workOrderForm.services[index].description().errors(); track $index) {
                        <p data-slot="error" class="text-[10px] font-medium text-destructive">{{ error.message }}</p>
                      }
                    }
                  </t-form-group>
                </div>
              }
              <button
                type="button"
                class="flex h-[31px] w-fit items-center gap-[7px] rounded-[6px] border border-dashed border-primary/50 bg-primary/5 px-[11px] text-[10px] font-semibold text-primary hover:bg-primary/10"
                (click)="addService()"
              >
                <ng-icon name="lucidePlus" class="!size-3.5" />
                Adicionar serviço
              </button>
            </div>
          </section>
        }

        <section [class]="card">
          <header [class]="cardHeader">
            <span [class]="cardIcon"><ng-icon name="lucideCalendarDays" class="!size-[17px]" /></span>
            <span>
              <strong class="block text-[12px] font-semibold text-foreground">Planejamento</strong>
              <small class="mt-0.5 block text-[10px] text-muted-foreground">Defina o período e o status da ordem</small>
            </span>
          </header>
          <div class="grid grid-cols-1 gap-[14px] px-[18px] pt-4 pb-[18px] sm:grid-cols-2">
            <t-form-group class="gap-[7px]">
              <label tLabel for="wo-start" [class]="fieldLabel">Docagem <span class="text-destructive">*</span></label>
              <input tInput id="wo-start" type="datetime-local" [class]="field" [formField]="workOrderForm.startDate" />
              @if (shownErrors()) {
                @for (error of workOrderForm.startDate().errors(); track $index) {
                  <p data-slot="error" class="text-[10px] font-medium text-destructive">{{ error.message }}</p>
                }
              }
            </t-form-group>
            <t-form-group class="gap-[7px]">
              <label tLabel for="wo-end" [class]="fieldLabel">Desdocagem <span class="text-destructive">*</span></label>
              <input tInput id="wo-end" type="datetime-local" [class]="field" [formField]="workOrderForm.endDate" />
              @if (shownErrors()) {
                @for (error of workOrderForm.endDate().errors(); track $index) {
                  <p data-slot="error" class="text-[10px] font-medium text-destructive">{{ error.message }}</p>
                }
              }
            </t-form-group>
            <t-form-group class="gap-[7px]">
              <label tLabel for="wo-status" [class]="fieldLabel">Status</label>
              <select tSelect id="wo-status" [class]="field" [formField]="workOrderForm.status">
                @for (status of statuses; track status) {
                  <option [value]="status">{{ labels[status] }}</option>
                }
              </select>
            </t-form-group>
          </div>
        </section>
      </div>

      <footer
        class="flex min-h-[70px] shrink-0 flex-wrap items-center justify-between gap-3 border-t border-border bg-card px-[14px] py-[11px] sm:px-[25px] sm:py-3"
      >
        <span class="text-[10px] text-muted-foreground"><span class="text-destructive">*</span> Campos obrigatórios</span>
        <div class="flex items-center gap-1.5 sm:gap-2">
          <button tButton type="button" variant="outline" class="h-[35px] text-[11px]" (click)="closed.emit()">
            <ng-icon name="lucideX" class="!size-3.5" />
            Cancelar
          </button>
          <button tButton type="submit" class="h-[35px] px-[13px] text-[11px] font-semibold" [disabled]="loading()">
            @if (loading()) {
              <ng-icon name="lucideLoader2" class="animate-spin" />
              Salvando...
            } @else {
              <ng-icon name="lucideCheck" class="!size-[15px]" />
              {{ workOrder() ? 'Salvar alterações' : 'Criar ordem' }}
            }
          </button>
        </div>
      </footer>
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

  private readonly vesselSelect = viewChild<ElementRef<HTMLSelectElement>>('vesselSelect');

  protected readonly statuses = WORK_ORDER_STATUSES;
  protected readonly labels = workOrderStatusLabels;
  protected readonly card = card;
  protected readonly cardHeader = cardHeader;
  protected readonly cardIcon = cardIcon;
  protected readonly fieldLabel = fieldLabel;
  protected readonly field = field;
  protected readonly textarea = textarea;

  /** Errors show once "Criar ordem" was used, as the fields start empty. */
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

  focusFirst() {
    setTimeout(() => this.vesselSelect()?.nativeElement.focus());
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
