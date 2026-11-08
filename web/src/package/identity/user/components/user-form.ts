import { Component, output, signal } from '@angular/core';
import { email, form, FormField, maxLength, minLength, required } from '@angular/forms/signals';

import { Button } from '../../../shared/components/ui/button';
import { FormGroup, Input, Label, Select } from '../../../shared/components/ui/form';
import { CreateUserRequest, Role } from '../user.service';

export type UserFormValue = Omit<CreateUserRequest, 'organizationId'>;

@Component({
  selector: 'user-form-ui',
  imports: [FormField, FormGroup, Label, Input, Select, Button],
  template: `
    <form class="flex flex-col gap-6" (submit)="submitForm($event)">
      <t-form-group>
        <label tLabel for="user-name">Nome</label>
        <input tInput id="user-name" type="text" [formField]="userForm.name" />
      </t-form-group>
      <t-form-group>
        <label tLabel for="user-email">E-mail</label>
        <input tInput id="user-email" type="email" [formField]="userForm.email" />
      </t-form-group>
      <t-form-group>
        <label tLabel for="user-password">Senha</label>
        <input tInput id="user-password" type="password" [formField]="userForm.password" />
      </t-form-group>
      <t-form-group>
        <label tLabel for="user-role">Papel</label>
        <select tSelect id="user-role" [formField]="userForm.role">
          <option value="operator">Operador</option>
          <option value="administrator">Administrador</option>
        </select>
      </t-form-group>
      <footer class="flex justify-end gap-3">
        <button tButton type="button" variant="outline" (click)="closed.emit()">Cancelar</button>
        <button tButton type="submit">Salvar</button>
      </footer>
    </form>
  `,
})
export class UserForm {
  submitted = output<UserFormValue>();
  closed = output<void>();

  model = signal<UserFormValue>({
    name: '',
    email: '',
    password: '',
    role: 'operator',
  });

  userForm = form(this.model, (path) => {
    required(path.name);
    maxLength(path.name, 80);
    email(path.email);
    required(path.email);
    required(path.password);
    minLength(path.password, 8);
    maxLength(path.password, 72);
    required(path.role);
  });

  reset() {
    this.userForm().reset({ name: '', email: '', password: '', role: 'operator' });
  }

  submitForm(event: Event) {
    event.preventDefault();
    const value = this.userForm().value();
    this.submitted.emit({
      name: value.name,
      email: value.email,
      password: value.password,
      role: value.role as Role,
    });
  }
}
