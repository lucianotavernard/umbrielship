import { Component, effect, input, output, signal } from '@angular/core';
import { email, form, FormField, required } from '@angular/forms/signals';

import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBuilding2,
  lucideMapPin,
  lucideLoader2,
  lucideCheck,
  lucideX,
} from '@ng-icons/lucide';

import { Button } from '../../../shared/components/ui/button';
import { FormGroup, Input, Label, Select } from '../../../shared/components/ui/form';
import { CreateCustomerRequest, Customer } from '../customer.service';
import { STATES } from '../../../shared/constants/states';

@Component({
  selector: 'customer-form-ui',
  imports: [NgIcon, FormField, FormGroup, Label, Input, Select, Button],
  viewProviders: [
    provideIcons({ lucideBuilding2, lucideMapPin, lucideLoader2, lucideCheck, lucideX }),
  ],
  template: `
    <form class="flex flex-col gap-6" (submit)="submitForm($event)">
      <section class="rounded-2xl shadow-xs border overflow-hidden">
        <div class="flex items-center gap-3 border-b bg-muted px-6 py-4">
          <div class="flex rounded-lg bg-background p-3 shadow-xs">
            <ng-icon name="lucideBuilding2" />
          </div>
          <div>
            <h3 class="text-sm font-semibold">Detalhes do Cliente</h3>
            <p class="text-xs text-muted-foreground">Informações básicas sobre o cliente</p>
          </div>
        </div>
        <div class="grid grid-cols-1 gap-x-6 gap-y-5 p-6 sm:grid-cols-6">
          <t-form-group class="sm:col-span-full">
            <label tLabel for="name">Nome</label>
            <input
              tInput
              id="name"
              type="text"
              placeholder="Acme Inc"
              [formField]="customerForm.name"
            />
          </t-form-group>
          <t-form-group class="sm:col-span-full">
            <label tLabel for="email">E-mail</label>
            <input
              tInput
              id="email"
              type="email"
              placeholder="acme@example.com"
              [formField]="customerForm.email"
            />
          </t-form-group>
          <t-form-group class="sm:col-span-full">
            <label tLabel for="phone">Telefone</label>
            <input
              tInput
              id="phone"
              type="tel"
              placeholder="(11) 99999-9999"
              [formField]="customerForm.phone"
            />
          </t-form-group>
        </div>
      </section>

      <section class="rounded-2xl shadow-xs border overflow-hidden">
        <div class="flex items-center gap-3 border-b bg-muted px-6 py-4">
          <div class="flex rounded-lg bg-background p-3 shadow-xs">
            <ng-icon name="lucideMapPin" />
          </div>
          <div>
            <h3 class="text-sm font-semibold">Localização & Endereço</h3>
            <p class="text-xs text-muted-foreground">Onde o cliente está localizado?</p>
          </div>
        </div>
        <div class="grid grid-cols-1 gap-x-6 gap-y-5 p-6 sm:grid-cols-6">
          <t-form-group class="sm:col-span-full">
            <label tLabel for="address">Endereço</label>
            <input
              tInput
              id="address"
              type="text"
              placeholder="Rua das Flores, 123"
              [formField]="customerForm.address.address"
            />
          </t-form-group>
          <t-form-group class="sm:col-span-3">
            <label tLabel for="city">Cidade</label>
            <input
              tInput
              id="city"
              type="text"
              placeholder="São Paulo"
              [formField]="customerForm.address.city"
            />
          </t-form-group>
          <t-form-group class="sm:col-span-3">
            <label tLabel for="state">Estado</label>
            <select tSelect id="state" [formField]="customerForm.address.state">
              <optgroup>
                <option value="">Selecione o estado</option>
                @for (state of states; track state.value) {
                  <option [value]="state.value">{{ state.label }}</option>
                }
              </optgroup>
            </select>
          </t-form-group>
        </div>
      </section>

      <footer class="flex items-center justify-end gap-3">
        <button tButton type="button" variant="outline" (click)="closed.emit()">
          <ng-icon name="lucideX" />
          Cancelar
        </button>
        <button tButton type="submit" [disabled]="loading()">
          @if (loading()) {
            <ng-icon name="lucideLoader2" class="animate-spin" />
            Salvando...
          } @else {
            <ng-icon name="lucideCheck" />
            Salvar
          }
        </button>
      </footer>
    </form>
  `,
})
export class CustomerForm {
  loading = input(false);
  customer = input<Customer | null>(null);

  submitted = output<CreateCustomerRequest>();
  closed = output<void>();

  protected readonly states = STATES;

  model = signal({
    name: '',
    email: '',
    phone: '',
    address: { address: '', city: '', state: '' },
  });

  customerForm = form(this.model, (schemaPath) => {
    required(schemaPath.name, { message: 'Nome é obrigatório' });
    email(schemaPath.email, { message: 'E-mail inválido' });
    required(schemaPath.email, { message: 'E-mail é obrigatório' });
    required(schemaPath.phone, { message: 'Telefone é obrigatório' });
    required(schemaPath.address.address, { message: 'Endereço é obrigatório' });
    required(schemaPath.address.city, { message: 'Cidade é obrigatório' });
    required(schemaPath.address.state, { message: 'Estado é obrigatório' });
  });

  constructor() {
    effect(() => {
      const customer = this.customer();

      if (customer) {
        this.model.set({
          name: customer.name,
          email: customer.email,
          phone: customer.phone ?? '',
          address: {
            city: customer.address.city,
            state: customer.address.state,
            address: customer.address.address,
          },
        });
      }
    });
  }

  reset() {
    this.customerForm().reset({
      name: '',
      email: '',
      phone: '',
      address: {
        city: '',
        state: '',
        address: '',
      },
    });
  }

  submitForm(event: Event) {
    event.preventDefault();
    this.submitted.emit(this.customerForm().value());
  }
}
