import { Component, input, output, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';

import { Button } from '../../../shared/components/ui/button';
import { FormGroup, Input, Label, Select } from '../../../shared/components/ui/form';
import { UpdateWorkOrderRequest, WorkOrderStatus, workOrderStatusLabels } from '../work-order.service';

@Component({
  selector: 'work-order-form-ui',
  imports: [FormField, FormGroup, Label, Input, Select, Button],
  template: `
    <form class="flex flex-col gap-6" (submit)="submitForm($event)">
      <t-form-group>
        <label tLabel for="wo-start">Docagem</label>
        <input tInput id="wo-start" type="datetime-local" [formField]="workOrderForm.startDate" />
      </t-form-group>
      <t-form-group>
        <label tLabel for="wo-end">Desdocagem</label>
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
      <footer class="flex justify-end gap-3">
        <button tButton type="button" variant="outline" (click)="closed.emit()">Cancelar</button>
        <button tButton type="submit">Salvar</button>
      </footer>
    </form>
  `,
})
export class WorkOrderForm {
  submitted = output<UpdateWorkOrderRequest>();
  closed = output<void>();

  protected readonly statuses: WorkOrderStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
  protected readonly labels = workOrderStatusLabels;

  model = signal({
    startDate: '',
    endDate: '',
    status: 'PENDING' as WorkOrderStatus,
  });

  workOrderForm = form(this.model, (path) => {
    required(path.startDate);
    required(path.endDate);
    required(path.status);
  });

  reset() {
    this.workOrderForm().reset({ startDate: '', endDate: '', status: 'PENDING' });
  }

  submitForm(event: Event) {
    event.preventDefault();
    const value = this.workOrderForm().value();
    this.submitted.emit({
      startDate: new Date(value.startDate).toISOString(),
      endDate: new Date(value.endDate).toISOString(),
      status: value.status,
    });
  }
}
