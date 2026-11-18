import { Component, computed, input, model } from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';

import { Select } from '../../../shared/components/ui/form';
import { AssigneeKey, AssigneeOption } from '../assignee';

export type AssigneeOptions = { staff: AssigneeOption[]; teams: AssigneeOption[] };

/**
 * "Responsável": "Sem responsável", then the groups "Profissionais" and "Equipes" (AD-083). With
 * `only` set - a service that takes no new Responsável - it offers that value and "Sem responsável".
 */
@Component({
  selector: 'assignee-select-ui',
  imports: [Select],
  template: `
    <select tSelect [id]="selectId()" [value]="value()" (change)="value.set($any($event.target).value)">
      <option value="" [selected]="value() === ''">Sem responsável</option>
      @if (staff().length) {
        <optgroup label="Profissionais">
          @for (option of staff(); track option.key) {
            <option [value]="option.key" [selected]="option.key === value()">{{ option.label }}</option>
          }
        </optgroup>
      }
      @if (teams().length) {
        <optgroup label="Equipes">
          @for (option of teams(); track option.key) {
            <option [value]="option.key" [selected]="option.key === value()">{{ option.label }}</option>
          }
        </optgroup>
      }
    </select>
  `,
  host: { class: 'contents' },
})
export class AssigneeSelect implements FormValueControl<AssigneeKey> {
  readonly value = model<AssigneeKey>('');
  readonly options = input<AssigneeOptions>({ staff: [], teams: [] });
  /** The one key still offered beside "Sem responsável"; null offers every option. */
  readonly only = input<AssigneeKey | null>(null);
  readonly selectId = input('');

  protected readonly staff = computed(() => this.limit(this.options().staff));
  protected readonly teams = computed(() => this.limit(this.options().teams));

  private limit(options: AssigneeOption[]) {
    const only = this.only();
    return only === null ? options : options.filter((option) => option.key === only);
  }
}
