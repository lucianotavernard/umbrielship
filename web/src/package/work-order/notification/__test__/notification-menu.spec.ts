import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import type { Role } from '../../../identity/user/user.service';
import { NotificationMenu } from '../components/notification-menu';

const at = (hour: number, minute = 0, day = 20) => new Date(2026, 10, day, hour, minute);

const order = (id: string, end: Date, vesselId = 'v-aurora') => ({
  id,
  vesselId,
  startDate: at(8, 0, 18).toISOString(),
  endDate: end.toISOString(),
  status: 'IN_PROGRESS',
  services: [],
});

const vessels = {
  vessels: [
    { id: 'v-aurora', name: 'Aurora do Sul' },
    { id: 'v-mare', name: 'Maré Alta' },
  ],
  total: 2,
};

describe('NotificationMenu', () => {
  let controller: HttpTestingController;

  beforeEach(() => {
    // Only the clock is fixed: the deadlines read against 20/11 at 10:00.
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(at(10));
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    controller.verify();
    vi.useRealTimers();
  });

  async function settle() {
    await new Promise((resolve) => setTimeout(resolve));
    TestBed.tick();
  }

  async function render(role: Role, userId = 'user-1') {
    const fixture = TestBed.createComponent(NotificationMenu);
    fixture.componentRef.setInput('userId', userId);
    fixture.componentRef.setInput('role', role);
    await settle();
    return { fixture, element: fixture.nativeElement as HTMLElement };
  }

  const squash = (node: Element | null | undefined) => node?.textContent?.replace(/\s+/g, ' ').trim();
  const trigger = (element: HTMLElement) =>
    element.querySelector<HTMLButtonElement>('[data-slot="notification-trigger"]')!;
  const items = (element: HTMLElement) =>
    [...element.querySelectorAll<HTMLAnchorElement>('[data-slot="notification-item"]')].map((item) => ({
      title: squash(item.querySelector('[data-slot="notification-title"]')),
      detail: squash(item.querySelector('[data-slot="notification-detail"]')),
      time: squash(item.querySelector('[data-slot="notification-time"]')),
      href: item.getAttribute('href'),
    }));

  it('notifications C4 shows a dot for unseen notices and opening the menu lists them and marks them seen', async () => {
    const { element } = await render('operator');
    controller.expectOne('/api/work-orders').flush({
      workOrders: [order('aaaaaaaa-late', at(8)), order('bbbbbbbb-today', at(16), 'v-mare'), order('cccccccc-later', at(9, 0, 22))],
      total: 3,
    });
    controller.expectOne('/api/vessels').flush(vessels);
    await settle();

    expect(element.querySelector('[data-slot="notification-dot"]')).not.toBeNull();
    expect(trigger(element).getAttribute('aria-label')).toBe('Notificações: 2 novas');

    trigger(element).click();
    await settle();
    // Opening asks for the orders again, so the menu shows what holds now.
    controller.expectOne('/api/work-orders').flush({
      workOrders: [order('aaaaaaaa-late', at(8)), order('bbbbbbbb-today', at(16), 'v-mare')],
      total: 2,
    });
    await settle();

    expect(squash(element.querySelector('[data-slot="notification-status"]'))).toBe('2 novas');
    expect(items(element)).toEqual([
      { title: 'Ordem #AAAAAAAA atrasada', detail: 'Aurora do Sul · prazo 20/11, 08:00', time: 'Há 2 h', href: '/work-orders/aaaaaaaa-late' },
      { title: 'Ordem #BBBBBBBB vence hoje', detail: 'Maré Alta · até 16:00', time: 'Hoje', href: '/work-orders/bbbbbbbb-today' },
    ]);
    expect(element.querySelector('[data-slot="notification-dot"]')).toBeNull();
    expect(trigger(element).getAttribute('aria-label')).toBe('Notificações');
    expect(JSON.parse(localStorage.getItem('@umbriel:notifications-seen:user-1')!)).toEqual([
      'overdue:aaaaaaaa-late',
      'due-today:bbbbbbbb-today',
    ]);
  });

  it('notifications C5 shows no dot for notices already seen by this user', async () => {
    localStorage.setItem('@umbriel:notifications-seen:user-1', JSON.stringify(['overdue:aaaaaaaa-late']));
    const { element } = await render('administrator');
    controller.expectOne('/api/work-orders').flush({ workOrders: [order('aaaaaaaa-late', at(8))], total: 1 });
    controller.expectOne('/api/vessels').flush(vessels);
    await settle();

    expect(element.querySelector('[data-slot="notification-dot"]')).toBeNull();
    expect(trigger(element).getAttribute('aria-label')).toBe('Notificações');
  });

  it('notifications C6 tells an inspector of the inspections ready to inspect', async () => {
    const { element } = await render('inspector');
    controller.expectOne('/api/inspection-assignments').flush({
      inspectionAssignments: [
        {
          id: 'as-1',
          templateName: 'Pintura do casco',
          service: null,
          createdAt: at(9).toISOString(),
          items: [],
          removable: true,
          inspections: [],
          workOrder: { id: 'wo-1', vesselId: 'v-mare', status: 'IN_PROGRESS' },
        },
      ],
    });
    controller.expectOne('/api/vessels').flush(vessels);
    await settle();

    expect(trigger(element).getAttribute('aria-label')).toBe('Notificações: 1 nova');
    trigger(element).click();
    await settle();
    expect(items(element)).toEqual([
      {
        title: 'Inspeção liberada: Pintura do casco',
        detail: 'Maré Alta · Ordem de serviço inteira',
        time: 'Há 1 h',
        href: '/work-orders/wo-1/assignments/as-1/inspect',
      },
    ]);
    controller.expectOne('/api/inspection-assignments').flush({ inspectionAssignments: [] });
    await settle();

    expect(controller.match('/api/work-orders')).toHaveLength(0);
  });

  it('notifications C6 says there is nothing when the Role has no notice', async () => {
    const { element } = await render('operator');
    controller.expectOne('/api/work-orders').flush({ workOrders: [], total: 0 });
    controller.expectOne('/api/vessels').flush(vessels);
    await settle();

    expect(element.querySelector('[data-slot="notification-dot"]')).toBeNull();
    trigger(element).click();
    await settle();
    controller.expectOne('/api/work-orders').flush({ workOrders: [], total: 0 });
    await settle();

    expect(squash(element.querySelector('[data-slot="notification-empty"]'))).toBe('Nenhuma notificação por enquanto.');
    expect(element.textContent).toContain('Você está em dia com a operação');
    expect(squash(element.querySelector('[data-slot="notification-status"]'))).toBe('Atualizadas');
  });
});
