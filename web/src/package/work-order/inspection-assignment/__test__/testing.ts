import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { provideLocationMocks } from '@angular/common/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthenticationService } from '../../../identity/authentication/authentication.service';
import type { Role } from '../../../identity/user/user.service';
import { WorkOrderDetail } from '../../work-order/work-order-detail/work-order-detail';
import { answerWorkforce } from '../../../shared/testing/workforce';

// Renders the WorkOrder page with its assignments, as every assignment spec reaches it.

export async function settle() {
  await new Promise((resolve) => setTimeout(resolve));
  TestBed.tick();
}

@Component({ template: '' })
class Stub {}

export function configure() {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      // The inspection pages the section opens, so `Router.url` tells where it went.
      provideRouter([
        { path: 'work-orders/:id/assignments/:assignmentId/inspect', component: Stub },
        {
          path: 'work-orders/:id/assignments/:assignmentId/inspections/:inspectionId',
          component: Stub,
        },
      ]),
      provideLocationMocks(),
    ],
  });
  return TestBed.inject(HttpTestingController);
}

export const services = [
  {
    id: 'svc-1',
    workOrderId: 'wo-1',
    name: 'Pintura do casco',
    description: 'Casco',
    startDate: '2026-01-01T00:00:00.000Z',
    endDate: '2026-01-02T00:00:00.000Z',
    status: 'IN_PROGRESS',
  },
  {
    id: 'svc-2',
    workOrderId: 'wo-1',
    name: 'Solda do leme',
    description: 'Leme',
    startDate: '2026-01-01T00:00:00.000Z',
    endDate: '2026-01-02T00:00:00.000Z',
    status: 'PENDING',
  },
];

export const assignment = (
  id: string,
  templateName: string,
  service: { id: string; name: string } | null,
  labels: string[],
) => ({
  id,
  templateName,
  service,
  createdAt: '2026-11-14T10:00:00.000Z',
  items: labels.map((label, position) => ({
    id: `${id}-i${position}`,
    label,
    position,
    type: 'CONFORMITY' as const,
  })),
  removable: true,
  inspections: [] as object[],
});

export const assignments = [
  assignment('a2', 'Solda', { id: 'svc-2', name: 'Solda do leme' }, ['Cordão contínuo']),
  {
    // Listed out of order on purpose: the page numbers questions by `position`.
    ...assignment('a1', 'Pintura do casco', null, ['Casco limpo', 'Sem bolhas', 'Calado visível']),
    items: [
      { id: 'a1-i2', label: 'Calado visível', position: 2 },
      { id: 'a1-i0', label: 'Casco limpo', position: 0 },
      { id: 'a1-i1', label: 'Sem bolhas', position: 1 },
    ],
  },
];

export async function render(
  controller: HttpTestingController,
  role: Role | null,
  list: object[] = assignments,
  { workOrderStatus = 'IN_PROGRESS' } = {},
) {
  TestBed.inject(AuthenticationService).role.set(role);
  const fixture = TestBed.createComponent(WorkOrderDetail);
  fixture.componentRef.setInput('id', 'wo-1');
  await settle();
  controller.expectOne('/api/work-orders/wo-1').flush({
    workOrder: {
      id: 'wo-1',
      startDate: '2026-01-01T00:00:00.000Z',
      endDate: '2026-01-02T00:00:00.000Z',
      status: workOrderStatus,
      vessel: { vesselId: 'vessel-1', name: 'Aurora', type: 'CARGO', length: 12 },
    },
  });
  controller.expectOne('/api/work-orders/wo-1/services').flush({ services, total: 2 });
  controller
    .expectOne('/api/work-orders/wo-1/inspection-assignments')
    .flush({ inspectionAssignments: list });
  answerWorkforce(controller);
  await settle();
  return fixture.nativeElement as HTMLElement;
}

export function rows(element: HTMLElement) {
  return [...element.querySelectorAll<HTMLElement>('[data-slot="assignment"]')];
}

export function buttons(element: ParentNode, text: string) {
  return [...element.querySelectorAll<HTMLButtonElement>('button')].filter(
    (button) => button.textContent?.trim() === text || button.getAttribute('aria-label') === text,
  );
}

export function dialogs(element: ParentNode) {
  return [...element.querySelectorAll<HTMLElement>('[role="dialog"]')];
}

export function choose(select: HTMLSelectElement, value: string) {
  select.value = value;
  select.dispatchEvent(new Event('input', { bubbles: true }));
  select.dispatchEvent(new Event('change', { bubbles: true }));
}
