import { Component, input, output, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';

import { Button } from '../../../shared/components/ui/button';
import { FormGroup, Input, Label, Select } from '../../../shared/components/ui/form';
import { Customer } from '../../customer/customer.service';
import { CreateVesselRequest, VESSEL_TYPES, vesselTypeLabels, VesselType } from '../vessel.service';

@Component({
  selector: 'vessel-form-ui',
  imports: [FormField, FormGroup, Label, Input, Select, Button],
  template: `
    <form class="flex flex-col gap-6" (submit)="submitForm($event)">
      <section class="rounded-2xl border shadow-xs">
        <div class="border-b bg-muted px-6 py-4">
          <h3 class="text-sm font-semibold">Detalhes da Embarcação</h3>
          <p class="text-xs text-muted-foreground">Informações básicas sobre a embarcação</p>
        </div>
        <div class="grid gap-5 p-6">
          <t-form-group>
            <label tLabel for="vessel-name">Nome</label>
            <input tInput id="vessel-name" type="text" [formField]="vesselForm.name" />
          </t-form-group>
          <t-form-group>
            <label tLabel for="customerId">Cliente</label>
            <select tSelect id="customerId" [formField]="vesselForm.customerId">
              <option value="">Selecione o cliente</option>
              @for (customer of customers(); track customer.id) {
                <option [value]="customer.id">{{ customer.name }}</option>
              }
            </select>
          </t-form-group>
          <t-form-group>
            <label tLabel for="imoNumber">Número IMO</label>
            <input tInput id="imoNumber" type="text" [formField]="vesselForm.imoNumber" />
          </t-form-group>
          <t-form-group>
            <label tLabel for="type">Tipo de Embarcação</label>
            <select tSelect id="type" [formField]="vesselForm.type">
              <option value="">Selecione o tipo</option>
              @for (type of types; track type) {
                <option [value]="type">{{ labels[type] }}</option>
              }
            </select>
          </t-form-group>
          <t-form-group>
            <label tLabel for="length">Comprimento</label>
            <input tInput id="length" type="number" [formField]="vesselForm.length" />
          </t-form-group>
        </div>
      </section>
      <footer class="flex justify-end gap-3">
        <button tButton type="button" variant="outline" (click)="closed.emit()">Cancelar</button>
        <button tButton type="submit">Salvar</button>
      </footer>
    </form>
  `,
})
export class VesselForm {
  customers = input<Customer[]>([]);
  submitted = output<CreateVesselRequest>();
  closed = output<void>();

  protected readonly types = VESSEL_TYPES;
  protected readonly labels = vesselTypeLabels;

  model = signal({
    name: '',
    customerId: '',
    imoNumber: '',
    type: '' as VesselType | '',
    length: '',
  });

  vesselForm = form(this.model, (path) => {
    required(path.name);
    required(path.customerId);
    required(path.imoNumber);
    required(path.type);
    required(path.length);
  });

  reset() {
    this.vesselForm().reset({ name: '', customerId: '', imoNumber: '', type: '', length: '' });
  }

  submitForm(event: Event) {
    event.preventDefault();
    const value = this.vesselForm().value();
    this.submitted.emit({
      name: value.name,
      customerId: value.customerId,
      imoNumber: value.imoNumber,
      type: value.type as VesselType,
      length: Number(value.length),
    });
  }
}
