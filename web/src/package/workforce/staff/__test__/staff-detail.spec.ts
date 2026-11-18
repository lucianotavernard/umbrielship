import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { StaffDetail } from '../staff-detail/staff-detail';
import { Staff } from '../staff.service';
import { assignments, camila, click, pedro, rafael, settle, squash, teams, workOrders } from './testing';

@Component({ template: '' })
class Page {}

const vessels = [{ id: 'v-aur', name: 'Aurora', imoNumber: '1', type: 'CARGO', length: 30, customerId: 'c1' }];

describe('StaffDetail', () => {
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'work-orders/:id', component: Page }]),
      ],
    });
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  async function render(person: Staff | null, id = person?.id ?? 'missing') {
    const fixture = TestBed.createComponent(StaffDetail);
    fixture.componentRef.setInput('id', id);
    await settle();
    const staffRequest = controller.expectOne(`/api/staff/${id}`);
    if (person) staffRequest.flush({ staff: person });
    else staffRequest.flush({ message: 'Staff not found' }, { status: 404, statusText: 'Not Found' });
    controller.expectOne('/api/teams').flush({ teams });
    controller.expectOne('/api/assignments').flush({ assignments });
    controller.expectOne('/api/work-orders').flush({ workOrders, total: workOrders.length });
    controller.expectOne('/api/vessels').flush({ vessels, total: vessels.length });
    await settle();
    return fixture.nativeElement as HTMLElement;
  }

  const text = (element: HTMLElement, slot: string) => squash(element.querySelector(`[data-slot="${slot}"]`)?.textContent);

  it('workforce C31 shows the profile with its team, status and contact links', async () => {
    const element = await render(pedro);

    expect(squash(element.querySelector('h1')?.textContent)).toBe('Pedro Nascimento');
    expect(element.textContent).toContain('PERFIL PROFISSIONAL');
    expect(text(element, 'profile-specialty')).toBe('Mecânico naval');
    expect(text(element, 'profile-team')).toBe('Sem equipe');
    expect(text(element, 'profile-situation')).toBe('Disponível');
    expect(text(element, 'profile-status')).toBe('Disponível');
    // The block of "Alocação na oficina" carries the professional's status, as the mareos draws it.
    expect(text(element, 'allocation-status')).toBe('Disponível');
    expect(element.querySelector('[data-slot="profile-email"]')?.getAttribute('href')).toBe(
      'mailto:pedro.nascimento@umbriel.test',
    );
    expect(element.querySelector('[data-slot="profile-phone"]')?.getAttribute('href')).toBe('tel:+5513997712083');
    expect(element.textContent).toContain('Contato profissional');
    expect(element.textContent).toContain('Alocação na oficina');

    const links = [...element.querySelectorAll('a')].map((link) => [squash(link.textContent), link.getAttribute('href')]);
    expect(links).toContainEqual(['Equipe técnica', '/staff']);
    expect(links).toContainEqual(['Voltar à lista da equipe', '/staff']);
  });

  it('workforce C31 shows the team and em serviço through the team', async () => {
    const element = await render(camila);

    expect(text(element, 'profile-team')).toBe('Equipe Alfa');
    expect(text(element, 'profile-situation')).toBe('Em serviço');
    expect(text(element, 'allocation-status')).toBe('Em serviço');
  });

  it('workforce C32 lists the allocations and opens their work order', async () => {
    const element = await render(rafael);
    const router = TestBed.inject(Router);

    // "Motor" goes to Equipe Alfa, Rafael's team; "Pintura" to João.
    const allocations = [...element.querySelectorAll<HTMLAnchorElement>('[data-slot="allocation"]')];
    expect(allocations.map((allocation) => squash(allocation.textContent))).toEqual([
      'Motor #AB12CD34 · Aurora · 17/11/2026 09:00 – 18/11/2026 17:00',
    ]);
    await click(allocations[0]);
    expect(router.url).toBe(`/work-orders/${workOrders[0].id}`);
  });

  it('workforce C32 says when there is no open allocation', async () => {
    const element = await render(pedro);

    expect(text(element, 'no-allocation')).toBe('Nenhuma alocação em serviços abertos.');
    expect(element.querySelector('[data-slot="allocation"]')).toBeNull();
  });

  it('workforce C33 shows profissional não encontrado on a 404', async () => {
    const element = await render(null, '00000000-0000-4000-8000-000000000000');

    expect(squash(element.querySelector('h1')?.textContent)).toBe('Profissional não encontrado');
    expect(element.textContent).toContain('Este cadastro não está disponível na equipe técnica.');
    const back = [...element.querySelectorAll('a')].find((link) => squash(link.textContent) === 'Voltar para a equipe');
    expect(back?.getAttribute('href')).toBe('/staff');
  });
});
