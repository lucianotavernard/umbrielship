import { Component, output, signal } from '@angular/core';
import { email, form, FormField, required } from '@angular/forms/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowRight, lucideEye, lucideEyeOff, lucideLoaderCircle, lucideMail } from '@ng-icons/lucide';

import { Button } from '../../../shared/components/ui/button';
import { FormGroup, Input, Label } from '../../../shared/components/ui/form';

@Component({
  selector: 'authentication-form-ui',
  imports: [FormField, FormGroup, Label, Input, Button, NgIcon],
  viewProviders: [
    provideIcons({ lucideArrowRight, lucideEye, lucideEyeOff, lucideLoaderCircle, lucideMail }),
  ],
  // Each label sits beside its field's wrapper, not the input, so it turns red through its group.
  template: `
    <form class="flex flex-col gap-[18px]" (submit)="submitForm($event)">
      <t-form-group class="gap-2 [&>t-input-error]:text-[11px]">
        <label tLabel for="email" class="text-[12px] font-semibold group-has-[input.ng-invalid.ng-touched]/field:text-destructive">E-mail</label>
        <div class="relative">
          <!-- ng-icon takes its colour from its parent, as its own host style outranks a utility. -->
          <span
            class="pointer-events-none absolute top-1/2 left-3 flex -translate-y-1/2 text-muted-foreground group-has-[input.ng-invalid.ng-touched]/field:text-destructive"
          >
            <ng-icon name="lucideMail" class="!size-4" />
          </span>
          <input
            tInput
            id="email"
            type="email"
            autocomplete="username"
            placeholder="nome@empresa.com.br"
            class="h-[46px] rounded-[7px] border-border bg-card shadow-none placeholder:text-muted-foreground/75 md:text-[12px] dark:bg-card focus-visible:ring-ring/15 pl-[38px]"
            [formField]="authenticationForm.email"
          />
        </div>
      </t-form-group>

      <t-form-group class="gap-2 [&>t-input-error]:text-[11px]">
        <label tLabel for="password" class="text-[12px] font-semibold group-has-[input.ng-invalid.ng-touched]/field:text-destructive">Senha</label>
        <div class="relative">
          <input
            tInput
            id="password"
            autocomplete="current-password"
            placeholder="Digite sua senha"
            [type]="passwordVisible() ? 'text' : 'password'"
            class="h-[46px] rounded-[7px] border-border bg-card shadow-none placeholder:text-muted-foreground/75 md:text-[12px] dark:bg-card focus-visible:ring-ring/15 pr-[50px]"
            [formField]="authenticationForm.password"
          />
          <button
            tButton
            type="button"
            variant="ghost"
            size="icon-xs"
            class="absolute top-1/2 right-3 size-7 -translate-y-1/2 rounded-[5px] text-muted-foreground hover:bg-muted hover:text-foreground dark:hover:bg-muted"
            [attr.aria-label]="passwordVisible() ? 'Ocultar senha' : 'Mostrar senha'"
            [attr.title]="passwordVisible() ? 'Ocultar senha' : 'Mostrar senha'"
            [attr.aria-pressed]="passwordVisible()"
            (click)="passwordVisible.set(!passwordVisible())"
          >
            <ng-icon [name]="passwordVisible() ? 'lucideEyeOff' : 'lucideEye'" class="!size-4" />
          </button>
        </div>
      </t-form-group>

      <button
        tButton
        type="submit"
        class="mt-px h-[46px] gap-[9px] rounded-[7px] text-[12px] font-bold hover:bg-primary hover:brightness-[1.08] active:translate-y-px"
        [disabled]="loading()"
      >
        @if (loading()) {
          <ng-icon name="lucideLoaderCircle" class="!size-[15px] animate-spin" />
        }
        Entrar
        @if (!loading()) {
          <ng-icon name="lucideArrowRight" class="!size-[15px]" />
        }
      </button>

      <p class="-mt-2 min-h-[15px] text-[11px] leading-[1.5] font-medium text-destructive" role="status" aria-live="polite">
        {{ error() }}
      </p>
    </form>
  `,
})
export class AuthenticationForm {
  loading = signal(false);
  error = signal('');
  passwordVisible = signal(false);

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
