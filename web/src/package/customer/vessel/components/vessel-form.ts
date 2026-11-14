import { Component, effect, input, output, signal } from '@angular/core';
import { form, FormField, hidden, required } from '@angular/forms/signals';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBuilding2, lucideCheck, lucideLoader2, lucideRuler, lucideShip, lucideX } from '@ng-icons/lucide';

import { Button } from '../../../shared/components/ui/button';
import { FormGroup, Input, Label, Select } from '../../../shared/components/ui/form';
import { Customer } from '../../customer/customer.service';
import {
  CreateVesselRequest,
  VESSEL_TYPES,
  Vessel,
  VesselType,
  vesselTypeLabels,
} from '../vessel.service';

@Component({
  selector: 'vessel-form-ui',
  imports: [NgIcon, FormField, FormGroup, Label, Input, Select, Button],
  viewProviders: [provideIcons({ lucideCheck, lucideShip, lucideBuilding2, lucideRuler, lucideLoader2, lucideX })],
  template: `
    <form class="flex flex-col gap-6" (submit)="submitForm($event)">
      <section class="rounded-2xl shadow-xs border overflow-hidden">
        <div class="flex items-center gap-3 border-b bg-muted px-6 py-4">
          <div class="flex rounded-lg bg-background p-3 shadow-xs">
            <ng-icon name="lucideShip" />
          </div>
          <div>
            <h3 class="text-sm font-semibold">Detalhes da Embarcação</h3>
            <p class="text-xs text-muted-foreground">Informações básicas sobre a embarcação</p>
          </div>
        </div>
        <div class="grid grid-cols-1 gap-x-6 gap-y-5 p-6 sm:grid-cols-6">
          <t-form-group class="sm:col-span-full">
            <label tLabel for="vessel-name">Nome</label>
            <input
              tInput
              id="vessel-name"
              type="text"
              placeholder="Aurora"
              [formField]="vesselForm.name"
            />
          </t-form-group>
        </div>
      </section>

      @if (!vesselForm.customerId().hidden()) {
        <section class="rounded-2xl shadow-xs border overflow-hidden">
          <div class="flex items-center gap-3 border-b bg-muted px-6 py-4">
            <div class="flex rounded-lg bg-background p-3 shadow-xs">
              <ng-icon name="lucideBuilding2" />
            </div>
            <div>
              <h3 class="text-sm font-semibold">Cliente</h3>
              <p class="text-xs text-muted-foreground">Associação da embarcação com um cliente</p>
            </div>
          </div>
          <div class="grid grid-cols-1 gap-x-6 gap-y-5 p-6 sm:grid-cols-6">
            <t-form-group class="sm:col-span-full">
              <label tLabel for="customerId">Cliente</label>
              <select tSelect id="customerId" [formField]="vesselForm.customerId">
                <optgroup>
                  <option value="">Selecione o cliente</option>
                  @for (customer of customers(); track customer.id) {
                    <option [value]="customer.id">{{ customer.name }}</option>
                  }
                </optgroup>
              </select>
            </t-form-group>
          </div>
        </section>
      }

      <section class="rounded-2xl shadow-xs border overflow-hidden">
        <div class="flex items-center gap-3 border-b bg-muted px-6 py-4">
          <div class="flex rounded-lg bg-background p-3 shadow-xs">
            <ng-icon name="lucideRuler" />
          </div>
          <div>
            <h3 class="text-sm font-semibold">Tipo & Comprimento</h3>
            <p class="text-xs text-muted-foreground">
              Informações sobre o tipo e comprimento da embarcação
            </p>
          </div>
        </div>
        <div class="grid grid-cols-1 gap-x-6 gap-y-5 p-6 sm:grid-cols-6">
          @if (!vesselForm.imoNumber().hidden()) {
            <t-form-group class="sm:col-span-full">
              <label tLabel for="imoNumber">Número IMO</label>
              <input
                tInput
                id="imoNumber"
                type="text"
                placeholder="1234567"
                [formField]="vesselForm.imoNumber"
              />
            </t-form-group>
          }
          <t-form-group class="sm:col-span-4">
            <label tLabel for="type">Tipo de Embarcação</label>
            <select tSelect id="type" [formField]="vesselForm.type">
              <optgroup>
                <option value="">Selecione o tipo</option>
                @for (type of types; track type) {
                  <option [value]="type">{{ labels[type] }}</option>
                }
              </optgroup>
            </select>
          </t-form-group>
          <t-form-group class="sm:col-span-2">
            <label tLabel for="length">Comprimento</label>
            <input
              tInput
              id="length"
              type="number"
              placeholder="100"
              [formField]="vesselForm.length"
            />
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
export class VesselForm {
  loading = input(false);
  vessel = input<Vessel | null>(null);
  customers = input<Customer[]>([]);
  customerId = input('');

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

      if (vessel) {
        this.model.set({
          name: vessel.name,
          customerId: vessel.customerId,
          imoNumber: vessel.imoNumber,
          type: vessel.type,
          length: String(vessel.length),
        });
      } else {
        this.model.set({
          name: '',
          customerId: this.customerId(),
          imoNumber: '',
          type: '',
          length: '',
        });
      }
    });
  }

  reset() {
    this.vesselForm().reset({
      name: '',
      customerId: this.customerId(),
      imoNumber: '',
      type: '',
      length: '',
    });
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
