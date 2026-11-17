import { Component, input, output, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideLoader2, lucideWrench, lucideX } from '@ng-icons/lucide';

import { Button } from '../../../shared/components/ui/button';
import { FormGroup, Input, Label, Select } from '../../../shared/components/ui/form';
import {
  CreateWorkOrderServiceRequest,
  WorkOrderServiceStatus,
  workOrderServiceStatusLabels,
} from '../work-order-service.service';

const blank = () => ({
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  status: 'PENDING' as WorkOrderServiceStatus,
});

/** The "Novo serviço" drawer of a WorkOrder, in the mareos form cards. */
@Component({
  selector: 'work-order-service-form-ui',
  imports: [NgIcon, FormField, FormGroup, Label, Input, Select, Button],
  viewProviders: [provideIcons({ lucideWrench, lucideX, lucideCheck, lucideLoader2 })],
  template: `
    <form class="flex min-h-0 flex-1 flex-col" novalidate (submit)="submitForm($event)">
      <div class="flex min-h-0 flex-1 flex-col overflow-y-auto bg-muted/60 px-[13px] py-[14px] sm:px-[25px] sm:py-[19px]">
        <section class="overflow-hidden rounded-[11px] border border-border bg-card">
          <header
            class="flex min-h-[62px] items-center gap-[11px] border-b border-border bg-[#f3f7f8] px-[15px] py-[11px] dark:bg-muted"
          >
            <span class="grid size-[34px] shrink-0 place-items-center rounded-lg bg-[#e3f0ef] text-primary dark:bg-[#17302f]">
              <ng-icon name="lucideWrench" class="!size-[17px]" />
            </span>
            <span>
              <strong class="block text-[12px] font-semibold text-foreground">Serviço</strong>
              <small class="mt-0.5 block text-[10px] text-muted-foreground">Nome, descrição e período</small>
            </span>
          </header>
          <div class="grid grid-cols-1 gap-[14px] px-[18px] pt-4 pb-[18px] sm:grid-cols-2">
            <t-form-group class="gap-[7px] sm:col-span-2">
              <label tLabel for="svc-name" class="text-[10px] font-semibold">Nome <span class="text-destructive">*</span></label>
              <input
                tInput
                id="svc-name"
                type="text"
                class="bg-card text-[11px] md:text-[11px]"
                placeholder="Pintura do casco"
                [formField]="serviceForm.name"
              />
            </t-form-group>
            <t-form-group class="gap-[7px] sm:col-span-2">
              <label tLabel for="svc-description" class="text-[10px] font-semibold">
                Descrição <span class="text-destructive">*</span>
              </label>
              <input
                tInput
                id="svc-description"
                type="text"
                class="bg-card text-[11px] md:text-[11px]"
                placeholder="Descreva o serviço executado"
                [formField]="serviceForm.description"
              />
            </t-form-group>
            <t-form-group class="gap-[7px]">
              <label tLabel for="svc-start" class="text-[10px] font-semibold">Início <span class="text-destructive">*</span></label>
              <input tInput id="svc-start" type="datetime-local" class="bg-card text-[11px]" [formField]="serviceForm.startDate" />
            </t-form-group>
            <t-form-group class="gap-[7px]">
              <label tLabel for="svc-end" class="text-[10px] font-semibold">Fim <span class="text-destructive">*</span></label>
              <input tInput id="svc-end" type="datetime-local" class="bg-card text-[11px]" [formField]="serviceForm.endDate" />
            </t-form-group>
            <t-form-group class="gap-[7px] sm:col-span-2">
              <label tLabel for="svc-status" class="text-[10px] font-semibold">Status</label>
              <select tSelect id="svc-status" class="bg-card text-[11px]" [formField]="serviceForm.status">
                @for (status of statuses; track status) {
                  <option [value]="status">{{ labels[status] }}</option>
                }
              </select>
            </t-form-group>
            @if (shownErrors()) {
              <ul class="flex flex-col gap-1 sm:col-span-2">
                @for (error of serviceForm().errorSummary(); track $index) {
                  <li data-slot="error" class="text-[10px] font-medium text-destructive">{{ error.message }}</li>
                }
              </ul>
            }
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
              Salvar
            }
          </button>
        </div>
      </footer>
    </form>
  `,
  host: { class: 'flex min-h-0 flex-1 flex-col' },
})
export class WorkOrderServiceForm {
  loading = input(false);

  submitted = output<CreateWorkOrderServiceRequest>();
  closed = output<void>();

  protected readonly statuses: WorkOrderServiceStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];
  protected readonly labels = workOrderServiceStatusLabels;
  protected readonly shownErrors = signal(false);

  model = signal(blank());

  serviceForm = form(this.model, (path) => {
    required(path.name, { message: 'Nome é obrigatório' });
    required(path.description, { message: 'Descrição é obrigatória' });
    required(path.startDate, { message: 'Data de início é obrigatória' });
    required(path.endDate, { message: 'Data de fim é obrigatória' });
  });

  reset() {
    this.shownErrors.set(false);
    this.serviceForm().reset(blank());
  }

  submitForm(event: Event) {
    event.preventDefault();
    this.shownErrors.set(true);
    if (this.serviceForm().invalid()) return;
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
