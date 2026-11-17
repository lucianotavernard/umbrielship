import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthenticationService } from '../../../identity/authentication/authentication.service';
import type { Role } from '../../../identity/user/user.service';
import { WorkOrderDetail } from '../work-order-detail/work-order-detail';
import { local, settle, squash } from './work-order-list.harness';

const ID = 'ab12cd34-5e6f-4a7b-8c9d-0e1f2a3b4c5d';
const BASE = `/api/work-orders/${ID}`;

const workOrder = {
  id: ID,
  startDate: local(2026, 11, 17, 9, 12),
  endDate: local(2026, 11, 20, 10, 0),
  status: 'IN_PROGRESS',
  vessel: { vesselId: 'v-aur', name: 'Aurora', type: 'CARGO', length: 32.5 },
};

const service = {
  id: 'svc-1',
  workOrderId: ID,
  name: 'Motor',
  description: 'Revisão geral do motor',
  startDate: local(2026, 11, 17, 9, 0),
  endDate: local(2026, 11, 18, 17, 0),
  status: 'IN_PROGRESS',
};

/** An assignment with no Inspection yet: an administrator may remove it. */
const assignment = {
  id: 'as-1',
  templateName: 'Casco e convés',
  service: null,
  createdAt: local(2026, 11, 17, 10, 0),
  items: [{ id: 'it-1', label: 'Casco sem trincas?', type: 'YES_NO', position: 0 }],
  removable: true,
  inspections: [],
};

describe('WorkOrderDetail as inspector', () => {
  function configure() {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
  }

  beforeEach(() => configure());

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  async function render(role: Role) {
    const controller = TestBed.inject(HttpTestingController);
    TestBed.inject(AuthenticationService).role.set(role);
    const fixture = TestBed.createComponent(WorkOrderDetail);
    fixture.componentRef.setInput('id', ID);
    await settle();
    controller.expectOne(BASE).flush({ workOrder });
    controller.expectOne(`${BASE}/services`).flush({ services: [service], total: 1 });
    controller.expectOne(`${BASE}/inspection-assignments`).flush({ inspectionAssignments: [assignment] });
    await settle();
    return fixture.nativeElement as HTMLElement;
  }

  /** "Editar", "Novo serviço", "Enviar foto de <name>", "Atribuir modelo" and remove, as the page shows them. */
  function writeControls(element: HTMLElement): string[] {
    const found: string[] = [];
    for (const button of element.querySelectorAll('button')) {
      const text = squash(button.textContent) ?? '';
      if (['Editar', 'Novo serviço', 'Atribuir modelo'].includes(text)) found.push(text);
      const aria = button.getAttribute('aria-label') ?? '';
      if (aria === 'Remover' || aria.startsWith('Remover ')) found.push(aria);
    }
    for (const input of element.querySelectorAll('input[type="file"]')) {
      found.push(input.getAttribute('aria-label') ?? 'file');
    }
    return found.sort();
  }

  it('work-order-ui C32 hides every write control', async () => {
    // An administrator sees every one of them on the same WorkOrder.
    const administrator = await render('administrator');
    expect(writeControls(administrator)).toEqual(
      ['Atribuir modelo', 'Editar', 'Enviar foto de Motor', 'Novo serviço', 'Remover'].sort(),
    );

    TestBed.resetTestingModule();
    configure();

    const inspector = await render('inspector');
    expect(writeControls(inspector)).toEqual([]);
    // The content stays: the services and the assignment are listed.
    expect(inspector.textContent).toContain('Motor');
    expect(inspector.textContent).toContain('Casco e convés');
  });
});
