import { Component, input, output, signal } from '@angular/core';
import { email, form, FormField, maxLength, required } from '@angular/forms/signals';

import { provideIcons } from '@ng-icons/core';
import { lucideBuilding2 } from '@ng-icons/lucide';

import { DrawerBody, DrawerCard, DrawerFooter, DrawerForm, RequiredMark } from '../../../shared/components/ui/drawer';
import { FormGroup, Input, Label } from '../../../shared/components/ui/form';

@Component({
  selector: 'organization-form-ui',
  imports: [FormField, FormGroup, Label, Input, DrawerForm, DrawerBody, DrawerCard, DrawerFooter, RequiredMark],
  viewProviders: [provideIcons({ lucideBuilding2 })],
  host: { class: 'flex min-h-0 flex-1 flex-col' },
  template: `
    <form [tDrawerForm]="shownErrors()" novalidate (submit)="submitForm($event)">
      <t-drawer-body>
        <section
          tDrawerCard
          heading="Detalhes da organização"
          subheading="Informações básicas sobre a organização"
          icon="lucideBuilding2"
        >
          <t-form-group>
            <label tLabel for="organization-name">Nome <t-required /></label>
            <input
              tInput
              id="organization-name"
              type="text"
              placeholder="Acme Inc"
              [formField]="organizationForm.name"
            />
          </t-form-group>
          <t-form-group>
            <label tLabel for="organization-email">E-mail <t-required /></label>
            <input
              tInput
              id="organization-email"
              type="email"
              placeholder="contato@acme.com"
              [formField]="organizationForm.email"
            />
          </t-form-group>
        </section>
      </t-drawer-body>

      <footer tDrawerFooter submitLabel="Criar organização" [loading]="loading()" (cancelled)="closed.emit()"></footer>
    </form>
  `,
})
export class OrganizationForm {
  loading = input(false);

  submitted = output<{ name: string; email: string }>();
  closed = output<void>();

  /** Errors show once the save button was used (AD-057). */
  protected readonly shownErrors = signal(false);

  model = signal({ name: '', email: '' });

  organizationForm = form(this.model, (path) => {
    required(path.name, { message: 'Nome é obrigatório' });
    maxLength(path.name, 80, { message: 'Nome deve ter no máximo 80 caracteres' });
    email(path.email, { message: 'E-mail inválido' });
    required(path.email, { message: 'E-mail é obrigatório' });
  });

  reset() {
    this.shownErrors.set(false);
    this.organizationForm().reset({ name: '', email: '' });
  }

  submitForm(event: Event) {
    event.preventDefault();
    this.shownErrors.set(true);
    if (this.organizationForm().invalid()) return;
    this.submitted.emit(this.organizationForm().value());
  }
}
