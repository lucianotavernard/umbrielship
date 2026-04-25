import { Component, effect, input, output, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideClipboardList, lucideLoader2 } from '@ng-icons/lucide';

import { FormGroup, Label, Input, Combobox } from '@/shared/ui/form';
import { Button } from '@/shared/ui/button';

import type { WorkOrderDto } from '@/work-order/data-access/dto/work-order.dto';

@Component({
  selector: 'work-order-form-ui',
  templateUrl: './work-order-form.html',
  imports: [NgIcon, FormField, FormGroup, Label, Input, Combobox, Button],
  viewProviders: [provideIcons({ lucideClipboardList, lucideLoader2 })],
})
export class WorkOrderFormUi {
  loading = input(false);
  workOrder = input<WorkOrderDto | null>(null);

  closed = output<void>();
  submitted = output<Omit<WorkOrderDto, 'id'>>();

  statusOptions = signal([
    { value: 'PENDING', label: 'Pendente' },
    { value: 'IN_PROGRESS', label: 'Em andamento' },
    { value: 'COMPLETED', label: 'Concluído' },
    { value: 'CANCELLED', label: 'Cancelado' },
  ]);

  workOrderSignal = signal<Omit<WorkOrderDto, 'id'>>({
    vesselId: '',
    startDate: '',
    endDate: '',
    status: 'PENDING',
  });

  workOrderForm = form(this.workOrderSignal, (path) => {
    required(path.startDate);
    required(path.endDate);
    required(path.status);
    required(path.vesselId);
  });

  constructor() {
    effect(() => {
      const workOrder = this.workOrder();

      if (workOrder) {
        this.workOrderSignal.set({
          vesselId: workOrder.vesselId,
          startDate: workOrder.startDate,
          endDate: workOrder.endDate,
          status: workOrder.status,
        });
      }
    });
  }

  close() {
    this.closed.emit();
    this.workOrderSignal.set({
      startDate: '',
      endDate: '',
      status: 'PENDING',
      vesselId: '',
    });
  }

  handleSubmit(event: Event) {
    event.preventDefault();
    this.submitted.emit(this.workOrderSignal());
  }
}
