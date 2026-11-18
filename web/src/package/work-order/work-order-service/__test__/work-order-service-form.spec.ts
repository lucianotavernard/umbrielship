import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { AssigneeOptions } from '../../../workforce/staff/components/assignee-select';
import { WorkOrderServiceForm } from '../components/work-order-service-form';
import { CreateWorkOrderServiceRequest } from '../work-order-service.service';

const options: AssigneeOptions = {
  staff: [{ key: 'staff:rafael', label: 'Rafael Mendes · Mecânico naval' }],
  teams: [{ key: 'team:alfa', label: 'Equipe Alfa · Motor' }],
};

@Component({
  imports: [WorkOrderServiceForm],
  template: `<work-order-service-form-ui [assignees]="assignees()" (submitted)="sent.push($event)" />`,
})
class Host {
  assignees = signal<AssigneeOptions | null>(options);
  sent: CreateWorkOrderServiceRequest[] = [];
}

async function settle() {
  await new Promise((resolve) => setTimeout(resolve));
  TestBed.tick();
}

async function type(element: HTMLElement, selector: string, value: string) {
  const field = element.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(selector)!;
  field.value = value;
  field.dispatchEvent(new Event('input', { bubbles: true }));
  field.dispatchEvent(new Event('change', { bubbles: true }));
  await settle();
}

async function fill(element: HTMLElement) {
  await type(element, '#svc-name', 'Pintura');
  await type(element, '#svc-description', 'Casco');
  await type(element, '#svc-start', '2026-11-21T08:00');
  await type(element, '#svc-end', '2026-11-21T17:00');
}

const submit = async (element: HTMLElement) => {
  element.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
  await settle();
};

describe('WorkOrderServiceForm', () => {
  it('workforce C27 sends the responsável chosen by an administrator', async () => {
    const fixture = TestBed.createComponent(Host);
    await settle();
    const element = fixture.nativeElement as HTMLElement;

    // "Responsável" sits in the "Serviço" card.
    const card = element.querySelector('#svc-assignee')!.closest('[data-slot="drawer-card"]')!;
    expect(card.querySelector('[data-slot="drawer-card-title"]')?.textContent?.trim()).toBe('Serviço');
    expect(element.querySelector('label[for="svc-assignee"]')?.textContent?.trim()).toBe('Responsável');
    expect([...element.querySelectorAll('#svc-assignee option')].map((option) => option.textContent?.trim())).toEqual([
      'Sem responsável',
      'Rafael Mendes · Mecânico naval',
      'Equipe Alfa · Motor',
    ]);

    await fill(element);
    await type(element, '#svc-assignee', 'team:alfa');
    await submit(element);
    expect(fixture.componentInstance.sent.at(-1)).toMatchObject({ name: 'Pintura', teamId: 'alfa' });
    expect(fixture.componentInstance.sent.at(-1)).not.toHaveProperty('staffId');

    await type(element, '#svc-assignee', '');
    await submit(element);
    expect(fixture.componentInstance.sent.at(-1)).not.toHaveProperty('teamId');

    // No choices (an operator): no field, nothing sent.
    fixture.componentInstance.assignees.set(null);
    await settle();
    expect(element.querySelector('#svc-assignee')).toBeNull();
    await submit(element);
    expect(Object.keys(fixture.componentInstance.sent.at(-1)!)).toEqual([
      'name',
      'description',
      'startDate',
      'endDate',
      'status',
    ]);
  });
});
