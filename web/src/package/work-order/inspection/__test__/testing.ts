import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AuthenticationService } from '../../../identity/authentication/authentication.service';
import type { Role } from '../../../identity/user/user.service';
import { WorkOrderDetail } from '../../work-order/work-order-detail/work-order-detail';

export { buttons, configure, dialogs, rows, settle } from '../../inspection-assignment/__test__/testing';

// One question of each type, as an assignment copies them.
export const items = [
  { id: 'q-text', label: 'Observações do casco', position: 0, type: 'TEXT' },
  { id: 'q-yes', label: 'Casco limpo?', position: 1, type: 'YES_NO' },
  { id: 'q-conf', label: 'Pintura sem bolhas', position: 2, type: 'CONFORMITY' },
  { id: 'q-score', label: 'Acabamento', position: 3, type: 'SCORE' },
];

export const inspection = (id: string, result: 'APPROVED' | 'REPROVED', completedAt: string, inspectorName = 'Inês Prado') => ({
  id,
  result,
  inspectorName,
  completedAt,
  answers: [
    { itemId: 'q-text', notApplicable: false, value: 'Sem manchas', note: null },
    { itemId: 'q-yes', notApplicable: false, value: false, note: 'Restos de alga' },
    { itemId: 'q-conf', notApplicable: true, value: null, note: null },
    { itemId: 'q-score', notApplicable: false, value: 7, note: null },
  ],
});

export const assignment = (
  id: string,
  service: { id: string; name: string } | null,
  inspections: object[] = [],
) => ({
  id,
  templateName: `Modelo ${id}`,
  service,
  createdAt: '2026-11-14T10:00:00.000Z',
  items,
  removable: inspections.length === 0,
  inspections,
});

export async function render(
  controller: HttpTestingController,
  role: Role | null,
  assignments: object[],
  { workOrderStatus = 'IN_PROGRESS', serviceStatus = 'IN_PROGRESS' } = {},
) {
  TestBed.inject(AuthenticationService).role.set(role);
  const fixture = TestBed.createComponent(WorkOrderDetail);
  fixture.componentRef.setInput('id', 'wo-1');
  await new Promise((resolve) => setTimeout(resolve));
  TestBed.tick();
  controller.expectOne('/api/work-orders/wo-1').flush({
    workOrder: {
      id: 'wo-1',
      startDate: '2026-11-01T00:00:00.000Z',
      endDate: '2026-11-30T00:00:00.000Z',
      status: workOrderStatus,
      vessel: { vesselId: 'vessel-1', name: 'Aurora', type: 'CARGO', length: 12 },
    },
  });
  controller.expectOne('/api/work-orders/wo-1/services').flush({
    services: [
      {
        id: 'svc-1',
        workOrderId: 'wo-1',
        name: 'Pintura do casco',
        description: 'Casco',
        startDate: '2026-11-01T00:00:00.000Z',
        endDate: '2026-11-02T00:00:00.000Z',
        status: serviceStatus,
      },
    ],
    total: 1,
  });
  controller
    .expectOne('/api/work-orders/wo-1/inspection-assignments')
    .flush({ inspectionAssignments: assignments });
  await new Promise((resolve) => setTimeout(resolve));
  TestBed.tick();
  return fixture.nativeElement as HTMLElement;
}

export const text = (node: Element | null | undefined) => node?.textContent?.replace(/\s+/g, ' ').trim();

export async function expand(element: HTMLElement, index = 0) {
  element
    .querySelectorAll<HTMLElement>('[data-slot="assignment"]')
    [index].querySelector<HTMLButtonElement>('button[aria-expanded]')!
    .click();
  await new Promise((resolve) => setTimeout(resolve));
  TestBed.tick();
}
