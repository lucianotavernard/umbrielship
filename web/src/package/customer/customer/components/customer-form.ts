import { Component, output, signal } from '@angular/core';
import { email, form, FormField, required } from '@angular/forms/signals';

import { Button } from '../../../shared/components/ui/button';
import { FormGroup, Input, Label, Select } from '../../../shared/components/ui/form';
import { CreateCustomerRequest } from '../customer.service';

const STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR',
  'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

@Component({
  selector: 'customer-form-ui',
  imports: [FormField, FormGroup, Label, Input, Select, Button],
  template: `
    <form class="flex flex-col gap-6" (submit)="submitForm($event)">
      <section class="rounded-2xl border shadow-xs">
        <div class="border-b bg-muted px-6 py-4">
          <h3 class="text-sm font-semibold">Detalhes do Cliente</h3>
          <p class="text-xs text-muted-foreground">Informações básicas sobre o cliente</p>
        </div>
        <div class="grid gap-5 p-6">
          <t-form-group>
            <label tLabel for="name">Nome</label>
            <input tInput id="name" type="text" [formField]="customerForm.name" />
          </t-form-group>
          <t-form-group>
            <label tLabel for="email">E-mail</label>
            <input tInput id="email" type="email" [formField]="customerForm.email" />
          </t-form-group>
          <t-form-group>
            <label tLabel for="phone">Telefone</label>
            <input tInput id="phone" type="text" [formField]="customerForm.phone" />
          </t-form-group>
        </div>
      </section>

      <section class="rounded-2xl border shadow-xs">
        <div class="border-b bg-muted px-6 py-4">
          <h3 class="text-sm font-semibold">Localização & Endereço</h3>
          <p class="text-xs text-muted-foreground">Onde o cliente está localizado?</p>
        </div>
        <div class="grid gap-5 p-6 sm:grid-cols-2">
          <t-form-group class="sm:col-span-2">
            <label tLabel for="address">Endereço</label>
            <input tInput id="address" type="text" [formField]="customerForm.address.address" />
          </t-form-group>
          <t-form-group>
            <label tLabel for="city">Cidade</label>
            <input tInput id="city" type="text" [formField]="customerForm.address.city" />
          </t-form-group>
          <t-form-group>
            <label tLabel for="state">Estado</label>
            <select tSelect id="state" [formField]="customerForm.address.state">
              <option value="">Selecione o estado</option>
              @for (state of states; track state) {
                <option [value]="state">{{ state }}</option>
              }
            </select>
          </t-form-group>
        </div>
      </section>

      <footer class="flex justify-end gap-3">
        <button tButton type="button" variant="outline" (click)="closed.emit()">Cancelar</button>
        <button tButton type="submit" [disabled]="loading()">Salvar</button>
      </footer>
    </form>
  `,
})
export class CustomerForm {
  loading = signal(false);
  submitted = output<CreateCustomerRequest>();
  closed = output<void>();

  protected readonly states = STATES;

  model = signal({
    name: '',
    email: '',
    phone: '',
    address: { address: '', city: '', state: '' },
  });

  customerForm = form(this.model, (path) => {
    required(path.name);
    email(path.email);
    required(path.email);
    required(path.phone);
    required(path.address.address);
    required(path.address.city);
    required(path.address.state);
  });

  reset() {
    this.customerForm().reset({
      name: '',
      email: '',
      phone: '',
      address: { address: '', city: '', state: '' },
    });
  }

  submitForm(event: Event) {
    event.preventDefault();
    const value = this.customerForm().value();
    this.submitted.emit({
      name: value.name,
      email: value.email,
      phone: value.phone,
      address: {
        address: value.address.address,
        city: value.address.city,
        state: value.address.state,
      },
    });
  }
}
