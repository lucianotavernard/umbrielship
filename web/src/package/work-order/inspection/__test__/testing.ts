import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideLocationMocks } from '@angular/common/testing';
import { provideRouter, Routes } from '@angular/router';

import { AuthenticationService } from '../../../identity/authentication/authentication.service';
import type { Role } from '../../../identity/user/user.service';
import { InspectionPage } from '../inspection-page/inspection-page';
import { InspectionsHub } from '../inspections-hub/inspections-hub';

// Shared steps and fixtures for the Inspections hub and the inspection page specs.

@Component({ template: '' })
class Stub {}

// The pages these screens navigate to, so `Router.url` tells where a navigation went.
const routes: Routes = [
  { path: 'inspections', component: Stub },
  { path: 'inspection-templates/:id', component: Stub },
  { path: 'work-orders/:id', component: Stub },
  { path: 'work-orders/:id/assignments/:assignmentId/inspect', component: Stub },
  { path: 'work-orders/:id/assignments/:assignmentId/inspections/:inspectionId', component: Stub },
];

export function configure() {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      provideRouter(routes),
      provideLocationMocks(),
    ],
  });
  return TestBed.inject(HttpTestingController);
}

export async function settle() {
  await new Promise((resolve) => setTimeout(resolve));
  TestBed.tick();
}

export const text = (node: Element | null | undefined) =>
  node?.textContent?.replace(/\s+/g, ' ').trim();

export function buttons(element: ParentNode, label: string) {
  return [...element.querySelectorAll<HTMLButtonElement>('button')].filter(
    (button) => text(button) === label || button.getAttribute('aria-label') === label,
  );
}

export function button(element: ParentNode, label: string) {
  const found = buttons(element, label)[0];
  if (!found) throw new Error(`no button ${label}`);
  return found;
}

export function dialogs(element: ParentNode) {
  return [...element.querySelectorAll<HTMLElement>('[role="dialog"]')];
}

export function dialog(element: ParentNode, title: string) {
  return dialogs(element).find((candidate) => text(candidate.querySelector('h2')) === title);
}

export function fill(field: HTMLInputElement | HTMLTextAreaElement, value: string) {
  field.value = value;
  field.dispatchEvent(new Event('input', { bubbles: true }));
  field.dispatchEvent(new Event('blur', { bubbles: true }));
}

export function choose(select: HTMLSelectElement, value: string) {
  select.value = value;
  select.dispatchEvent(new Event('input', { bubbles: true }));
  select.dispatchEvent(new Event('change', { bubbles: true }));
}

export const options = (select: HTMLSelectElement) =>
  [...select.options].map((option) => text(option));

// ---------------------------------------------------------------- the Inspections hub

export const WO_AURORA = 'ab12cd34-1111-4111-8111-111111111111';
export const WO_BOREAL = 'ef56ab78-2222-4222-8222-222222222222';

export const vessels = [
  { id: 'v1', imoNumber: '9074729', name: 'Aurora', type: 'CARGO', length: 32.5, customerId: 'c1' },
  { id: 'v2', imoNumber: '9176187', name: 'Boreal', type: 'TANKER', length: 48, customerId: 'c1' },
];

const service = (id: string, name: string, status: string) => ({
  id,
  name,
  startDate: '2026-11-17T12:00:00.000Z',
  endDate: '2026-11-20T13:00:00.000Z',
  status,
});

export const workOrders = [
  {
    id: WO_AURORA,
    vesselId: 'v1',
    startDate: '2026-11-17T12:12:00.000Z',
    endDate: '2026-11-20T13:00:00.000Z',
    status: 'IN_PROGRESS',
    services: [
      service('svc-1', 'Motor', 'IN_PROGRESS'),
      service('svc-2', 'Pintura do casco', 'PENDING'),
    ],
  },
  {
    id: WO_BOREAL,
    vesselId: 'v2',
    startDate: '2026-11-10T12:00:00.000Z',
    endDate: '2026-11-12T13:00:00.000Z',
    status: 'PENDING',
    services: [],
  },
];

/** A template as `GET /inspection-templates` lists it; 15:00 UTC is 18 nov in every Brazilian zone. */
export const templateSummary = (
  id: string,
  name: string,
  itemCount: number,
  createdAt = '2026-11-18T15:00:00.000Z',
) => ({
  id,
  name,
  itemCount,
  createdAt,
});

export const completed = (
  id: string,
  result: 'APPROVED' | 'REPROVED',
  completedAt = '2026-11-18T14:30:00',
) => ({
  id,
  result,
  inspectorName: 'Inês Prado',
  completedAt,
  answers: [],
});

const conformity = (prefix: string, count: number) =>
  Array.from({ length: count }, (_, position) => ({
    id: `${prefix}-q${position}`,
    label: `Pergunta ${position + 1}`,
    position,
    type: 'CONFORMITY',
  }));

/** An assignment as `GET /inspection-assignments` lists it for the whole Organization. */
export const organizationAssignment = (
  id: string,
  {
    templateName = `Modelo ${id}`,
    workOrder = { id: WO_AURORA, vesselId: 'v1', status: 'IN_PROGRESS' },
    service = null as { id: string; name: string; status: string } | null,
    questions = 1,
    inspections = [] as object[],
    createdAt = '2026-11-14T10:00:00.000Z',
  } = {},
) => ({
  id,
  templateName,
  service,
  createdAt,
  items: conformity(id, questions),
  removable: inspections.length === 0,
  inspections,
  workOrder,
});

export type HubData = {
  templates?: object[];
  assignments?: object[];
  workOrders?: object[];
  vessels?: object[];
};

/** Answers the four reads of the hub, each a GET with no query. */
export function flushHub(controller: HttpTestingController, data: HubData = {}) {
  const templates = data.templates ?? [];
  controller
    .expectOne({ method: 'GET', url: '/api/inspection-templates' })
    .flush({ inspectionTemplates: templates, total: templates.length });
  controller
    .expectOne({ method: 'GET', url: '/api/inspection-assignments' })
    .flush({ inspectionAssignments: data.assignments ?? [] });
  const orders = data.workOrders ?? workOrders;
  controller
    .expectOne({ method: 'GET', url: '/api/work-orders' })
    .flush({ workOrders: orders, total: orders.length });
  const ships = data.vessels ?? vessels;
  controller
    .expectOne({ method: 'GET', url: '/api/vessels' })
    .flush({ vessels: ships, total: ships.length });
}

export async function renderHub(
  controller: HttpTestingController,
  role: Role | null,
  data: HubData = {},
) {
  TestBed.inject(AuthenticationService).role.set(role);
  const fixture = TestBed.createComponent(InspectionsHub);
  await settle();
  flushHub(controller, data);
  await settle();
  return fixture.nativeElement as HTMLElement;
}

export const tabs = (element: HTMLElement) => [
  ...element.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
];

export const metrics = (element: HTMLElement) =>
  [...element.querySelectorAll('[data-slot="metric"]')].map((metric) =>
    [...metric.querySelectorAll('span, strong, small')]
      .filter((part) => part.children.length === 0)
      .map((part) => text(part))
      .filter(Boolean),
  );

// ---------------------------------------------------------------- the inspection page

// One question of each type, as an assignment copies them.
export const items = [
  { id: 'q-text', label: 'Observações do casco', position: 0, type: 'TEXT' },
  { id: 'q-yes', label: 'Casco limpo?', position: 1, type: 'YES_NO' },
  { id: 'q-conf', label: 'Pintura sem bolhas', position: 2, type: 'CONFORMITY' },
  { id: 'q-score', label: 'Acabamento', position: 3, type: 'SCORE' },
];

export const inspection = (
  id: string,
  result: 'APPROVED' | 'REPROVED',
  completedAt: string,
  inspectorName = 'Carlos Lima',
) => ({
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

/** An assignment as `GET /work-orders/:id/inspection-assignments` lists it. */
export const assignment = (
  id: string,
  service: { id: string; name: string } | null,
  inspections: object[] = [],
  questions: object[] = items,
) => ({
  id,
  templateName: 'Inspeção do casco',
  service,
  createdAt: '2026-11-14T10:00:00.000Z',
  items: questions,
  removable: inspections.length === 0,
  inspections,
});

export type PageOptions = {
  role?: Role | null;
  name?: string | null;
  id?: string;
  assignmentId?: string;
  inspectionId?: string;
  from?: string;
  workOrderStatus?: string;
  serviceStatus?: string;
  assignments?: object[];
};

/** Renders the inspection page as the router does, with its inputs, and answers its three reads. */
export async function renderPage(controller: HttpTestingController, options: PageOptions = {}) {
  const {
    role = 'inspector',
    name = 'Inês Prado',
    id = 'wo-1',
    assignmentId = 'a1',
    inspectionId,
    from,
    workOrderStatus = 'IN_PROGRESS',
    serviceStatus = 'IN_PROGRESS',
    assignments = [assignment('a1', null)],
  } = options;
  const authentication = TestBed.inject(AuthenticationService);
  authentication.role.set(role);
  authentication.name.set(name);

  const fixture = TestBed.createComponent(InspectionPage);
  fixture.componentRef.setInput('id', id);
  fixture.componentRef.setInput('assignmentId', assignmentId);
  if (inspectionId !== undefined) fixture.componentRef.setInput('inspectionId', inspectionId);
  if (from !== undefined) fixture.componentRef.setInput('from', from);
  await settle();

  controller.expectOne({ method: 'GET', url: `/api/work-orders/${id}` }).flush({
    workOrder: {
      id,
      startDate: '2026-11-17T12:12:00.000Z',
      endDate: '2026-11-20T13:00:00.000Z',
      status: workOrderStatus,
      vessel: { vesselId: 'v1', name: 'Aurora', type: 'CARGO', length: 32.5 },
    },
  });
  controller.expectOne({ method: 'GET', url: `/api/work-orders/${id}/services` }).flush({
    services: [
      {
        id: 'svc-1',
        workOrderId: id,
        name: 'Pintura do casco',
        description: 'Casco',
        startDate: '2026-11-17T12:12:00.000Z',
        endDate: '2026-11-18T12:00:00.000Z',
        status: serviceStatus,
      },
    ],
    total: 1,
  });
  controller
    .expectOne({ method: 'GET', url: `/api/work-orders/${id}/inspection-assignments` })
    .flush({ inspectionAssignments: assignments });
  await settle();
  return fixture.nativeElement as HTMLElement;
}

export const questionCards = (element: HTMLElement) => [
  ...element.querySelectorAll<HTMLElement>('[data-slot="question"]'),
];

export const meta = (element: HTMLElement) =>
  [...element.querySelectorAll('dl > div')].map((entry) => [
    text(entry.querySelector('dt')),
    text(entry.querySelector('dd')),
  ]);

export async function press(element: ParentNode, label: string) {
  button(element, label).click();
  await settle();
}

export async function type(field: HTMLTextAreaElement, value: string) {
  fill(field, value);
  await settle();
}
