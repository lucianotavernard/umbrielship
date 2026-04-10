import { Component, inject, signal } from '@angular/core';
import { email, form, FormField, required } from '@angular/forms/signals';

import { FormGroup } from '@/shared/ui/form/form-group';
import { Label } from '@/shared/ui/form/label';
import { Input } from '@/shared/ui/form/input';
import { Button } from '@/shared/ui/button';
import { toast } from '@/shared/ui/toaster';

import { AuthService } from '@/identity/data-access/service/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'authentication',
  templateUrl: './authentication.html',
  imports: [FormField, FormGroup, Label, Input, Button],
})
export class Authentication {
  protected readonly router = inject(Router);
  protected readonly authService = inject(AuthService);

  loading = signal(false);

  authSignal = signal({
    email: '',
    password: '',
  });

  authenticationForm = form(this.authSignal, (schemaPath) => {
    email(schemaPath.email);
    required(schemaPath.email);
    required(schemaPath.password);
  });

  handleSubmit(event: Event) {
    event.preventDefault();

    this.loading.set(true);

    const credentials = this.authSignal();
    console.log(credentials);

    this.loading.set(false);

    this.authService.authenticate(credentials).subscribe({
      next: () => {
        toast.success('Usuário autenticado com sucesso', {
          description: 'Você será redirecionado para a dashboard em breve.',
        });

        setTimeout(() => {
          this.router.navigateByUrl('dashboard');
        }, 300);
      },
      error: () => {
        toast.error('Credenciais inválidas', {
          description: 'Por favor, verifique suas credenciais e tente novamente.',
        });

        this.loading.set(false);
      },
    });
  }
}
