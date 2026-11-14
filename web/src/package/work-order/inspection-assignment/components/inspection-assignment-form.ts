import { Component, input, output, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideLoader2, lucideX } from '@ng-icons/lucide';

import { Button } from '../../../shared/components/ui/button';
import { FormGroup, Label, Select } from '../../../shared/components/ui/form';
import { InspectionTemplateSummary } from '../../inspection-template/inspection-template.service';
import { WorkOrderServiceItem } from '../../work-order-service/work-order-service.service';
import { AssignInspectionTemplateRequest, WHOLE_WORK_ORDER } from '../inspection-assignment.service';

@Component({
  selector: 'inspection-assignment-form-ui',
  imports: [NgIcon, FormField, FormGroup, Label, Select, Button],
  viewProviders: [provideIcons({ lucideCheck, lucideLoader2, lucideX })],
  template: `
    @if (!loadingTemplates() && templates().length === 0) {
      <p class="rounded-lg border p-4 text-sm text-muted-foreground">Nenhum modelo de inspeção cadastrado</p>
      <footer class="mt-6 flex justify-end">
        <button tButton type="button" variant="outline" (click)="closed.emit()">
          <ng-icon name="lucideX" class="size-4" />
          Cancelar
        </button>
      </footer>
    } @else {
      <form class="flex flex-col gap-6" novalidate (submit)="submitForm($event)">
        <div class="flex flex-col gap-5">
          <t-form-group>
            <label tLabel for="assignment-template">Modelo</label>
            <select tSelect id="assignment-template" [formField]="assignmentForm.templateId">
              <option value="">Selecione um modelo</option>
              @for (template of templates(); track template.id) {
                <option [value]="template.id">{{ template.name }}</option>
              }
            </select>
          </t-form-group>
          <t-form-group>
            <label tLabel for="assignment-target">Alvo</label>
            <select tSelect id="assignment-target" [formField]="assignmentForm.serviceId">
              <option value="">{{ wholeWorkOrder }}</option>
              @for (service of services(); track service.id) {
                <option [value]="service.id">{{ service.name }}</option>
              }
            </select>
          </t-form-group>
        </div>
        <footer class="flex items-center justify-end gap-3">
          <button tButton type="button" variant="outline" (click)="closed.emit()">
            <ng-icon name="lucideX" class="size-4" />
            Cancelar
          </button>
          <button tButton type="submit" [disabled]="loading()">
            @if (loading()) {
              <ng-icon name="lucideLoader2" class="animate-spin" />
              Salvando...
            } @else {
              <ng-icon name="lucideCheck" class="size-4" />
              Atribuir
            }
          </button>
        </footer>
      </form>
    }
  `,
})
export class InspectionAssignmentForm {
  templates = input<InspectionTemplateSummary[]>([]);
  loadingTemplates = input(false);
  services = input<WorkOrderServiceItem[]>([]);
  loading = input(false);

  submitted = output<AssignInspectionTemplateRequest>();
  closed = output<void>();

  protected readonly wholeWorkOrder = WHOLE_WORK_ORDER;

  // An empty serviceId is the WorkOrder as a whole.
  model = signal({ templateId: '', serviceId: '' });

  assignmentForm = form(this.model, (path) => {
    required(path.templateId, { message: 'Modelo é obrigatório' });
  });

  submitForm(event: Event) {
    event.preventDefault();
    this.assignmentForm().markAsTouched();

    if (this.assignmentForm().invalid()) {
      return;
    }

    const { templateId, serviceId } = this.assignmentForm().value();
    this.submitted.emit(serviceId ? { templateId, serviceId } : { templateId });
  }
}
