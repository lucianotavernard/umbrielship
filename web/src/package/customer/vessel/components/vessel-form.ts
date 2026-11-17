import { Component, computed, effect, ElementRef, input, output, signal, untracked, viewChild } from '@angular/core';
import { form, FormField, hidden, required } from '@angular/forms/signals';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideLoader2, lucideRuler, lucideShip, lucideX } from '@ng-icons/lucide';

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

/**
 * The fields of the mareos "Nova embarcação" / "Editar embarcação" drawer, without the "Operação"
 * card (AD-021) and with today's rules (AD-028): the Customer and the IMO number only on create.
 */
@Component({
  selector: 'vessel-form-ui',
  imports: [NgIcon, FormField, FormGroup, Label, Input, Select, Button],
  viewProviders: [provideIcons({ lucideCheck, lucideShip, lucideRuler, lucideLoader2, lucideX })],
  template: `
    <form class="flex min-h-0 flex-1 flex-col" (submit)="submitForm($event)">
      <div
        class="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto overscroll-y-contain bg-muted/60 px-[13px] py-[14px] sm:gap-[13px] sm:px-[25px] sm:py-[19px]"
      >
        <section class="overflow-hidden rounded-[11px] border border-border bg-card">
          <header class="flex min-h-[62px] items-center gap-[11px] border-b border-border bg-[#f3f7f8] px-[15px] py-[11px] dark:bg-muted">
            <span class="grid size-[34px] shrink-0 place-items-center rounded-lg bg-[#e3f0ef] text-primary dark:bg-[#17302f]">
              <ng-icon name="lucideShip" class="!size-[17px]" />
            </span>
            <span>
              <strong class="block text-[12px] font-semibold text-foreground">Detalhes da embarcação</strong>
              <small class="mt-0.5 block text-[10px] text-muted-foreground">Informações básicas sobre a embarcação</small>
            </span>
          </header>
          <div class="grid grid-cols-1 gap-[14px] px-[18px] pt-4 pb-[18px]">
            <t-form-group class="gap-[7px]">
              <label tLabel for="vessel-name" class="text-[10px] font-semibold">
                Nome <span class="text-destructive">*</span>
              </label>
              <input
                #nameInput
                tInput
                id="vessel-name"
                type="text"
                class="bg-card text-[11px] md:text-[11px]"
                placeholder="Ex.: Aurora"
                [formField]="vesselForm.name"
              />
            </t-form-group>
            @if (!vesselForm.customerId().hidden()) {
              <t-form-group class="gap-[7px]">
                <label tLabel for="customerId" class="text-[10px] font-semibold">
                  Cliente responsável <span class="text-destructive">*</span>
                </label>
                <select tSelect id="customerId" class="bg-card text-[11px]" [formField]="vesselForm.customerId">
                  <option value="">Selecione o cliente</option>
                  @for (customer of sortedCustomers(); track customer.id) {
                    <option [value]="customer.id">{{ customer.name }}</option>
                  }
                </select>
              </t-form-group>
            }
          </div>
        </section>

        <section class="overflow-hidden rounded-[11px] border border-border bg-card">
          <header class="flex min-h-[62px] items-center gap-[11px] border-b border-border bg-[#f3f7f8] px-[15px] py-[11px] dark:bg-muted">
            <span class="grid size-[34px] shrink-0 place-items-center rounded-lg bg-[#e3f0ef] text-primary dark:bg-[#17302f]">
              <ng-icon name="lucideRuler" class="!size-[17px]" />
            </span>
            <span>
              <strong class="block text-[12px] font-semibold text-foreground">Tipo e comprimento</strong>
              <small class="mt-0.5 block text-[10px] text-muted-foreground">Identificação e dimensões da embarcação</small>
            </span>
          </header>
          <div class="grid grid-cols-1 gap-[14px] px-[18px] pt-4 pb-[18px] sm:grid-cols-2">
            @if (!vesselForm.imoNumber().hidden()) {
              <t-form-group class="gap-[7px] sm:col-span-2">
                <label tLabel for="imoNumber" class="text-[10px] font-semibold">
                  Número IMO <span class="text-destructive">*</span>
                </label>
                <input
                  tInput
                  id="imoNumber"
                  type="text"
                  class="bg-card text-[11px] md:text-[11px]"
                  placeholder="Ex.: 1234567"
                  [formField]="vesselForm.imoNumber"
                />
              </t-form-group>
            }
            <t-form-group class="gap-[7px]">
              <label tLabel for="type" class="text-[10px] font-semibold">
                Tipo de embarcação <span class="text-destructive">*</span>
              </label>
              <select tSelect id="type" class="bg-card text-[11px]" [formField]="vesselForm.type">
                <option value="">Selecione o tipo</option>
                @for (type of types; track type) {
                  <option [value]="type">{{ labels[type] }}</option>
                }
              </select>
            </t-form-group>
            <t-form-group class="gap-[7px]">
              <label tLabel for="length" class="text-[10px] font-semibold">
                Comprimento (m) <span class="text-destructive">*</span>
              </label>
              <input
                tInput
                id="length"
                type="number"
                step="0.1"
                class="bg-card text-[11px] md:text-[11px]"
                placeholder="Ex.: 32,5"
                [formField]="vesselForm.length"
              />
            </t-form-group>
          </div>
        </section>
      </div>

      <footer
        class="flex min-h-[70px] shrink-0 flex-wrap items-center justify-between gap-3 border-t border-border bg-card px-[14px] py-[11px] sm:px-[25px] sm:py-3"
      >
        <span class="text-[10px] text-muted-foreground"><span class="text-destructive">*</span> Campos obrigatórios</span>
        <div class="flex items-center gap-1.5 sm:gap-2">
          <button tButton type="button" variant="outline" class="h-[35px] text-[11px]" (click)="closed.emit()">
            <ng-icon name="lucideX" class="!size-3.5" />
            Cancelar
          </button>
          <button tButton type="submit" class="h-[35px] px-[13px] text-[11px] font-semibold" [disabled]="loading()">
            @if (loading()) {
              <ng-icon name="lucideLoader2" class="animate-spin" />
              Salvando...
            } @else {
              <ng-icon name="lucideCheck" class="!size-[15px]" />
              {{ vessel() ? 'Salvar alterações' : 'Salvar embarcação' }}
            }
          </button>
        </div>
      </footer>
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

  private readonly nameInput = viewChild<ElementRef<HTMLInputElement>>('nameInput');

  protected readonly types = VESSEL_TYPES;
  protected readonly labels = vesselTypeLabels;
  protected readonly sortedCustomers = computed(() =>
    [...this.customers()].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
  );

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
      const customerId = this.customerId();
      untracked(() => this.load(vessel, customerId));
    });
  }

  /** Puts the Vessel's values in the fields (or empties them), whatever was typed before. */
  load(vessel: Vessel | null, customerId = this.customerId()) {
    this.vesselForm().reset(
      vessel
        ? {
            name: vessel.name,
            customerId: vessel.customerId,
            imoNumber: vessel.imoNumber,
            type: vessel.type,
            length: String(vessel.length),
          }
        : { name: '', customerId, imoNumber: '', type: '', length: '' },
    );
  }

  /** The mareos opens the drawer with the cursor in "Nome". */
  focusName() {
    setTimeout(() => this.nameInput()?.nativeElement.focus());
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
