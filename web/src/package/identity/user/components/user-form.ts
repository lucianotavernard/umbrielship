import { Component, output, signal } from '@angular/core';
import { email, form, FormField, maxLength, minLength, required } from '@angular/forms/signals';

import { Button } from '../../../shared/components/ui/button';
import { FormGroup, Input, Label, Select } from '../../../shared/components/ui/form';
import { Icon } from '../../../shared/components/ui/icon';
import { CreateUserRequest, Role } from '../user.service';

export type UserFormValue = Omit<CreateUserRequest, 'organizationId'>;

@Component({
  selector: 'user-form-ui',
  imports: [FormField, FormGroup, Label, Input, Select, Button, Icon],
  template: `
    <form class="flex flex-col gap-6" (submit)="submitForm($event)">
      <section class="rounded-2xl shadow-xs border overflow-hidden">
        <div class="flex items-center gap-3 border-b bg-muted px-6 py-4">
          <div class="flex rounded-lg bg-background p-3 shadow-xs">
            <svg tIcon name="user" />
          </div>
          <div>
            <h3 class="text-sm font-semibold">Detalhes do Usuário</h3>
            <p class="text-xs text-muted-foreground">Informações básicas sobre o usuário</p>
          </div>
        </div>
        <div class="grid grid-cols-1 gap-x-6 gap-y-5 p-6 sm:grid-cols-6">
          <t-form-group class="sm:col-span-full">
            <label tLabel for="user-name">Nome</label>
            <input tInput id="user-name" type="text" placeholder="Ana Souza" [formField]="userForm.name" />
          </t-form-group>
          <t-form-group class="sm:col-span-full">
            <label tLabel for="user-email">E-mail</label>
            <input tInput id="user-email" type="email" placeholder="ana@acme.com" [formField]="userForm.email" />
          </t-form-group>
        </div>
      </section>

      <section class="rounded-2xl shadow-xs border overflow-hidden">
        <div class="flex items-center gap-3 border-b bg-muted px-6 py-4">
          <div class="flex rounded-lg bg-background p-3 shadow-xs">
            <svg tIcon name="shield" />
          </div>
          <div>
            <h3 class="text-sm font-semibold">Acesso</h3>
            <p class="text-xs text-muted-foreground">Senha e papel do usuário na organização</p>
          </div>
        </div>
        <div class="grid grid-cols-1 gap-x-6 gap-y-5 p-6 sm:grid-cols-6">
          <t-form-group class="sm:col-span-full">
            <label tLabel for="user-password">Senha</label>
            <input
              tInput
              id="user-password"
              type="password"
              placeholder="Mínimo de 8 caracteres"
              [formField]="userForm.password"
            />
          </t-form-group>
          <t-form-group class="sm:col-span-full">
            <label tLabel for="user-role">Papel</label>
            <select tSelect id="user-role" [formField]="userForm.role">
              <option value="operator">Operador</option>
              <option value="administrator">Administrador</option>
            </select>
          </t-form-group>
        </div>
      </section>
      <footer class="flex items-center justify-end gap-3">
        <button tButton type="button" variant="outline" (click)="closed.emit()">Cancelar</button>
        <button tButton type="submit" [disabled]="userForm().invalid()">Salvar</button>
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
    this.userForm().reset({ name: '', email: '', password: '', role: 'operator' });
  }

  submitForm(event: Event) {
    event.preventDefault();
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
