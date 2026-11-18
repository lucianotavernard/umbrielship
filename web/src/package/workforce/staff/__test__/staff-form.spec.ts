import { Component, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { StaffForm } from '../components/staff-form';
import { StaffRequest } from '../staff.service';
import { alfa, bravo, buttonByText, click, settle, squash, type } from './testing';

@Component({
  imports: [StaffForm],
  template: `<staff-form-ui [teams]="teams" (submitted)="sent.push($event)" />`,
})
class Host {
  teams = [bravo, alfa];
  sent: StaffRequest[] = [];
  form = viewChild.required(StaffForm);
}

describe('StaffForm', () => {
  it('workforce C14 lays the drawer as the standard with sem equipe first', async () => {
    const fixture = TestBed.createComponent(Host);
    await settle();
    const element = fixture.nativeElement as HTMLElement;
    const cards = [...element.querySelectorAll('[data-slot="drawer-card"]')];

    expect(cards.map((card) => squash(card.querySelector('[data-slot="drawer-card-title"]')?.textContent))).toEqual([
      'Dados do profissional',
      'Contato',
    ]);
    expect(cards.map((card) => squash(card.querySelector('[data-slot="drawer-card-subtitle"]')?.textContent))).toEqual([
      'Identifique o profissional e sua equipe',
      'Como falar com o profissional',
    ]);
    expect(cards.map((card) => card.querySelector('[data-slot="drawer-card-icon"]')?.getAttribute('data-icon'))).toEqual([
      'lucideUserRound',
      'lucidePhone',
    ]);
    const labels = [...element.querySelectorAll('label')].map((label) => squash(label.textContent));
    expect(labels).toEqual(['Nome completo *', 'Especialidade *', 'Equipe', 'E-mail *', 'Telefone *']);
    expect([...element.querySelectorAll<HTMLOptionElement>('#staff-team option')].map((option) => option.text)).toEqual([
      'Sem equipe',
      'Equipe Alfa',
      'Equipe Bravo',
    ]);
    const footer = squash(element.querySelector('[data-slot="drawer-footer"]')?.textContent);
    expect(footer).toContain('* Campos obrigatórios');
    expect(buttonByText('Cancelar', element)).toBeDefined();
    expect(buttonByText('Criar profissional', element)?.type).toBe('submit');

    // Nothing is sent while a required field is empty or a limit is passed.
    await click(buttonByText('Criar profissional', element));
    expect(fixture.componentInstance.sent).toEqual([]);
    expect(element.textContent).toContain('Nome é obrigatório');

    await type(element.querySelector('#staff-name'), 'x'.repeat(121));
    await type(element.querySelector('#staff-specialty'), 'Mecânico naval');
    await type(element.querySelector('#staff-email'), 'ana@umbriel.test');
    await type(element.querySelector('#staff-phone'), '1'.repeat(31));
    await click(buttonByText('Criar profissional', element));
    expect(fixture.componentInstance.sent).toEqual([]);

    await type(element.querySelector('#staff-name'), '  Ana Souza ');
    await type(element.querySelector('#staff-phone'), '(13) 1');
    await click(buttonByText('Criar profissional', element));
    expect(fixture.componentInstance.sent).toEqual([
      { name: 'Ana Souza', specialty: 'Mecânico naval', email: 'ana@umbriel.test', phone: '(13) 1', teamId: null },
    ]);

    fixture.componentInstance.form().load({ id: 's', name: 'Ana', specialty: 'x', email: 'a@x.test', phone: '1', teamId: 'alfa' });
    await settle();
    expect(buttonByText('Salvar alterações', element)).toBeDefined();
    expect(element.querySelector<HTMLSelectElement>('#staff-team')!.value).toBe('alfa');
  });
});
