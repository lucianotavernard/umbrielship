import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { Router } from '@angular/router';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBuilding2, lucideMapPin, lucideLoader2, lucideShip } from '@ng-icons/lucide';

import { FormGroup, Label, Input, Combobox } from '@/shared/ui/form';
import { Button } from '@/shared/ui/button';

import { VesselDto } from '@/customer/data-access/dto/vessel.dto';
import { CustomerDto } from '@/customer/data-access/dto/customer.dto';

@Component({
  selector: 'vessel-form-ui',
  templateUrl: './vessel-form.html',
  imports: [NgIcon, FormField, FormGroup, Label, Input, Combobox, Button],
  viewProviders: [provideIcons({ lucideBuilding2, lucideMapPin, lucideLoader2, lucideShip })],
})
export class VesselFormUi {
  protected readonly router = inject(Router);

  loading = input(false);
  vessel = input<VesselDto | null>(null);

  customer = input<CustomerDto | null>(null);
  customers = input<CustomerDto[]>([]);

  closed = output<void>();
  submitted = output<Omit<VesselDto, 'id' | 'customer'>>();

  types = signal([
    { value: 'CARGO', label: 'Embarcação de Carga' },
    { value: 'TANKER', label: 'Embarcação Tanque' },
    { value: 'PASSENGER', label: 'Embarcação de Passageiros' },
    { value: 'FISHING', label: 'Embarcação Pesqueira' },
    { value: 'BULK_CARRIER', label: 'Embarcação de Carga em Massa' },
    { value: 'CONTAINER', label: 'Embarcação de Container' },
    { value: 'OTHER', label: 'Outro' },
  ]);

  statuses = signal([
    { value: 'ACTIVE', label: 'Ativo' },
    { value: 'INACTIVE', label: 'Inativo' },
  ]);

  customerOptions = computed(() =>
    this.customers().map((customer) => ({ value: customer.id, label: customer.name })),
  );

  vesselSignal = signal({
    name: '',
    type: '',
    length: 0,
    imoNumber: '',
    customerId: '',
  });

  vesselForm = form(this.vesselSignal, (schemaPath) => {
    required(schemaPath.name);
    required(schemaPath.type);
    required(schemaPath.length);
    required(schemaPath.imoNumber);
    required(schemaPath.customerId);
  });

  constructor() {
    effect(() => {
      const vessel = this.vessel();
      const customer = this.customer();

      if (vessel) {
        this.vesselSignal.set({
          name: vessel.name,
          type: vessel.type,
          length: vessel.length,
          imoNumber: vessel.imoNumber,
          customerId: vessel.customerId,
        });
      }

      if (customer) {
        this.vesselSignal.update((state) => ({
          ...state,
          customerId: customer.id,
        }));
      }
    });
  }

  close() {
    this.closed.emit();
    this.vesselSignal.set({
      name: '',
      type: '',
      length: 0,
      imoNumber: '',
      customerId: this.customer()?.id ?? '',
    });
  }

  handleSubmit(event: Event) {
    event.preventDefault();
    this.submitted.emit(this.vesselSignal());
  }
}
