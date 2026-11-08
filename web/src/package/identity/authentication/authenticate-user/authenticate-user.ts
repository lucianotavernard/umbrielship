import { Component, inject, viewChild } from '@angular/core';
import { Router } from '@angular/router';

import { apiErrorMessage } from '../../../shared/components/lib/api-error-message';
import { toast } from '../../../shared/components/ui/toaster';
import { AuthenticationForm } from '../components/authentication-form';
import { AuthenticationService } from '../authentication.service';

@Component({
  selector: 'authenticate-user',
  imports: [AuthenticationForm],
  templateUrl: './authenticate-user.html',
})
export class AuthenticateUser {
  private readonly router = inject(Router);
  private readonly authenticationService = inject(AuthenticationService);
  private readonly form = viewChild.required(AuthenticationForm);

  signIn(credentials: { email: string; password: string }) {
    this.form().loading.set(true);
    this.form().error.set('');

    this.authenticationService.authenticate(credentials).subscribe({
      next: () => {
        toast.success('Usuário autenticado com sucesso', {
          description: 'Você será redirecionado para a dashboard em breve.',
        });
        void this.router.navigateByUrl('/dashboard');
      },
      error: (response) => {
        const message = apiErrorMessage(response, 'E-mail ou senha incorretos.');
        this.form().error.set(message);
        this.form().loading.set(false);
        toast.error('Credenciais inválidas', { description: message });
      },
    });
  }
}
