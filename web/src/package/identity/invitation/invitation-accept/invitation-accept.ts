import { Component, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { apiErrorMessage } from '../../../shared/components/lib/api-error-message';
import { Button } from '../../../shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../shared/components/ui/card';
import { Confirmation } from '../../../shared/components/ui/confirmation';
import { toast } from '../../../shared/components/ui/toaster';
import { InvitationService } from '../invitation.service';

@Component({
  selector: 'invitation-accept',
  imports: [RouterLink, Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Confirmation],
  templateUrl: './invitation-accept.html',
})
export class InvitationAccept {
  private readonly invitationService = inject(InvitationService);

  secret = input<string>();

  submitting = signal(false);
  isDialogActive = signal(false);
  organizationName = signal<string | null>(null);
  errorMessage = signal('');

  openDialog() {
    this.isDialogActive.set(true);
  }

  closeDialog() {
    this.isDialogActive.set(false);
  }

  acceptInvitation() {
    const secret = this.secret();
    if (!secret) return;
    this.closeDialog();
    this.submitting.set(true);
    this.errorMessage.set('');

    this.invitationService.acceptInvitation(secret).subscribe({
      next: ({ organizationName }) => {
        this.organizationName.set(organizationName);
        this.submitting.set(false);
        toast.success('Convite aceito com sucesso', {
          description: `Você agora faz parte de ${organizationName}.`,
        });
      },
      error: (response) => {
        const message = apiErrorMessage(response, 'Ocorreu um erro ao aceitar o convite.');
        this.errorMessage.set(message);
        this.submitting.set(false);
        toast.error('Erro ao aceitar convite', { description: message });
      },
    });
  }
}
