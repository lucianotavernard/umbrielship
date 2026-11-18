import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { AssigneeOptions } from '../../../workforce/staff/components/assignee-select';
import { AppointmentForm, AppointmentRequest } from '../components/appointment-form';

const options: AssigneeOptions = {
  staff: [{ key: 'staff:rafael', label: 'Rafael Mendes · Mecânico naval' }],
  teams: [{ key: 'team:alfa', label: 'Equipe Alfa · Motor' }],
};

@Component({
  imports: [AppointmentForm],
  template: `<appointment-form-ui [workOrders]="orders" [assignees]="assignees()" (submitted)="sent.push($event)" />`,
})
class Host {
  orders = [{ id: 'ab12cd34-5e6f-4a7b-8c9d-0e1f2a3b4c5d', vesselName: 'Aurora' }];
  assignees = signal<AssigneeOptions | null>(options);
  sent: AppointmentRequest[] = [];
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

describe('AppointmentForm', () => {
  it('workforce C27 sends the responsável chosen by an administrator', async () => {
    const fixture = TestBed.createComponent(Host);
    await settle();
    const element = fixture.nativeElement as HTMLElement;

    const card = element.querySelector('#appointment-assignee')!.closest('[data-slot="drawer-card"]')!;
    expect(card.querySelector('[data-slot="drawer-card-title"]')?.textContent?.trim()).toBe('Serviço');
    expect(element.querySelector('label[for="appointment-assignee"]')?.textContent?.trim()).toBe('Responsável');

    await type(element, '#appointment-work-order', 'ab12cd34-5e6f-4a7b-8c9d-0e1f2a3b4c5d');
    await type(element, '#appointment-name', 'Revisão do motor');
    await type(element, '#appointment-description', 'Troca de filtros');
    await type(element, '#appointment-start', '2026-11-21T08:00');
    await type(element, '#appointment-end', '2026-11-21T10:00');
    await type(element, '#appointment-assignee', 'staff:rafael');
    element.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    await settle();

    expect(fixture.componentInstance.sent).toEqual([
      expect.objectContaining({ workOrderId: 'ab12cd34-5e6f-4a7b-8c9d-0e1f2a3b4c5d', name: 'Revisão do motor', staffId: 'rafael' }),
    ]);
    expect(fixture.componentInstance.sent[0]).not.toHaveProperty('teamId');

    fixture.componentInstance.assignees.set(null);
    await settle();
    expect(element.querySelector('#appointment-assignee')).toBeNull();
  });
});
