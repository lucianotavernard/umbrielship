import { Component, computed, input, output, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';

import { provideIcons } from '@ng-icons/core';
import { lucideClipboardCheck } from '@ng-icons/lucide';

import { DrawerBody, DrawerCard, DrawerFooter, DrawerForm, RequiredMark } from '../../../shared/components/ui/drawer';
import { FormGroup, Label, Select } from '../../../shared/components/ui/form';
import { InspectionTemplateSummary } from '../../inspection-template/inspection-template.service';
import { WorkOrderServiceItem } from '../../work-order-service/work-order-service.service';
import { AssignInspectionTemplateRequest, WHOLE_WORK_ORDER } from '../inspection-assignment.service';

@Component({
  selector: 'inspection-assignment-form-ui',
  imports: [FormField, FormGroup, Label, Select, DrawerForm, DrawerBody, DrawerCard, DrawerFooter, RequiredMark],
  viewProviders: [provideIcons({ lucideClipboardCheck })],
  host: { class: 'flex min-h-0 flex-1 flex-col' },
  template: `
    <form [tDrawerForm]="shownErrors()" novalidate (submit)="submitForm($event)">
      <t-drawer-body>
        <section tDrawerCard heading="Atribuição" subheading="Escolha o modelo e o alvo" icon="lucideClipboardCheck">
          @if (failed(); as message) {
            <p data-slot="assignment-message" class="text-[11px] text-destructive" role="alert">{{ message }}</p>
          } @else if (empty()) {
            <p data-slot="assignment-message" class="text-[11px] text-muted-foreground">Nenhum modelo de inspeção cadastrado</p>
          } @else {
            <t-form-group>
              <label tLabel for="assignment-template">Modelo <t-required /></label>
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
          }
        </section>
      </t-drawer-body>

      <!-- With nothing to assign the footer offers only Cancelar (AD-058). -->
      <footer
        tDrawerFooter
        [submitLabel]="failed() || empty() ? '' : 'Atribuir inspeção'"
        [loading]="loading()"
        (cancelled)="closed.emit()"
      ></footer>
    </form>
  `,
})
export class InspectionAssignmentForm {
  templates = input<InspectionTemplateSummary[]>([]);
  loadingTemplates = input(false);
  // The message to show when the templates could not be read; the form is not offered then.
  failed = input<string | null>(null);
  services = input<WorkOrderServiceItem[]>([]);
  loading = input(false);

  submitted = output<AssignInspectionTemplateRequest>();
  closed = output<void>();

  protected readonly wholeWorkOrder = WHOLE_WORK_ORDER;
  /** Errors show once the save button was used (AD-057). */
  protected readonly shownErrors = signal(false);
  /** Read, and the Organization has no template to assign. */
  protected readonly empty = computed(() => !this.loadingTemplates() && this.templates().length === 0);

  // An empty serviceId is the WorkOrder as a whole.
  model = signal({ templateId: '', serviceId: '' });

  assignmentForm = form(this.model, (path) => {
    required(path.templateId, { message: 'Modelo é obrigatório' });
  });

  submitForm(event: Event) {
    event.preventDefault();
    if (this.failed() || this.empty()) return;
    this.shownErrors.set(true);

    if (this.assignmentForm().invalid()) {
      return;
    }

    const { templateId, serviceId } = this.assignmentForm().value();
    this.submitted.emit(serviceId ? { templateId, serviceId } : { templateId });
  }
}
