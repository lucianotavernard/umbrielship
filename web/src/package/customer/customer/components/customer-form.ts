import { Component, computed, effect, input, output, signal, untracked } from '@angular/core';
import { email, form, FormField, required } from '@angular/forms/signals';

import { provideIcons } from '@ng-icons/core';
import { lucideBuilding2, lucideMapPin } from '@ng-icons/lucide';

import { DrawerBody, DrawerCard, DrawerFooter, DrawerForm, RequiredMark } from '../../../shared/components/ui/drawer';
import { FormGroup, Input, Label, Select } from '../../../shared/components/ui/form';
import { STATES } from '../../../shared/constants/states';
import { CreateCustomerRequest, Customer } from '../customer.service';

const EMPTY = { name: '', email: '', phone: '', address: { address: '', city: '', state: '' } };

/** The "Novo cliente" / "Editar cliente" drawer in the standard frame (AD-053, AD-056), with today's rules (AD-028). */
@Component({
  selector: 'customer-form-ui',
  imports: [FormField, FormGroup, Label, Input, Select, DrawerForm, DrawerBody, DrawerCard, DrawerFooter, RequiredMark],
  viewProviders: [provideIcons({ lucideBuilding2, lucideMapPin })],
  template: `
    <form [tDrawerForm]="shownErrors()" novalidate (submit)="submitForm($event)">
      <t-drawer-body>
        <section
          tDrawerCard
          heading="Dados do cliente"
          subheading="Identificação e formas de contato"
          icon="lucideBuilding2"
          [columns]="2"
        >
          <t-form-group class="sm:col-span-2">
            <label tLabel for="name">Nome do cliente <t-required /></label>
            <input tInput id="name" type="text" placeholder="Ex.: Náutica Costa Sul" [formField]="customerForm.name" />
          </t-form-group>
          <t-form-group>
            <label tLabel for="email">E-mail <t-required /></label>
            <input
              tInput
              id="email"
              type="email"
              placeholder="contato@empresa.com.br"
              [formField]="customerForm.email"
            />
          </t-form-group>
          <t-form-group>
            <label tLabel for="phone">Telefone para contato <t-required /></label>
            <input tInput id="phone" type="tel" placeholder="(00) 00000-0000" [formField]="customerForm.phone" />
          </t-form-group>
        </section>

        <section tDrawerCard heading="Endereço" subheading="Localização do cliente" icon="lucideMapPin" [columns]="2">
          <t-form-group class="sm:col-span-2">
            <label tLabel for="address">Rua e número <t-required /></label>
            <input
              tInput
              id="address"
              type="text"
              placeholder="Rua, número e complemento"
              [formField]="customerForm.address.address"
            />
          </t-form-group>
          <t-form-group>
            <label tLabel for="city">Cidade <t-required /></label>
            <input tInput id="city" type="text" placeholder="Cidade" [formField]="customerForm.address.city" />
          </t-form-group>
          <t-form-group>
            <label tLabel for="state">Estado (UF) <t-required /></label>
            <select tSelect id="state" [formField]="customerForm.address.state">
              <option value="">Selecione o estado</option>
              @for (state of states; track state.value) {
                <option [value]="state.value">{{ state.label }}</option>
              }
            </select>
          </t-form-group>
        </section>
      </t-drawer-body>

      <footer tDrawerFooter [submitLabel]="submitLabel()" [loading]="loading()" (cancelled)="closed.emit()"></footer>
    </form>
  `,
  host: { class: 'flex min-h-0 flex-1 flex-col' },
})
export class CustomerForm {
  loading = input(false);
  customer = input<Customer | null>(null);

  submitted = output<CreateCustomerRequest>();
  closed = output<void>();

  protected readonly states = STATES;
  protected readonly submitLabel = computed(() =>
    this.customer() ? 'Salvar alterações' : 'Criar cliente',
  );

  /** Errors show once the save button was used (AD-057). */
  protected readonly shownErrors = signal(false);

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

    this.shownErrors.set(false);
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
    this.shownErrors.set(false);
    this.customerForm().reset(structuredClone(EMPTY));
  }

  submitForm(event: Event) {
    event.preventDefault();
    this.shownErrors.set(true);
    if (this.customerForm().invalid()) return;
    this.submitted.emit(this.customerForm().value());
  }
}
