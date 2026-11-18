import { Component, input, output, signal } from '@angular/core';
import { email, form, FormField, maxLength, minLength, required } from '@angular/forms/signals';

import { provideIcons } from '@ng-icons/core';
import { lucideShield, lucideUser } from '@ng-icons/lucide';

import { DrawerBody, DrawerCard, DrawerFooter, DrawerForm, RequiredMark } from '../../../shared/components/ui/drawer';
import { FormGroup, Input, Label, Select } from '../../../shared/components/ui/form';
import { CreateUserRequest, Role } from '../user.service';

export type UserFormValue = Omit<CreateUserRequest, 'organizationId'>;

@Component({
  selector: 'user-form-ui',
  imports: [FormField, FormGroup, Label, Input, Select, DrawerForm, DrawerBody, DrawerCard, DrawerFooter, RequiredMark],
  viewProviders: [provideIcons({ lucideShield, lucideUser })],
  host: { class: 'flex min-h-0 flex-1 flex-col' },
  template: `
    <form [tDrawerForm]="shownErrors()" novalidate (submit)="submitForm($event)">
      <t-drawer-body>
        <section
          tDrawerCard
          heading="Detalhes do usuário"
          subheading="Informações básicas sobre o usuário"
          icon="lucideUser"
        >
          <t-form-group>
            <label tLabel for="user-name">Nome <t-required /></label>
            <input tInput id="user-name" type="text" placeholder="Ana Souza" [formField]="userForm.name" />
          </t-form-group>
          <t-form-group>
            <label tLabel for="user-email">E-mail <t-required /></label>
            <input tInput id="user-email" type="email" placeholder="ana@acme.com" [formField]="userForm.email" />
          </t-form-group>
        </section>

        <section tDrawerCard heading="Acesso" subheading="Senha e papel do usuário na organização" icon="lucideShield">
          <t-form-group>
            <label tLabel for="user-password">Senha <t-required /></label>
            <input
              tInput
              id="user-password"
              type="password"
              placeholder="Mínimo de 8 caracteres"
              [formField]="userForm.password"
            />
          </t-form-group>
          <t-form-group>
            <label tLabel for="user-role">Papel</label>
            <select tSelect id="user-role" [formField]="userForm.role">
              <option value="administrator">Administrador</option>
              <option value="operator">Operador</option>
              <option value="inspector">Inspetor</option>
            </select>
          </t-form-group>
        </section>
      </t-drawer-body>

      <footer tDrawerFooter submitLabel="Criar usuário" [loading]="loading()" (cancelled)="closed.emit()"></footer>
    </form>
  `,
})
export class UserForm {
  loading = input(false);

  submitted = output<UserFormValue>();
  closed = output<void>();

  /** Errors show once the save button was used (AD-057). */
  protected readonly shownErrors = signal(false);

  model = signal<UserFormValue>({
    name: '',
    email: '',
    password: '',
    role: 'operator',
  });

  userForm = form(this.model, (path) => {
    required(path.name, { message: 'Nome é obrigatório' });
    maxLength(path.name, 80, { message: 'Nome deve ter no máximo 80 caracteres' });
    email(path.email, { message: 'E-mail inválido' });
    required(path.email, { message: 'E-mail é obrigatório' });
    required(path.password, { message: 'Senha é obrigatória' });
    minLength(path.password, 8, { message: 'Senha deve ter no mínimo 8 caracteres' });
    maxLength(path.password, 72, { message: 'Senha deve ter no máximo 72 caracteres' });
    required(path.role, { message: 'Papel é obrigatório' });
  });

  reset() {
    this.shownErrors.set(false);
    this.userForm().reset({ name: '', email: '', password: '', role: 'operator' });
  }

  submitForm(event: Event) {
    event.preventDefault();
    this.shownErrors.set(true);
    if (this.userForm().invalid()) return;
    const value = this.userForm().value();
    this.submitted.emit({
      name: value.name,
      email: value.email,
      password: value.password,
      role: value.role as Role,
    });
  }
}
