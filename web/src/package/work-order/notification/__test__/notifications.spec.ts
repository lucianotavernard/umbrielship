import type { OrganizationInspectionAssignment } from '../../inspection-assignment/inspection-assignment.service';
import type { WorkOrder, WorkOrderStatus } from '../../work-order/work-order.service';
import { buildNotifications, timeAgo } from '../notifications';

const at = (day: number, hour: number, minute = 0) => new Date(2026, 10, day, hour, minute);
const now = at(20, 10);

const order = (id: string, end: Date, status: WorkOrderStatus = 'IN_PROGRESS', vesselId = 'v-aurora'): WorkOrder => ({
  id,
  vesselId,
  startDate: at(18, 8).toISOString(),
  endDate: end.toISOString(),
  status,
  services: [],
});

const assignment = (
  id: string,
  workOrderStatus: string,
  service: { id: string; name: string; status: string } | null,
  inspections = 0,
  createdAt = at(20, 9),
): OrganizationInspectionAssignment =>
  ({
    id,
    templateName: 'Pintura do casco',
    service,
    createdAt: createdAt.toISOString(),
    items: [],
    removable: true,
    inspections: Array.from({ length: inspections }, (_, index) => ({ id: `i-${index}` })),
    workOrder: { id: `wo-${id}`, vesselId: 'v-mare', status: workOrderStatus },
  }) as unknown as OrganizationInspectionAssignment;

const vesselNames = { 'v-aurora': 'Aurora do Sul', 'v-mare': 'Maré Alta' };

describe('buildNotifications', () => {
  it('notifications C1 tells an operator of the late open orders, most late first, then of the ones due today', () => {
    const workOrders = [
      order('aaaaaaaa-1', at(20, 16)),
      order('bbbbbbbb-2', at(19, 8)),
      order('cccccccc-3', at(20, 9, 30), 'PENDING'),
      order('dddddddd-4', at(19, 8), 'COMPLETED'),
      order('eeeeeeee-5', at(18, 8), 'CANCELLED'),
      order('ffffffff-6', at(21, 9)),
      order('gggggggg-7', at(20, 12)),
    ];

    const notices = buildNotifications({ role: 'operator', workOrders, assignments: [], vesselNames, now });

    expect(notices.map(({ id, title, detail, time, link }) => ({ id, title, detail, time, link }))).toEqual([
      {
        id: 'overdue:bbbbbbbb-2',
        title: 'Ordem #BBBBBBBB atrasada',
        detail: 'Aurora do Sul · prazo 19/11, 08:00',
        time: 'Há 1 dia',
        link: ['/work-orders', 'bbbbbbbb-2'],
      },
      {
        id: 'overdue:cccccccc-3',
        title: 'Ordem #CCCCCCCC atrasada',
        detail: 'Aurora do Sul · prazo 20/11, 09:30',
        time: 'Há 30 min',
        link: ['/work-orders', 'cccccccc-3'],
      },
      {
        id: 'due-today:gggggggg-7',
        title: 'Ordem #GGGGGGGG vence hoje',
        detail: 'Aurora do Sul · até 12:00',
        time: 'Hoje',
        link: ['/work-orders', 'gggggggg-7'],
      },
      {
        id: 'due-today:aaaaaaaa-1',
        title: 'Ordem #AAAAAAAA vence hoje',
        detail: 'Aurora do Sul · até 16:00',
        time: 'Hoje',
        link: ['/work-orders', 'aaaaaaaa-1'],
      },
    ]);
    // An administrator hears the same.
    expect(buildNotifications({ role: 'administrator', workOrders, assignments: [], vesselNames, now })).toEqual(notices);
  });

  it('notifications C2 tells an inspector of each assignment ready to inspect and not inspected, newest first', () => {
    const assignments = [
      assignment('a-whole', 'IN_PROGRESS', null, 0, at(20, 8)),
      assignment('a-service', 'IN_PROGRESS', { id: 's1', name: 'Pintura', status: 'IN_PROGRESS' }, 0, at(20, 9)),
      assignment('a-service-pending', 'IN_PROGRESS', { id: 's2', name: 'Solda', status: 'PENDING' }),
      assignment('a-order-pending', 'PENDING', null),
      assignment('a-done', 'IN_PROGRESS', null, 1),
    ];

    const notices = buildNotifications({ role: 'inspector', workOrders: [order('x', at(19, 8))], assignments, vesselNames, now });

    expect(notices.map(({ id, title, detail, time, link }) => ({ id, title, detail, time, link }))).toEqual([
      {
        id: 'inspection:a-service',
        title: 'Inspeção liberada: Pintura do casco',
        detail: 'Maré Alta · Pintura',
        time: 'Há 1 h',
        link: ['/work-orders', 'wo-a-service', 'assignments', 'a-service', 'inspect'],
      },
      {
        id: 'inspection:a-whole',
        title: 'Inspeção liberada: Pintura do casco',
        detail: 'Maré Alta · Ordem de serviço inteira',
        time: 'Há 2 h',
        link: ['/work-orders', 'wo-a-whole', 'assignments', 'a-whole', 'inspect'],
      },
    ]);
  });

  it('notifications C3 has nothing for a Role it does not know and names an unknown vessel plainly', () => {
    expect(buildNotifications({ role: null, workOrders: [order('x', at(19, 8))], assignments: [], vesselNames, now })).toEqual([]);
    const [notice] = buildNotifications({
      role: 'operator',
      workOrders: [order('x', at(19, 8), 'IN_PROGRESS', 'v-gone')],
      assignments: [],
      vesselNames,
      now,
    });
    expect(notice.detail).toBe('Embarcação · prazo 19/11, 08:00');
  });

  it('notifications C3 says how long ago in minutes, hours and days', () => {
    expect(timeAgo(at(20, 9, 55), now)).toBe('Há 5 min');
    expect(timeAgo(at(20, 10), now)).toBe('Há 1 min');
    expect(timeAgo(at(20, 7), now)).toBe('Há 3 h');
    expect(timeAgo(at(19, 10), now)).toBe('Há 1 dia');
    expect(timeAgo(at(17, 9), now)).toBe('Há 3 dias');
  });
});
