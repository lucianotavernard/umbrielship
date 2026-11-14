import { Component, input, output, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';

import { Button } from '../../../shared/components/ui/button';
import { FormGroup, Input, Label, Select } from '../../../shared/components/ui/form';
import {
  CreateWorkOrderServiceRequest,
  WorkOrderServiceStatus,
  workOrderServiceStatusLabels,
} from '../work-order-service.service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideWrench, lucideX, lucideCheck } from '@ng-icons/lucide';

@Component({
  selector: 'work-order-service-form-ui',
  imports: [NgIcon, FormField, FormGroup, Label, Input, Select, Button],
  viewProviders: [provideIcons({ lucideWrench, lucideX, lucideCheck })],
  template: `
    <form class="flex flex-col gap-6" (submit)="submitForm($event)">
      <section class="rounded-2xl shadow-xs border overflow-hidden">
        <div class="flex items-center gap-3 border-b bg-muted px-6 py-4">
          <div class="flex rounded-lg bg-background p-3 shadow-xs">
            <ng-icon name="lucideWrench" class="size-3" />
          </div>
          <div>
            <h3 class="text-sm font-semibold">Serviço</h3>
            <p class="text-xs text-muted-foreground">Nome, descrição e período</p>
          </div>
        </div>
        <div class="grid grid-cols-1 gap-x-6 gap-y-5 p-6 sm:grid-cols-6">
          <t-form-group class="sm:col-span-full">
            <label tLabel for="svc-name">Nome</label>
            <input tInput id="svc-name" type="text" placeholder="Pintura do casco" [formField]="serviceForm.name" />
          </t-form-group>
          <t-form-group class="sm:col-span-full">
            <label tLabel for="svc-description">Descrição</label>
            <input
              tInput
              id="svc-description"
              type="text"
              placeholder="Descreva o serviço executado"
              [formField]="serviceForm.description"
            />
          </t-form-group>
          <t-form-group class="sm:col-span-3">
            <label tLabel for="svc-start">Início</label>
            <input tInput id="svc-start" type="datetime-local" [formField]="serviceForm.startDate" />
          </t-form-group>
          <t-form-group class="sm:col-span-3">
            <label tLabel for="svc-end">Fim</label>
            <input tInput id="svc-end" type="datetime-local" [formField]="serviceForm.endDate" />
          </t-form-group>
          <t-form-group class="sm:col-span-full">
            <label tLabel for="svc-status">Status</label>
            <select tSelect id="svc-status" [formField]="serviceForm.status">
              @for (status of statuses; track status) {
                <option [value]="status">{{ labels[status] }}</option>
              }
            </select>
          </t-form-group>
        </div>
      </section>
      <footer class="flex items-center justify-end gap-3">
        <button tButton type="button" variant="outline" (click)="closed.emit()">
          <ng-icon name="lucideX" class="size-4" />
          Cancelar
        </button>
        <button tButton type="submit">
          @if (loading()) {
            <ng-icon name="lucideLoader2" class="animate-spin" />
            Salvando...
          } @else {
            <ng-icon name="lucideCheck" class="size-4" />
            Salvar
          }
        </button>
      </footer>
    </form>
  `,
})
export class WorkOrderServiceForm {
  loading = input(false);

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
    required(path.name, { message: 'Nome é obrigatório' });
    required(path.description, { message: 'Descrição é obrigatória' });
    required(path.startDate, { message: 'Data de início é obrigatória' });
    required(path.endDate, { message: 'Data de fim é obrigatória' });
    required(path.status, { message: 'Status é obrigatório' });
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
