import { Component, input, output, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';

import { provideIcons } from '@ng-icons/core';
import { lucideSend } from '@ng-icons/lucide';

import { DrawerBody, DrawerCard, DrawerFooter, DrawerForm, RequiredMark } from '../../../shared/components/ui/drawer';
import { FormGroup, Label, Select } from '../../../shared/components/ui/form';
import { Role, UserCandidate } from '../../user/user.service';
import { SendInvitationRequest } from '../invitation.service';

export type InvitationFormValue = Omit<SendInvitationRequest, 'organizationId'>;

@Component({
  selector: 'invitation-form-ui',
  imports: [FormField, FormGroup, Label, Select, DrawerForm, DrawerBody, DrawerCard, DrawerFooter, RequiredMark],
  viewProviders: [provideIcons({ lucideSend })],
  host: { class: 'flex min-h-0 flex-1 flex-col' },
  template: `
    <form [tDrawerForm]="shownErrors()" novalidate (submit)="submitForm($event)">
      <t-drawer-body>
        <section tDrawerCard heading="Convite" subheading="Quem será convidado e com qual papel" icon="lucideSend">
          <t-form-group>
            <label tLabel for="invitation-user">Usuário <t-required /></label>
            <select tSelect id="invitation-user" [formField]="invitationForm.userId">
              <option value="">Selecione o usuário</option>
              @for (user of users(); track user.id) {
                <option [value]="user.id">{{ user.email }}</option>
              }
            </select>
          </t-form-group>
          <t-form-group>
            <label tLabel for="invitation-role">Papel</label>
            <select tSelect id="invitation-role" [formField]="invitationForm.role">
              <option value="administrator">Administrador</option>
              <option value="operator">Operador</option>
              <option value="inspector">Inspetor</option>
            </select>
          </t-form-group>
        </section>
      </t-drawer-body>

      <footer tDrawerFooter submitLabel="Enviar convite" [loading]="loading()" (cancelled)="closed.emit()"></footer>
    </form>
  `,
})
export class InvitationForm {
  users = input<UserCandidate[]>([]);
  loading = input(false);
  submitted = output<InvitationFormValue>();
  closed = output<void>();

  /** Errors show once the save button was used (AD-057). */
  protected readonly shownErrors = signal(false);

  model = signal<InvitationFormValue>({ userId: '', role: 'operator' });

  invitationForm = form(this.model, (path) => {
    required(path.userId, { message: 'Usuário é obrigatório' });
    required(path.role, { message: 'Papel é obrigatório' });
  });

  reset() {
    this.shownErrors.set(false);
    this.invitationForm().reset({ userId: '', role: 'operator' });
  }

  submitForm(event: Event) {
    event.preventDefault();
    this.shownErrors.set(true);
    if (this.invitationForm().invalid()) return;
    const value = this.invitationForm().value();
    this.submitted.emit({ userId: value.userId, role: value.role as Role });
  }
}
