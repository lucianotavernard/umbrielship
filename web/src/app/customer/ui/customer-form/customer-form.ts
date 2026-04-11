import { Component, effect, inject, input, output, signal } from '@angular/core';
import { email, form, FormField, required } from '@angular/forms/signals';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBuilding2, lucideMapPin, lucideLoader2 } from '@ng-icons/lucide';

import { FormGroup, Label, Input, Combobox } from '@/shared/ui/form';
import { Button } from '@/shared/ui/button';

import { AuthService } from '@/identity/data-access/service/auth.service';
import { Router } from '@angular/router';
import { CustomerDto } from '@/customer/data-access/dto/customer.dto';

@Component({
  selector: 'customer-form-ui',
  templateUrl: './customer-form.html',
  imports: [NgIcon, FormField, FormGroup, Label, Input, Combobox, Button],
  viewProviders: [provideIcons({ lucideBuilding2, lucideMapPin, lucideLoader2 })],
})
export class CustomerFormUi {
  protected readonly router = inject(Router);
  protected readonly authService = inject(AuthService);

  loading = input(false);
  customer = input<CustomerDto | null>(null);

  closed = output<void>();
  submitted = output<Omit<CustomerDto, 'id'>>();

  states = signal([
    { value: 'AC', label: 'Acre' },
    { value: 'AL', label: 'Alagoas' },
    { value: 'AP', label: 'Amapá' },
    { value: 'AM', label: 'Amazonas' },
    { value: 'BA', label: 'Bahia' },
    { value: 'CE', label: 'Ceará' },
    { value: 'DF', label: 'Distrito Federal' },
    { value: 'ES', label: 'Espírito Santo' },
    { value: 'GO', label: 'Goiás' },
    { value: 'MA', label: 'Maranhão' },
    { value: 'MT', label: 'Mato Grosso' },
    { value: 'MS', label: 'Mato Grosso do Sul' },
    { value: 'MG', label: 'Minas Gerais' },
    { value: 'PA', label: 'Pará' },
    { value: 'PB', label: 'Paraíba' },
    { value: 'PR', label: 'Paraná' },
    { value: 'PE', label: 'Pernambuco' },
    { value: 'PI', label: 'Piauí' },
    { value: 'RJ', label: 'Rio de Janeiro' },
    { value: 'RN', label: 'Rio Grande do Norte' },
    { value: 'RS', label: 'Rio Grande do Sul' },
    { value: 'RO', label: 'Rondônia' },
    { value: 'RR', label: 'Roraima' },
    { value: 'SC', label: 'Santa Catarina' },
    { value: 'SP', label: 'São Paulo' },
    { value: 'SE', label: 'Sergipe' },
    { value: 'TO', label: 'Tocantins' },
  ])

  customerSignal = signal({
    name: '',
    email: '',
    phone: '',
    address: {
      address: '',
      city: '',
      state: '',
    },
  });

  customerForm = form(this.customerSignal, (schemaPath) => {
    required(schemaPath.name);
    email(schemaPath.email);
    required(schemaPath.email);
    required(schemaPath.phone);
    required(schemaPath.address.address);
    required(schemaPath.address.city);
    required(schemaPath.address.state);
  });

  constructor() {
    effect(() => {
      const customer = this.customer();

      if (customer) {
        this.customerSignal.set({
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: {
            address: customer.address.address,
            city: customer.address.city,
            state: customer.address.state,
          },
        });
      }
    });
  }

  close() {
    this.closed.emit();
    this.customerSignal.set({
      name: '',
      email: '',
      phone: '',
      address: {
        address: '',
        city: '',
        state: '',
      },
    })
  }

  handleSubmit(event: Event) {
    event.preventDefault();
    // this.submitted.emit(this.customerSignal());
    console.log(this.customerSignal());
  }
}
