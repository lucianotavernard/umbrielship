import { Component, computed, input, output, signal } from '@angular/core';
import { email, form, FormField, maxLength, required } from '@angular/forms/signals';

import { provideIcons } from '@ng-icons/core';
import { lucidePhone, lucideUserRound } from '@ng-icons/lucide';

import { DrawerBody, DrawerCard, DrawerFooter, DrawerForm, RequiredMark } from '../../../shared/components/ui/drawer';
import { FormGroup, Input, Label, Select } from '../../../shared/components/ui/form';
import { NO_TEAM } from '../staff-filters';
import { Staff, StaffRequest, Team } from '../staff.service';

const EMPTY = { name: '', specialty: '', teamId: '', email: '', phone: '' };

/** The mareos "Novo profissional" drawer in the standard frame (AD-053, AD-082). */
@Component({
  selector: 'staff-form-ui',
  imports: [FormField, FormGroup, Label, Input, Select, DrawerForm, DrawerBody, DrawerCard, DrawerFooter, RequiredMark],
  viewProviders: [provideIcons({ lucidePhone, lucideUserRound })],
  template: `
    <form [tDrawerForm]="shownErrors()" novalidate (submit)="submitForm($event)">
      <t-drawer-body>
        <section
          tDrawerCard
          heading="Dados do profissional"
          subheading="Identifique o profissional e sua equipe"
          icon="lucideUserRound"
        >
          <t-form-group>
            <label tLabel for="staff-name">Nome completo <t-required /></label>
            <input tInput id="staff-name" type="text" placeholder="Ex.: Ana Souza" [formField]="staffForm.name" />
          </t-form-group>
          <t-form-group>
            <label tLabel for="staff-specialty">Especialidade <t-required /></label>
            <input
              tInput
              id="staff-specialty"
              type="text"
              placeholder="Ex.: Mecânica naval"
              [formField]="staffForm.specialty"
            />
          </t-form-group>
          <t-form-group>
            <label tLabel for="staff-team">Equipe</label>
            <select tSelect id="staff-team" [formField]="staffForm.teamId">
              <option value="">{{ noTeam }}</option>
              @for (team of sortedTeams(); track team.id) {
                <option [value]="team.id">{{ team.name }}</option>
              }
            </select>
          </t-form-group>
        </section>

        <section tDrawerCard heading="Contato" subheading="Como falar com o profissional" icon="lucidePhone" [columns]="2">
          <t-form-group>
            <label tLabel for="staff-email">E-mail <t-required /></label>
            <input
              tInput
              id="staff-email"
              type="email"
              placeholder="nome@empresa.com.br"
              [formField]="staffForm.email"
            />
          </t-form-group>
          <t-form-group>
            <label tLabel for="staff-phone">Telefone <t-required /></label>
            <input tInput id="staff-phone" type="tel" placeholder="(00) 00000-0000" [formField]="staffForm.phone" />
          </t-form-group>
        </section>
      </t-drawer-body>

      <footer tDrawerFooter [submitLabel]="submitLabel()" [loading]="loading()" (cancelled)="closed.emit()"></footer>
    </form>
  `,
  host: { class: 'flex min-h-0 flex-1 flex-col' },
})
export class StaffForm {
  loading = input(false);
  teams = input<Team[]>([]);

  submitted = output<StaffRequest>();
  closed = output<void>();

  protected readonly noTeam = NO_TEAM;
  /** True while a Staff is edited: the save button says so (AD-054). */
  protected readonly editing = signal(false);
  protected readonly submitLabel = computed(() => (this.editing() ? 'Salvar alterações' : 'Criar profissional'));
  protected readonly sortedTeams = computed(() =>
    [...this.teams()].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
  );

  /** Errors show once the save button was used (AD-057). */
  protected readonly shownErrors = signal(false);

  model = signal({ ...EMPTY });

  staffForm = form(this.model, (path) => {
    required(path.name, { message: 'Nome é obrigatório' });
    maxLength(path.name, 120, { message: 'Use até 120 caracteres' });
    required(path.specialty, { message: 'Especialidade é obrigatória' });
    maxLength(path.specialty, 100, { message: 'Use até 100 caracteres' });
    required(path.email, { message: 'E-mail é obrigatório' });
    email(path.email, { message: 'E-mail inválido' });
    maxLength(path.email, 254, { message: 'Use até 254 caracteres' });
    required(path.phone, { message: 'Telefone é obrigatório' });
    maxLength(path.phone, 30, { message: 'Use até 30 caracteres' });
  });

  /** Empties the drawer for a new professional. */
  reset() {
    this.editing.set(false);
    this.shownErrors.set(false);
    this.staffForm().reset({ ...EMPTY });
  }

  /** Puts the professional's stored values in the fields, whatever was typed before. */
  load(staff: Staff) {
    this.editing.set(true);
    this.shownErrors.set(false);
    this.staffForm().reset({
      name: staff.name,
      specialty: staff.specialty,
      teamId: staff.teamId ?? '',
      email: staff.email,
      phone: staff.phone,
    });
  }

  submitForm(event: Event) {
    event.preventDefault();
    this.shownErrors.set(true);
    if (this.staffForm().invalid()) return;

    const value = this.staffForm().value();
    this.submitted.emit({
      name: value.name.trim(),
      specialty: value.specialty.trim(),
      email: value.email.trim(),
      phone: value.phone.trim(),
      teamId: value.teamId || null,
    });
  }
}
