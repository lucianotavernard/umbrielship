import { Component, computed, input, output, signal } from '@angular/core';
import { form, FormField, maxLength, required } from '@angular/forms/signals';

import { provideIcons } from '@ng-icons/core';
import { lucideUsers } from '@ng-icons/lucide';

import { DrawerBody, DrawerCard, DrawerFooter, DrawerForm, RequiredMark } from '../../../shared/components/ui/drawer';
import { FormGroup, Input, Label } from '../../../shared/components/ui/form';
import { Team, TeamRequest } from '../staff.service';

const EMPTY = { name: '', specialty: '' };

/** The "Nova equipe" / "Editar equipe" drawer in the standard frame (AD-074, AD-082). */
@Component({
  selector: 'team-form-ui',
  imports: [FormField, FormGroup, Label, Input, DrawerForm, DrawerBody, DrawerCard, DrawerFooter, RequiredMark],
  viewProviders: [provideIcons({ lucideUsers })],
  template: `
    <form [tDrawerForm]="shownErrors()" novalidate (submit)="submitForm($event)">
      <t-drawer-body>
        <section
          tDrawerCard
          heading="Dados da equipe"
          subheading="Identifique a equipe e sua especialidade"
          icon="lucideUsers"
        >
          <t-form-group>
            <label tLabel for="team-name">Nome <t-required /></label>
            <input tInput id="team-name" type="text" placeholder="Ex.: Equipe Alfa" [formField]="teamForm.name" />
          </t-form-group>
          <t-form-group>
            <label tLabel for="team-specialty">Especialidade <t-required /></label>
            <input
              tInput
              id="team-specialty"
              type="text"
              placeholder="Ex.: Motor"
              [formField]="teamForm.specialty"
            />
          </t-form-group>
        </section>
      </t-drawer-body>

      <footer tDrawerFooter [submitLabel]="submitLabel()" [loading]="loading()" (cancelled)="closed.emit()"></footer>
    </form>
  `,
  host: { class: 'flex min-h-0 flex-1 flex-col' },
})
export class TeamForm {
  loading = input(false);

  submitted = output<TeamRequest>();
  closed = output<void>();

  protected readonly editing = signal(false);
  protected readonly submitLabel = computed(() => (this.editing() ? 'Salvar alterações' : 'Criar equipe'));
  protected readonly shownErrors = signal(false);

  model = signal({ ...EMPTY });

  teamForm = form(this.model, (path) => {
    required(path.name, { message: 'Nome é obrigatório' });
    maxLength(path.name, 120, { message: 'Use até 120 caracteres' });
    required(path.specialty, { message: 'Especialidade é obrigatória' });
    maxLength(path.specialty, 100, { message: 'Use até 100 caracteres' });
  });

  reset() {
    this.editing.set(false);
    this.shownErrors.set(false);
    this.teamForm().reset({ ...EMPTY });
  }

  load(team: Team) {
    this.editing.set(true);
    this.shownErrors.set(false);
    this.teamForm().reset({ name: team.name, specialty: team.specialty });
  }

  submitForm(event: Event) {
    event.preventDefault();
    this.shownErrors.set(true);
    if (this.teamForm().invalid()) return;

    const value = this.teamForm().value();
    this.submitted.emit({ name: value.name.trim(), specialty: value.specialty.trim() });
  }
}
