import { Component, input, output, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';

import { Button } from '../../../shared/components/ui/button';
import { FormGroup, Label, Select } from '../../../shared/components/ui/form';
import { Icon } from '../../../shared/components/ui/icon';
import { Role, UserCandidate } from '../../user/user.service';
import { SendInvitationRequest } from '../invitation.service';

export type InvitationFormValue = Omit<SendInvitationRequest, 'organizationId'>;

@Component({
  selector: 'invitation-form-ui',
  imports: [FormField, FormGroup, Label, Select, Button, Icon],
  template: `
    <form class="flex flex-col gap-6" (submit)="submitForm($event)">
      <section class="rounded-2xl shadow-xs border overflow-hidden">
        <div class="flex items-center gap-3 border-b bg-muted px-6 py-4">
          <div class="flex rounded-lg bg-background p-3 shadow-xs">
            <svg tIcon name="send" />
          </div>
          <div>
            <h3 class="text-sm font-semibold">Convite</h3>
            <p class="text-xs text-muted-foreground">Quem será convidado e com qual papel</p>
          </div>
        </div>
        <div class="grid grid-cols-1 gap-x-6 gap-y-5 p-6 sm:grid-cols-6">
          <t-form-group class="sm:col-span-full">
            <label tLabel for="invitation-user">Usuário</label>
            <select tSelect id="invitation-user" [formField]="invitationForm.userId">
              <option value="">Selecione o usuário</option>
              @for (user of users(); track user.id) {
                <option [value]="user.id">{{ user.email }}</option>
              }
            </select>
          </t-form-group>
          <t-form-group class="sm:col-span-full">
            <label tLabel for="invitation-role">Papel</label>
            <select tSelect id="invitation-role" [formField]="invitationForm.role">
              <option value="operator">Operador</option>
              <option value="administrator">Administrador</option>
            </select>
          </t-form-group>
        </div>
      </section>
      <footer class="flex items-center justify-end gap-3">
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
    required(path.userId, { message: 'Usuário é obrigatório' });
    required(path.role, { message: 'Papel é obrigatório' });
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
