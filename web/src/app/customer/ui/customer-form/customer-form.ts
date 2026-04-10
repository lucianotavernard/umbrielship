import { Component, effect, inject, input, output, signal } from '@angular/core';
import { email, form, FormField, required } from '@angular/forms/signals';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBuilding2, lucideMapPin, lucideLoader2 } from '@ng-icons/lucide';

import { FormGroup } from '@/shared/ui/form/form-group';
import { Label } from '@/shared/ui/form/label';
import { Input } from '@/shared/ui/form/input';
import { Button } from '@/shared/ui/button';

import { AuthService } from '@/identity/data-access/service/auth.service';
import { Router } from '@angular/router';
import { CustomerDto } from '@/customer/data-access/dto/customer.dto';

@Component({
  selector: 'customer-form-ui',
  templateUrl: './customer-form.html',
  imports: [NgIcon, FormField, FormGroup, Label, Input, Button],
  viewProviders: [provideIcons({ lucideBuilding2, lucideMapPin, lucideLoader2 })],
})
export class CustomerFormUi {
  protected readonly router = inject(Router);
  protected readonly authService = inject(AuthService);

  loading = input(false);
  customer = input<CustomerDto | null>(null);

  closed = output<void>();
  submitted = output<Omit<CustomerDto, 'id'>>();

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
  }

  handleSubmit(event: Event) {
    event.preventDefault();
    this.submitted.emit(this.customerSignal());
  }
}
