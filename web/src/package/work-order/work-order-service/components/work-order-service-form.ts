import { Component, output, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';

import { Button } from '../../../shared/components/ui/button';
import { FormGroup, Input, Label, Select } from '../../../shared/components/ui/form';
import {
  CreateWorkOrderServiceRequest,
  WorkOrderServiceStatus,
  workOrderServiceStatusLabels,
} from '../work-order-service.service';

@Component({
  selector: 'work-order-service-form-ui',
  imports: [FormField, FormGroup, Label, Input, Select, Button],
  template: `
    <form class="flex flex-col gap-6" (submit)="submitForm($event)">
      <t-form-group>
        <label tLabel for="svc-name">Nome</label>
        <input tInput id="svc-name" type="text" [formField]="serviceForm.name" />
      </t-form-group>
      <t-form-group>
        <label tLabel for="svc-description">Descrição</label>
        <input tInput id="svc-description" type="text" [formField]="serviceForm.description" />
      </t-form-group>
      <t-form-group>
        <label tLabel for="svc-start">Início</label>
        <input tInput id="svc-start" type="datetime-local" [formField]="serviceForm.startDate" />
      </t-form-group>
      <t-form-group>
        <label tLabel for="svc-end">Fim</label>
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
      <footer class="flex justify-end gap-3">
        <button tButton type="button" variant="outline" (click)="closed.emit()">Cancelar</button>
        <button tButton type="submit">Salvar</button>
      </footer>
    </form>
  `,
})
export class WorkOrderServiceForm {
  submitted = output<CreateWorkOrderServiceRequest>();
  closed = output<void>();

  protected readonly statuses: WorkOrderServiceStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];
  protected readonly labels = workOrderServiceStatusLabels;

  model = signal({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'PENDING' as WorkOrderServiceStatus,
  });

  serviceForm = form(this.model, (path) => {
    required(path.name);
    required(path.description);
    required(path.startDate);
    required(path.endDate);
    required(path.status);
  });

  reset() {
    this.serviceForm().reset({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      status: 'PENDING',
    });
  }

  submitForm(event: Event) {
    event.preventDefault();
    const value = this.serviceForm().value();
    this.submitted.emit({
      name: value.name,
      description: value.description,
      startDate: new Date(value.startDate).toISOString(),
      endDate: new Date(value.endDate).toISOString(),
      status: value.status,
    });
  }
}
