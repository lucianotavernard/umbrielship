import { Component, computed, effect, input, output, signal, untracked } from '@angular/core';
import { email, form, FormField, required } from '@angular/forms/signals';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBuilding2, lucideLoader2, lucideMapPin, lucidePlus } from '@ng-icons/lucide';

import { Button } from '../../../shared/components/ui/button';
import { FormGroup, Input, Label, Select } from '../../../shared/components/ui/form';
import { STATES } from '../../../shared/constants/states';
import { CreateCustomerRequest, Customer } from '../customer.service';

const EMPTY = { name: '', email: '', phone: '', address: { address: '', city: '', state: '' } };

/** The fields of the mareos "Novo cliente" / "Editar cliente" drawer, with today's rules (AD-028). */
@Component({
  selector: 'customer-form-ui',
  imports: [NgIcon, FormField, FormGroup, Label, Input, Select, Button],
  viewProviders: [provideIcons({ lucideBuilding2, lucideMapPin, lucideLoader2, lucidePlus })],
  template: `
    <!-- The mareos client drawer: flat sections and the footer right under the fields. -->
    <form class="flex flex-col" (submit)="submitForm($event)">
      <div class="flex flex-col px-[13px] py-[14px] sm:px-[25px] sm:py-[19px]">
        <section class="mb-[17px]">
          <div class="mb-[13px] flex items-center gap-[9px]">
            <span class="grid size-[29px] shrink-0 place-items-center rounded-[7px] bg-[#e9f3f3] text-[#4b9295] dark:bg-[#17302f] dark:text-[#7cc7c2]">
              <ng-icon name="lucideBuilding2" class="!size-[15px]" />
            </span>
            <span>
              <strong class="block text-[11px] font-bold text-foreground">Dados do cliente</strong>
              <small class="mt-[3px] block text-[9px] text-muted-foreground">Identificação e formas de contato</small>
            </span>
          </div>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <t-form-group class="gap-1.5 sm:col-span-2">
              <label tLabel for="name" class="text-[9px] font-semibold text-foreground/70">
                Nome do cliente <span class="text-[#c6765c]">*</span>
              </label>
              <input
                tInput
                id="name"
                type="text"
                class="h-[35px] bg-card text-[10px] md:text-[10px]"
                placeholder="Ex.: Náutica Costa Sul"
                [formField]="customerForm.name"
              />
            </t-form-group>
            <t-form-group class="gap-1.5">
              <label tLabel for="email" class="text-[9px] font-semibold text-foreground/70">
                E-mail <span class="text-[#c6765c]">*</span>
              </label>
              <input
                tInput
                id="email"
                type="email"
                class="h-[35px] bg-card text-[10px] md:text-[10px]"
                placeholder="contato@empresa.com.br"
                [formField]="customerForm.email"
              />
            </t-form-group>
            <t-form-group class="gap-1.5">
              <label tLabel for="phone" class="text-[9px] font-semibold text-foreground/70">
                Telefone para contato <span class="text-[#c6765c]">*</span>
              </label>
              <input
                tInput
                id="phone"
                type="tel"
                class="h-[35px] bg-card text-[10px] md:text-[10px]"
                placeholder="(00) 00000-0000"
                [formField]="customerForm.phone"
              />
            </t-form-group>
          </div>
        </section>

        <section class="mb-[17px]">
          <div class="mb-[13px] flex items-center gap-[9px]">
            <span class="grid size-[29px] shrink-0 place-items-center rounded-[7px] bg-[#e9f3f3] text-[#4b9295] dark:bg-[#17302f] dark:text-[#7cc7c2]">
              <ng-icon name="lucideMapPin" class="!size-[15px]" />
            </span>
            <span>
              <strong class="block text-[11px] font-bold text-foreground">Endereço</strong>
              <small class="mt-[3px] block text-[9px] text-muted-foreground">Localização do cliente</small>
            </span>
          </div>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <t-form-group class="gap-1.5 sm:col-span-2">
              <label tLabel for="address" class="text-[9px] font-semibold text-foreground/70">
                Rua e número <span class="text-[#c6765c]">*</span>
              </label>
              <input
                tInput
                id="address"
                type="text"
                class="h-[35px] bg-card text-[10px] md:text-[10px]"
                placeholder="Rua, número e complemento"
                [formField]="customerForm.address.address"
              />
            </t-form-group>
            <t-form-group class="gap-1.5">
              <label tLabel for="city" class="text-[9px] font-semibold text-foreground/70">
                Cidade <span class="text-[#c6765c]">*</span>
              </label>
              <input
                tInput
                id="city"
                type="text"
                class="h-[35px] bg-card text-[10px] md:text-[10px]"
                placeholder="Cidade"
                [formField]="customerForm.address.city"
              />
            </t-form-group>
            <t-form-group class="gap-1.5">
              <label tLabel for="state" class="text-[9px] font-semibold text-foreground/70">
                Estado (UF) <span class="text-[#c6765c]">*</span>
              </label>
              <select tSelect id="state" class="h-[35px] bg-card text-[10px]" [formField]="customerForm.address.state">
                <option value="">Selecione o estado</option>
                @for (state of states; track state.value) {
                  <option [value]="state.value">{{ state.label }}</option>
                }
              </select>
            </t-form-group>
          </div>
        </section>
      </div>

      <footer
        class="flex min-h-[70px] flex-wrap items-center justify-between gap-2.5 border-t border-border bg-card px-[14px] py-[11px] sm:px-[25px] sm:py-3"
      >
        <span class="text-[9px] text-muted-foreground">
          Campos com <span class="text-[#c6765c]">*</span> são obrigatórios
        </span>
        <div class="flex items-center gap-2">
          <button tButton type="button" variant="outline" class="h-[35px] text-[11px]" (click)="closed.emit()">
            Cancelar
          </button>
          <button tButton type="submit" class="h-[35px] px-[13px] text-[11px] font-semibold" [disabled]="loading()">
            @if (loading()) {
              <ng-icon name="lucideLoader2" class="animate-spin" />
              Salvando...
            } @else {
              <ng-icon name="lucidePlus" class="!size-[15px]" />
              {{ submitLabel() }}
            }
          </button>
        </div>
      </footer>
    </form>
  `,
  host: { class: 'block bg-card' },
})
export class CustomerForm {
  loading = input(false);
  customer = input<Customer | null>(null);

  submitted = output<CreateCustomerRequest>();
  closed = output<void>();

  protected readonly states = STATES;
  protected readonly submitLabel = computed(() =>
    this.customer() ? 'Salvar alterações' : 'Cadastrar cliente',
  );

  model = signal(structuredClone(EMPTY));

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

      // Only the Customer is read here: resetting reads and writes the form, which must not re-run this.
      untracked(() => this.load(customer));
    });
  }

  /** Puts the Customer's values in the fields (or empties them), whatever was typed before. */
  load(customer: Customer | null) {
    if (!customer) {
      this.reset();
      return;
    }

    this.customerForm().reset({
      name: customer.name,
      email: customer.email,
      phone: customer.phone ?? '',
      address: {
        address: customer.address.address,
        city: customer.address.city,
        state: customer.address.state,
      },
    });
  }

  reset() {
    this.customerForm().reset(structuredClone(EMPTY));
  }

  submitForm(event: Event) {
    event.preventDefault();
    this.submitted.emit(this.customerForm().value());
  }
}
