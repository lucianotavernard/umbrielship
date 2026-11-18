import { WorkOrder } from '../../../work-order/work-order/work-order.service';
import { openAllocations } from '../staff-allocations';
import { Assignment } from '../staff.service';

// Local wall-clock times, so the dd/MM/yyyy HH:mm expectations hold in any timezone.
const local = (year: number, month: number, day: number, hours: number, minutes: number) =>
  new Date(year, month - 1, day, hours, minutes).toISOString();

const service = (id: string, start: string, end: string, status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED') => ({
  id,
  name: `Serviço ${id}`,
  startDate: start,
  endDate: end,
  status,
});

const order = (id: string, status: WorkOrder['status'], services: WorkOrder['services']): WorkOrder => ({
  id,
  vesselId: 'v-aur',
  startDate: local(2026, 11, 1, 8, 0),
  endDate: local(2026, 11, 30, 8, 0),
  status,
  services,
});

const assignment = (workOrderServiceId: string, staffId: string | null, teamId: string | null): Assignment => ({
  id: `a-${workOrderServiceId}`,
  workOrderId: 'wo',
  workOrderServiceId,
  staffId,
  teamId,
});

describe('openAllocations', () => {
  it('workforce C32 lists the open services of the staff and its team by start', () => {
    const workOrders = [
      order('ab12cd34-0000-4000-8000-000000000000', 'IN_PROGRESS', [
        service('late', local(2026, 11, 20, 8, 0), local(2026, 11, 21, 17, 0), 'PENDING'),
        service('team', local(2026, 11, 17, 9, 0), local(2026, 11, 18, 17, 0), 'IN_PROGRESS'),
        service('done', local(2026, 11, 10, 9, 0), local(2026, 11, 11, 9, 0), 'COMPLETED'),
        service('other', local(2026, 11, 12, 9, 0), local(2026, 11, 13, 9, 0), 'PENDING'),
      ]),
      order('ef90ab12-0000-4000-8000-000000000000', 'CANCELLED', [
        service('cancelled', local(2026, 11, 5, 9, 0), local(2026, 11, 6, 9, 0), 'PENDING'),
      ]),
    ];
    const assignments = [
      assignment('late', 'rafael', null),
      assignment('team', null, 'alfa'),
      assignment('done', 'rafael', null),
      assignment('other', 'pedro', null),
      assignment('cancelled', 'rafael', null),
    ];

    const result = openAllocations(
      { id: 'rafael', teamId: 'alfa' },
      assignments,
      workOrders,
      new Map([['v-aur', 'Aurora']]),
    );

    expect(result.map(({ workOrderId, serviceName, code, vesselName, period }) => ({ workOrderId, serviceName, code, vesselName, period }))).toEqual([
      {
        workOrderId: 'ab12cd34-0000-4000-8000-000000000000',
        serviceName: 'Serviço team',
        code: '#AB12CD34',
        vesselName: 'Aurora',
        period: '17/11/2026 09:00 – 18/11/2026 17:00',
      },
      {
        workOrderId: 'ab12cd34-0000-4000-8000-000000000000',
        serviceName: 'Serviço late',
        code: '#AB12CD34',
        vesselName: 'Aurora',
        period: '20/11/2026 08:00 – 21/11/2026 17:00',
      },
    ]);

    // No Team: only its own Assignment counts.
    expect(openAllocations({ id: 'rafael', teamId: null }, assignments, workOrders, new Map()).map((item) => item.serviceName)).toEqual([
      'Serviço late',
    ]);
    expect(openAllocations({ id: 'nobody', teamId: null }, assignments, workOrders, new Map())).toEqual([]);
  });
});
