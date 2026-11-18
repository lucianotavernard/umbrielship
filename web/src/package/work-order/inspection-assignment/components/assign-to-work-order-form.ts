import { Component, computed, effect, input, output, signal, untracked } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';

import { provideIcons } from '@ng-icons/core';
import { lucideClipboardCheck } from '@ng-icons/lucide';

import { DrawerBody, DrawerCard, DrawerFooter, DrawerForm, RequiredMark } from '../../../shared/components/ui/drawer';
import { FormGroup, Label, Select } from '../../../shared/components/ui/form';
import { WorkOrderRow } from '../../work-order/work-order-filters';
import { workOrderCode } from '../../work-order/work-order.service';
import { WHOLE_WORK_ORDER } from '../inspection-assignment.service';

export type AssignToWorkOrderRequest = { workOrderId: string; serviceId?: string };

/** The mareos "Atribuir inspeção" drawer with "Alvo" for "Inspetor responsável" (AD-046). */
@Component({
  selector: 'assign-to-work-order-form-ui',
  imports: [FormField, FormGroup, Label, Select, DrawerForm, DrawerBody, DrawerCard, DrawerFooter, RequiredMark],
  viewProviders: [provideIcons({ lucideClipboardCheck })],
  host: { class: 'flex min-h-0 flex-1 flex-col' },
  template: `
    <form [tDrawerForm]="shownErrors()" novalidate (submit)="submitForm($event)">
      <t-drawer-body>
        <section
          tDrawerCard
          heading="Atribuição"
          subheading="Escolha a ordem de serviço e o alvo"
          icon="lucideClipboardCheck"
        >
          <t-form-group>
            <label tLabel for="assign-work-order">Ordem de serviço <t-required /></label>
            <select tSelect id="assign-work-order" [formField]="assignForm.workOrderId">
              <option value="">Selecione uma ordem</option>
              @for (order of workOrders(); track order.id) {
                <option [value]="order.id">{{ optionLabel(order) }}</option>
              }
            </select>
          </t-form-group>
          <t-form-group>
            <label tLabel for="assign-target">Alvo</label>
            <select tSelect id="assign-target" [formField]="assignForm.serviceId">
              <option value="">{{ wholeWorkOrder }}</option>
              @for (service of services(); track service.id) {
                <option [value]="service.id">{{ service.name }}</option>
              }
            </select>
          </t-form-group>
          <div data-slot="summary" class="rounded-[6px] border border-border bg-muted/50 p-3 text-[10px]">
            <strong class="font-semibold text-foreground">{{ questionCount() }} {{ questionCount() === 1 ? 'pergunta' : 'perguntas' }}</strong>
          </div>
        </section>
      </t-drawer-body>

      <footer tDrawerFooter submitLabel="Atribuir inspeção" [loading]="loading()" (cancelled)="closed.emit()"></footer>
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
  /** Errors show once the save button was used (AD-057). */
  protected readonly shownErrors = signal(false);

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
    this.shownErrors.set(false);
    this.assignForm().reset({ workOrderId: '', serviceId: '' });
  }

  submitForm(event: Event) {
    event.preventDefault();
    this.shownErrors.set(true);
    if (this.assignForm().invalid()) return;
    const { workOrderId, serviceId } = this.assignForm().value();
    this.submitted.emit(serviceId ? { workOrderId, serviceId } : { workOrderId });
  }
}
