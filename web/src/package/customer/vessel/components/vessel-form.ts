import { Component, computed, effect, input, output, signal, untracked } from '@angular/core';
import { form, FormField, hidden, required } from '@angular/forms/signals';

import { provideIcons } from '@ng-icons/core';
import { lucideAnchor, lucideRuler, lucideShip } from '@ng-icons/lucide';

import { DrawerBody, DrawerCard, DrawerFooter, DrawerForm, RequiredMark } from '../../../shared/components/ui/drawer';
import { FormGroup, Input, Label, Select } from '../../../shared/components/ui/form';
import { Customer } from '../../customer/customer.service';
import {
  CreateVesselRequest,
  VESSEL_STATUSES,
  VESSEL_TYPES,
  Vessel,
  VesselStatus,
  vesselStatusLabels,
  VesselType,
  vesselTypeLabels,
} from '../vessel.service';

/**
 * The fields of the mareos "Nova embarcação" / "Editar embarcação" drawer with today's rules (AD-028):
 * the Customer and the IMO number only on create. The "Operação" card holds the status alone, without
 * "Porto base" (AD-021, AD-099).
 */
@Component({
  selector: 'vessel-form-ui',
  imports: [FormField, FormGroup, Label, Input, Select, DrawerForm, DrawerBody, DrawerCard, DrawerFooter, RequiredMark],
  viewProviders: [provideIcons({ lucideShip, lucideRuler, lucideAnchor })],
  template: `
    <form [tDrawerForm]="shownErrors()" novalidate (submit)="submitForm($event)">
      <t-drawer-body>
        <section
          tDrawerCard
          heading="Detalhes da embarcação"
          subheading="Informações básicas sobre a embarcação"
          icon="lucideShip"
        >
          <t-form-group>
            <label tLabel for="vessel-name">Nome <t-required /></label>
            <input tInput id="vessel-name" type="text" placeholder="Ex.: Aurora" [formField]="vesselForm.name" />
          </t-form-group>
          @if (!vesselForm.customerId().hidden()) {
            <t-form-group>
              <label tLabel for="customerId">Cliente responsável <t-required /></label>
              <select tSelect id="customerId" [formField]="vesselForm.customerId">
                <option value="">Selecione o cliente</option>
                @for (customer of sortedCustomers(); track customer.id) {
                  <option [value]="customer.id">{{ customer.name }}</option>
                }
              </select>
            </t-form-group>
          }
        </section>

        <section
          tDrawerCard
          heading="Tipo e comprimento"
          subheading="Identificação e dimensões da embarcação"
          icon="lucideRuler"
          [columns]="2"
        >
          @if (!vesselForm.imoNumber().hidden()) {
            <t-form-group class="sm:col-span-2">
              <label tLabel for="imoNumber">Número IMO <t-required /></label>
              <input tInput id="imoNumber" type="text" placeholder="Ex.: 1234567" [formField]="vesselForm.imoNumber" />
            </t-form-group>
          }
          <t-form-group>
            <label tLabel for="type">Tipo de embarcação <t-required /></label>
            <select tSelect id="type" [formField]="vesselForm.type">
              <option value="">Selecione o tipo</option>
              @for (type of types; track type) {
                <option [value]="type">{{ labels[type] }}</option>
              }
            </select>
          </t-form-group>
          <t-form-group>
            <label tLabel for="length">Comprimento (m) <t-required /></label>
            <input
              tInput
              id="length"
              type="number"
              step="0.1"
              placeholder="Ex.: 32,5"
              [formField]="vesselForm.length"
            />
          </t-form-group>
        </section>

        <section
          tDrawerCard
          heading="Operação"
          subheading="Localização e situação atual da frota"
          icon="lucideAnchor"
        >
          <t-form-group>
            <label tLabel for="vessel-status">Status</label>
            <select tSelect id="vessel-status" [formField]="vesselForm.status">
              @for (status of statuses; track status) {
                <option [value]="status">{{ statusLabels[status] }}</option>
              }
            </select>
          </t-form-group>
        </section>
      </t-drawer-body>

      <footer
        tDrawerFooter
        [submitLabel]="vessel() ? 'Salvar alterações' : 'Criar embarcação'"
        [loading]="loading()"
        (cancelled)="closed.emit()"
      ></footer>
    </form>
  `,
  host: { class: 'flex min-h-0 flex-1 flex-col' },
})
export class VesselForm {
  loading = input(false);
  vessel = input<Vessel | null>(null);
  customers = input<Customer[]>([]);
  customerId = input('');

  submitted = output<CreateVesselRequest>();
  closed = output<void>();

  /** Errors show once the save button was used (AD-057). */
  protected readonly shownErrors = signal(false);

  protected readonly types = VESSEL_TYPES;
  protected readonly labels = vesselTypeLabels;
  protected readonly statuses = VESSEL_STATUSES;
  protected readonly statusLabels = vesselStatusLabels;
  protected readonly sortedCustomers = computed(() =>
    [...this.customers()].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
  );

  model = signal({
    name: '',
    customerId: '',
    imoNumber: '',
    type: '' as VesselType | '',
    length: '',
    status: 'ACTIVE' as VesselStatus,
  });

  vesselForm = form(this.model, (schemaPath) => {
    required(schemaPath.name, { message: 'Nome é obrigatório' });
    required(schemaPath.customerId, { message: 'Cliente é obrigatório' });
    required(schemaPath.imoNumber, { message: 'Número IMO é obrigatório' });
    required(schemaPath.type, { message: 'Tipo é obrigatório' });
    required(schemaPath.length, { message: 'Comprimento é obrigatório' });
    hidden(schemaPath.imoNumber, { when: () => !!this.vessel() });
    hidden(schemaPath.customerId, { when: () => !!this.vessel() || !!this.customerId() });
  });

  constructor() {
    effect(() => {
      const vessel = this.vessel();
      const customerId = this.customerId();
      untracked(() => this.load(vessel, customerId));
    });
  }

  /** Puts the Vessel's values in the fields (or empties them), whatever was typed before. */
  load(vessel: Vessel | null, customerId = this.customerId()) {
    this.shownErrors.set(false);
    this.vesselForm().reset(
      vessel
        ? {
            name: vessel.name,
            customerId: vessel.customerId,
            imoNumber: vessel.imoNumber,
            type: vessel.type,
            length: String(vessel.length),
            status: vessel.status ?? 'ACTIVE',
          }
        : { name: '', customerId, imoNumber: '', type: '', length: '', status: 'ACTIVE' },
    );
  }

  reset() {
    this.shownErrors.set(false);
    this.vesselForm().reset({
      name: '',
      customerId: this.customerId(),
      imoNumber: '',
      type: '',
      length: '',
      status: 'ACTIVE',
    });
  }

  submitForm(event: Event) {
    event.preventDefault();
    this.shownErrors.set(true);
    if (this.vesselForm().invalid()) return;
    const value = this.vesselForm().value();
    this.submitted.emit({
      name: value.name,
      customerId: value.customerId,
      imoNumber: value.imoNumber,
      type: value.type as VesselType,
      length: Number(value.length),
      status: value.status,
    });
  }
}
