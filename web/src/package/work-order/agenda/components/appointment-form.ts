import { Component, ElementRef, input, output, signal, viewChild } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLoader2, lucidePlus } from '@ng-icons/lucide';

import { Button } from '../../../shared/components/ui/button';
import { FormGroup, Input, Label, Select } from '../../../shared/components/ui/form';
import { toLocalInput } from '../../work-order/components/work-order-form';
import { workOrderCode } from '../../work-order/work-order.service';

export type AppointmentWorkOrder = { id: string; vesselName: string };

export type AppointmentRequest = {
  workOrderId: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
};

const blank = (start = '') => ({ workOrderId: '', name: '', description: '', startDate: start, endDate: '' });

/** The "Novo compromisso" drawer: a new service on an open WorkOrder (AD-037). */
@Component({
  selector: 'appointment-form-ui',
  imports: [NgIcon, FormField, FormGroup, Label, Input, Select, Button],
  viewProviders: [provideIcons({ lucideLoader2, lucidePlus })],
  host: { class: 'flex min-h-0 flex-1 flex-col' },
  template: `
    <form class="flex min-h-0 flex-1 flex-col" novalidate (submit)="submitForm($event)">
      <div class="flex min-h-0 flex-1 flex-col gap-[14px] overflow-y-auto px-[18px] py-[18px] sm:px-[25px]">
        <t-form-group class="gap-[7px]">
          <label tLabel for="appointment-work-order" class="text-[10px] font-semibold">
            Ordem de serviço <span class="text-destructive">*</span>
          </label>
          <select #workOrderSelect tSelect id="appointment-work-order" class="text-[11px]" [formField]="appointmentForm.workOrderId">
            <option value="">Selecione a ordem de serviço</option>
            @for (order of workOrders(); track order.id) {
              <option [value]="order.id">{{ code(order.id) }} · {{ order.vesselName }}</option>
            }
          </select>
        </t-form-group>
        <t-form-group class="gap-[7px]">
          <label tLabel for="appointment-name" class="text-[10px] font-semibold">Serviço <span class="text-destructive">*</span></label>
          <input
            tInput
            id="appointment-name"
            type="text"
            class="text-[11px] md:text-[11px]"
            placeholder="Ex.: Revisão do motor"
            [formField]="appointmentForm.name"
          />
        </t-form-group>
        <t-form-group class="gap-[7px]">
          <label tLabel for="appointment-description" class="text-[10px] font-semibold">
            Descrição <span class="text-destructive">*</span>
          </label>
          <input tInput id="appointment-description" type="text" class="text-[11px] md:text-[11px]" [formField]="appointmentForm.description" />
        </t-form-group>
        <div class="grid grid-cols-1 gap-[14px] sm:grid-cols-2">
          <t-form-group class="gap-[7px]">
            <label tLabel for="appointment-start" class="text-[10px] font-semibold">Início <span class="text-destructive">*</span></label>
            <input tInput id="appointment-start" type="datetime-local" class="text-[11px]" [formField]="appointmentForm.startDate" />
          </t-form-group>
          <t-form-group class="gap-[7px]">
            <label tLabel for="appointment-end" class="text-[10px] font-semibold">Fim <span class="text-destructive">*</span></label>
            <input tInput id="appointment-end" type="datetime-local" class="text-[11px]" [formField]="appointmentForm.endDate" />
          </t-form-group>
        </div>
        @if (shownErrors()) {
          <ul class="flex flex-col gap-1">
            @for (error of appointmentForm().errorSummary(); track $index) {
              <li data-slot="error" class="text-[10px] font-medium text-destructive">{{ error.message }}</li>
            }
          </ul>
        }
      </div>
      <footer class="flex min-h-[70px] shrink-0 items-center justify-end gap-2 border-t border-border bg-card px-[14px] py-[11px] sm:px-[25px]">
        <button tButton type="button" variant="outline" class="h-[35px] text-[11px]" (click)="closed.emit()">Cancelar</button>
        <button tButton type="submit" class="h-[35px] px-[13px] text-[11px] font-semibold" [disabled]="loading()">
          @if (loading()) {
            <ng-icon name="lucideLoader2" class="animate-spin" />
            Salvando...
          } @else {
            <ng-icon name="lucidePlus" class="!size-[15px]" />
            Agendar serviço
          }
        </button>
      </footer>
    </form>
  `,
})
export class AppointmentForm {
  workOrders = input<AppointmentWorkOrder[]>([]);
  loading = input(false);
  submitted = output<AppointmentRequest>();
  closed = output<void>();

  private readonly workOrderSelect = viewChild<ElementRef<HTMLSelectElement>>('workOrderSelect');
  protected readonly code = workOrderCode;
  protected readonly shownErrors = signal(false);

  model = signal(blank());
  appointmentForm = form(this.model, (path) => {
    required(path.workOrderId, { message: 'Ordem de serviço é obrigatória' });
    required(path.name, { message: 'Serviço é obrigatório' });
    required(path.description, { message: 'Descrição é obrigatória' });
    required(path.startDate, { message: 'Início é obrigatório' });
    required(path.endDate, { message: 'Fim é obrigatório' });
  });

  /** Empties the drawer with "Início" at `start`. */
  open(start: Date | null) {
    this.shownErrors.set(false);
    this.appointmentForm().reset(blank(start ? toLocalInput(start.toISOString()) : ''));
    setTimeout(() => this.workOrderSelect()?.nativeElement.focus());
  }

  submitForm(event: Event) {
    event.preventDefault();
    this.shownErrors.set(true);
    if (this.appointmentForm().invalid()) return;
    const value = this.appointmentForm().value();
    this.submitted.emit({
      workOrderId: value.workOrderId,
      name: value.name.trim(),
      description: value.description.trim(),
      startDate: new Date(value.startDate).toISOString(),
      endDate: new Date(value.endDate).toISOString(),
    });
  }
}
