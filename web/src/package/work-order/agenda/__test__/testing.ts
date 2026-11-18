import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { provideLocationMocks } from '@angular/common/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthenticationService } from '../../../identity/authentication/authentication.service';
import type { Role } from '../../../identity/user/user.service';
import { Agenda } from '../agenda-page/agenda';
import { answerWorkforce } from '../../../shared/testing/workforce';

// Shared steps and fixtures for the Agenda specs. The clock is Wednesday 18 Nov 2026, 10:00:
// the week shown first is Monday 16 to Sunday 22.

@Component({ template: '' })
class Stub {}

/** Wednesday 18 Nov 2026, 10:00: each Agenda spec sets the clock here with `vi.setSystemTime`. */
export const NOW = new Date(2026, 10, 18, 10, 0);

export function configure() {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      provideRouter([{ path: 'work-orders/:id', component: Stub }]),
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

export function fill(field: HTMLInputElement, value: string) {
  field.value = value;
  field.dispatchEvent(new Event('input', { bubbles: true }));
  field.dispatchEvent(new Event('blur', { bubbles: true }));
}

export function choose(select: HTMLSelectElement, value: string) {
  select.value = value;
  select.dispatchEvent(new Event('input', { bubbles: true }));
  select.dispatchEvent(new Event('change', { bubbles: true }));
}

/** An ISO date from a local date and time of November 2026. */
export const at = (day: number, hours: number, minutes = 0) =>
  new Date(2026, 10, day, hours, minutes).toISOString();

export const AURORA = 'ab12cd34-1111-4111-8111-111111111111';
export const BOREAL = 'ef56ab78-2222-4222-8222-222222222222';
export const CASSIOPEIA = 'cc00cc00-3333-4333-8333-333333333333';
export const DELFIM = 'dd00dd00-4444-4444-8444-444444444444';

const service = (id: string, name: string, start: string, status = 'PENDING') => ({
  id,
  name,
  startDate: start,
  endDate: start,
  status,
});

export const vessels = [
  { id: 'v1', imoNumber: '9074729', name: 'Aurora', type: 'CARGO', length: 32.5, customerId: 'c1' },
  { id: 'v2', imoNumber: '9176187', name: 'Boreal', type: 'TANKER', length: 48, customerId: 'c1' },
  {
    id: 'v3',
    imoNumber: '9321483',
    name: 'Cassiopeia',
    type: 'FISHING',
    length: 20,
    customerId: 'c1',
  },
  { id: 'v4', imoNumber: '9254654', name: 'Delfim', type: 'TUG', length: 18, customerId: 'c1' },
];

export const aurora = (extra: object[] = []) => ({
  id: AURORA,
  vesselId: 'v1',
  status: 'IN_PROGRESS',
  // Docagem Monday 06:00 (row 08:00), Desdocagem Saturday 21:00 (row 18:00).
  startDate: at(16, 6),
  endDate: at(21, 21),
  services: [
    service('svc-1', 'Pintura do casco', at(17, 9, 30), 'IN_PROGRESS'),
    service('svc-2', 'Revisão do motor', at(18, 9, 45)),
    ...extra,
  ],
});

/**
 * The week of 16-22 Nov holds six items: Mon 06:00 Docagem (Aurora), Tue 09:30 Pintura do casco,
 * Wed 08:00 Docagem (Boreal), Wed 09:45 Revisão do motor, Wed 14:15 Solda do leme, Sat 21:00
 * Desdocagem (Aurora). The cancelled Cassiopeia shows nothing; Delfim is the week before; Boreal's
 * Desdocagem is the week after.
 */
export const workOrders = () => [
  aurora(),
  {
    id: BOREAL,
    vesselId: 'v2',
    status: 'PENDING',
    startDate: at(18, 8),
    endDate: at(27, 12),
    services: [service('svc-3', 'Solda do leme', at(18, 14, 15))],
  },
  {
    id: CASSIOPEIA,
    vesselId: 'v3',
    status: 'CANCELLED',
    startDate: at(19, 10),
    endDate: at(19, 16),
    services: [service('svc-4', 'Lixamento', at(19, 12))],
  },
  {
    id: DELFIM,
    vesselId: 'v4',
    status: 'COMPLETED',
    startDate: at(10, 10),
    endDate: at(12, 16),
    services: [],
  },
];

export async function renderAgenda(
  controller: HttpTestingController,
  role: Role | null,
  orders: object[] = workOrders(),
  workforce: Parameters<typeof answerWorkforce>[1] = {},
) {
  TestBed.inject(AuthenticationService).role.set(role);
  const fixture = TestBed.createComponent(Agenda);
  await settle();
  controller
    .expectOne({ method: 'GET', url: '/api/work-orders' })
    .flush({ workOrders: orders, total: orders.length });
  controller
    .expectOne({ method: 'GET', url: '/api/vessels' })
    .flush({ vessels, total: vessels.length });
  answerWorkforce(controller, workforce);
  await settle();
  return fixture.nativeElement as HTMLElement;
}

export const headers = (element: HTMLElement) => [
  ...element.querySelectorAll<HTMLButtonElement>('[data-slot="day-header"]'),
];

export const headerTexts = (element: HTMLElement) =>
  headers(element).map((header) => [...header.children].map((part) => text(part)));

export const cells = (element: HTMLElement) => [
  ...element.querySelectorAll<HTMLElement>('[data-slot="cell"]'),
];

/** The cell of a day column (0 = first shown) and an hour row (0 = "08:00"). */
export const cell = (element: HTMLElement, day: number, row: number) =>
  cells(element)[row * headers(element).length + day];

/**
 * The fields each item shows, as drawn: a compact card (two or more in a cell, AD-052) shows the
 * time and the Vessel on its first line and "<name> · <code>" on its second; a card hidden with CSS
 * would not count.
 */
export const itemsIn = (node: ParentNode) =>
  [...node.querySelectorAll<HTMLButtonElement>('[data-slot="agenda-item"]')].map((item) =>
    [...item.children]
      .filter((part) => !part.classList.contains('hidden'))
      .flatMap((part) => {
        const slot = part.getAttribute('data-slot');
        if (slot === 'compact-head') return [...part.querySelectorAll('span, strong')].map((field) => text(field));
        if (slot === 'compact-detail') return (text(part) ?? '').split(' · ');
        return [text(part)];
      }),
  );

export const metrics = (element: HTMLElement) =>
  [...element.querySelectorAll('[data-slot="metric"]')].map((metric) =>
    [...metric.querySelectorAll('span, strong, small')]
      .filter((part) => part.children.length === 0)
      .map((part) => text(part))
      .filter(Boolean),
  );

export const panel = (element: HTMLElement) =>
  element.querySelector<HTMLElement>('[data-slot="day-panel"]')!;

/** Each day panel item as time, Vessel, name and code: the time, the rail, the copy, the arrow. */
export const panelItems = (element: HTMLElement) =>
  [...panel(element).querySelectorAll('[data-slot="day-item"]')].map((item) => [
    text(item.children[0]),
    ...[...(item.children[2]?.children ?? [])].map((part) => text(part)),
  ]);
