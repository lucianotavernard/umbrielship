import { Component, output, signal } from '@angular/core';
import { email, form, FormField, required } from '@angular/forms/signals';

import { Button } from '../../../shared/components/ui/button';
import { FormGroup, Input, Label } from '../../../shared/components/ui/form';
import { Icon } from '../../../shared/components/ui/icon';

@Component({
  selector: 'authentication-form-ui',
  imports: [FormField, FormGroup, Label, Input, Button, Icon],
  template: `
    <form class="flex flex-col gap-6" (submit)="submitForm($event)">
      <header class="flex flex-col items-center gap-1 text-center">
        <h1 class="text-2xl font-bold">Entrar</h1>
        <p class="text-sm text-muted-foreground">Acesse sua conta para continuar</p>
      </header>

      <t-form-group>
        <label tLabel for="email">E-mail</label>
        <input tInput id="email" type="email" placeholder="voce@exemplo.com" [formField]="authenticationForm.email" />
      </t-form-group>

      <t-form-group>
        <label tLabel for="password">Senha</label>
        <input tInput id="password" type="password" placeholder="••••••••" [formField]="authenticationForm.password" />
      </t-form-group>

      @if (error()) {
        <p class="text-sm text-destructive">{{ error() }}</p>
      }

      <button tButton type="submit" [disabled]="loading()">
        @if (loading()) {
          <svg tIcon name="loader-circle" class="animate-spin" />
        }
        Entrar
      </button>
    </form>
  `,
})
export class AuthenticationForm {
  loading = signal(false);
  error = signal('');

  submitted = output<{ email: string; password: string }>();

  model = signal({ email: '', password: '' });

  authenticationForm = form(this.model, (path) => {
    required(path.email, { message: 'E-mail é obrigatório' });
    email(path.email, { message: 'E-mail inválido' });
    required(path.password, { message: 'Senha é obrigatória' });
  });

  submitForm(event: Event) {
    event.preventDefault();
    this.submitted.emit(this.authenticationForm().value());
  }
}
