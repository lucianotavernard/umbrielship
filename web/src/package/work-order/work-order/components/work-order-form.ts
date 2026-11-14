import { Component, effect, input, output, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';

import { Button } from '../../../shared/components/ui/button';
import { FormGroup, Input, Label, Select } from '../../../shared/components/ui/form';
import {
  UpdateWorkOrderRequest,
  WorkOrderDetail,
  WorkOrderStatus,
  workOrderStatusLabels,
} from '../work-order.service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideClipboardList, lucideCheck, lucideLoader2, lucideX } from '@ng-icons/lucide';

@Component({
  selector: 'work-order-form-ui',
  imports: [NgIcon, FormField, FormGroup, Label, Input, Select, Button],
  viewProviders: [provideIcons({ lucideClipboardList, lucideCheck, lucideLoader2, lucideX })],
  template: `
    <form class="flex flex-col gap-6" (submit)="submitForm($event)">
      <section class="rounded-2xl shadow-xs border overflow-hidden">
        <div class="flex items-center gap-3 border-b bg-muted px-6 py-4">
          <div class="flex rounded-lg bg-background p-3 shadow-xs">
            <ng-icon name="lucideClipboardList" />
          </div>
          <div>
            <h3 class="text-sm font-semibold">Ordem de serviço</h3>
            <p class="text-xs text-muted-foreground">Datas e status da ordem</p>
          </div>
        </div>
        <div class="grid grid-cols-1 gap-x-6 gap-y-5 p-6 sm:grid-cols-6">
          <t-form-group class="sm:col-span-3">
            <label tLabel for="wo-start">Docagem</label>
            <input
              tInput
              id="wo-start"
              type="datetime-local"
              [formField]="workOrderForm.startDate"
            />
          </t-form-group>
          <t-form-group class="sm:col-span-3">
            <label tLabel for="wo-end">Desdocagem</label>
            <input tInput id="wo-end" type="datetime-local" [formField]="workOrderForm.endDate" />
          </t-form-group>
          <t-form-group class="sm:col-span-full">
            <label tLabel for="wo-status">Status</label>
            <select tSelect id="wo-status" [formField]="workOrderForm.status">
              @for (status of statuses; track status) {
                <option [value]="status">{{ labels[status] }}</option>
              }
            </select>
          </t-form-group>
        </div>
      </section>
      <footer class="flex items-center justify-end gap-3">
        <button tButton type="button" variant="outline" (click)="closed.emit()">
          <ng-icon name="lucideX" />
          Cancelar
        </button>
        <button tButton type="submit">
          @if (loading()) {
            <ng-icon name="lucideLoader2" class="animate-spin" />
            Salvando...
          } @else {
            <ng-icon name="lucideCheck" />
            Salvar
          }
        </button>
      </footer>
    </form>
  `,
})
export class WorkOrderForm {
  loading = input(false);
  workOrder = input<WorkOrderDetail | null>();
  vesselId = input('');

  submitted = output<UpdateWorkOrderRequest>();
  closed = output<void>();

  statuses: WorkOrderStatus[] = [
    'PENDING',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
  ];
  labels = workOrderStatusLabels;

  model = signal({
    vesselId: '',
    startDate: '',
    endDate: '',
    status: 'PENDING' as WorkOrderStatus,
  });

  workOrderForm = form(this.model, (path) => {
    required(path.vesselId, { message: 'Embarcação é obrigatória' });
    required(path.startDate, { message: 'Data de início é obrigatória' });
    required(path.endDate, { message: 'Data de fim é obrigatória' });
    required(path.status, { message: 'Status é obrigatório' });
  });

  constructor() {
    effect(() => {
      const workOrder = this.workOrder();

      if (workOrder) {
        this.model.set({
          vesselId: workOrder.vessel.vesselId,
          startDate: workOrder.startDate,
          endDate: workOrder.endDate,
          status: workOrder.status,
        });
      } else {
        this.model.set({
          vesselId: this.vesselId(),
          startDate: '',
          endDate: '',
          status: 'PENDING',
        });
      }
    });
  }

  reset() {
    this.workOrderForm().reset({
      vesselId: this.vesselId(),
      startDate: '',
      endDate: '',
      status: 'PENDING',
    });
  }

  submitForm(event: Event) {
    event.preventDefault();
    const value = this.workOrderForm().value();
    this.submitted.emit({
      vesselId: value.vesselId,
      startDate: new Date(value.startDate).toISOString(),
      endDate: new Date(value.endDate).toISOString(),
      status: value.status,
    });
  }
}
