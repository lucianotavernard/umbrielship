import { Component, input, output, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';

import { Button } from '../../../shared/components/ui/button';
import { FormGroup, Label, Select } from '../../../shared/components/ui/form';
import { Role, UserCandidate } from '../../user/user.service';
import { SendInvitationRequest } from '../invitation.service';

export type InvitationFormValue = Omit<SendInvitationRequest, 'organizationId'>;

@Component({
  selector: 'invitation-form-ui',
  imports: [FormField, FormGroup, Label, Select, Button],
  template: `
    <form class="flex flex-col gap-6" (submit)="submitForm($event)">
      <t-form-group>
        <label tLabel for="invitation-user">Usuário</label>
        <select tSelect id="invitation-user" [formField]="invitationForm.userId">
          <option value="">Selecione</option>
          @for (user of users(); track user.id) {
            <option [value]="user.id">{{ user.email }}</option>
          }
        </select>
      </t-form-group>
      <t-form-group>
        <label tLabel for="invitation-role">Papel</label>
        <select tSelect id="invitation-role" [formField]="invitationForm.role">
          <option value="operator">Operador</option>
          <option value="administrator">Administrador</option>
        </select>
      </t-form-group>
      <footer class="flex justify-end gap-3">
        <button tButton type="button" variant="outline" (click)="closed.emit()">Cancelar</button>
        <button tButton type="submit">Enviar</button>
      </footer>
    </form>
  `,
})
export class InvitationForm {
  users = input<UserCandidate[]>([]);
  submitted = output<InvitationFormValue>();
  closed = output<void>();

  model = signal<InvitationFormValue>({ userId: '', role: 'operator' });

  invitationForm = form(this.model, (path) => {
    required(path.userId);
    required(path.role);
  });

  reset() {
    this.invitationForm().reset({ userId: '', role: 'operator' });
  }

  submitForm(event: Event) {
    event.preventDefault();
    const value = this.invitationForm().value();
    this.submitted.emit({ userId: value.userId, role: value.role as Role });
  }
}
