import { Component, computed, effect, input, output, signal, untracked } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLoader2, lucidePlus } from '@ng-icons/lucide';

import { Button } from '../../../shared/components/ui/button';
import { FormGroup, Label, Select } from '../../../shared/components/ui/form';
import { WorkOrderRow } from '../../work-order/work-order-filters';
import { workOrderCode } from '../../work-order/work-order.service';
import { WHOLE_WORK_ORDER } from '../inspection-assignment.service';

export type AssignToWorkOrderRequest = { workOrderId: string; serviceId?: string };

/** The mareos "Atribuir inspeção" drawer with "Alvo" for "Inspetor responsável" (AD-046). */
@Component({
  selector: 'assign-to-work-order-form-ui',
  imports: [NgIcon, FormField, FormGroup, Label, Select, Button],
  viewProviders: [provideIcons({ lucideLoader2, lucidePlus })],
  host: { class: 'flex min-h-0 flex-1 flex-col' },
  template: `
    <form class="flex min-h-0 flex-1 flex-col" novalidate (submit)="submitForm($event)">
      <div class="flex min-h-0 flex-1 flex-col gap-[15px] overflow-y-auto px-[18px] py-[18px] sm:px-[25px]">
        <t-form-group class="gap-[7px]">
          <label tLabel for="assign-work-order" class="text-[10px] font-semibold">Ordem de serviço</label>
          <select tSelect id="assign-work-order" class="text-[11px]" [formField]="assignForm.workOrderId">
            <option value="">Selecione uma ordem</option>
            @for (order of workOrders(); track order.id) {
              <option [value]="order.id">{{ optionLabel(order) }}</option>
            }
          </select>
        </t-form-group>
        <t-form-group class="gap-[7px]">
          <label tLabel for="assign-target" class="text-[10px] font-semibold">Alvo</label>
          <select tSelect id="assign-target" class="text-[11px]" [formField]="assignForm.serviceId">
            <option value="">{{ wholeWorkOrder }}</option>
            @for (service of services(); track service.id) {
              <option [value]="service.id">{{ service.name }}</option>
            }
          </select>
        </t-form-group>
        <div data-slot="summary" class="rounded-[8px] border border-border bg-muted/50 px-[13px] py-2.5 text-[10px]">
          <strong class="font-semibold text-foreground">{{ questionCount() }} {{ questionCount() === 1 ? 'pergunta' : 'perguntas' }}</strong>
        </div>
      </div>
      <footer class="flex min-h-[70px] shrink-0 items-center justify-end gap-2 border-t border-border bg-card px-[14px] py-[11px] sm:px-[25px]">
        <button tButton type="button" variant="outline" class="h-[35px] text-[11px]" (click)="closed.emit()">Cancelar</button>
        <button tButton type="submit" class="h-[35px] px-[13px] text-[11px] font-semibold" [disabled]="loading()">
          @if (loading()) {
            <ng-icon name="lucideLoader2" class="animate-spin" />
            Salvando...
          } @else {
            <ng-icon name="lucidePlus" class="!size-[15px]" />
            Atribuir inspeção
          }
        </button>
      </footer>
    </form>
  `,
})
export class AssignToWorkOrderForm {
  workOrders = input<WorkOrderRow[]>([]);
  questionCount = input(0);
  loading = input(false);
  submitted = output<AssignToWorkOrderRequest>();
  closed = output<void>();

  protected readonly wholeWorkOrder = WHOLE_WORK_ORDER;

  model = signal({ workOrderId: '', serviceId: '' });
  assignForm = form(this.model, (path) => {
    required(path.workOrderId, { message: 'Ordem de serviço é obrigatória' });
  });

  constructor() {
    // A target belongs to one WorkOrder: choosing another one goes back to the whole WorkOrder.
    effect(() => {
      this.model().workOrderId;
      untracked(() => {
        if (this.model().serviceId && !this.services().some((service) => service.id === this.model().serviceId)) {
          this.model.update((model) => ({ ...model, serviceId: '' }));
        }
      });
    });
  }

  /** The services of the WorkOrder chosen, as `GET /work-orders` lists them. */
  protected readonly services = computed(
    () => this.workOrders().find((order) => order.id === this.model().workOrderId)?.services ?? [],
  );

  /** "#AB12CD34 · Aurora — Pintura do casco". */
  protected optionLabel(order: WorkOrderRow): string {
    return `${workOrderCode(order.id)} · ${order.vesselName} — ${order.services[0]?.name ?? 'Nenhum serviço'}`;
  }

  reset() {
    this.assignForm().reset({ workOrderId: '', serviceId: '' });
  }

  submitForm(event: Event) {
    event.preventDefault();
    this.assignForm().markAsTouched();
    if (this.assignForm().invalid()) return;
    const { workOrderId, serviceId } = this.assignForm().value();
    this.submitted.emit(serviceId ? { workOrderId, serviceId } : { workOrderId });
  }
}
