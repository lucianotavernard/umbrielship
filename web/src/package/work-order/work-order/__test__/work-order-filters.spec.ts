import { filterWorkOrders, prazoLabel, workOrderMetrics, WorkOrderRow } from '../work-order-filters';
import { WorkOrderStatus } from '../work-order.service';

// Local wall-clock times, so the expectations hold in any timezone.
const local = (year: number, month: number, day: number, hours: number, minutes: number) =>
  new Date(year, month - 1, day, hours, minutes).toISOString();

const withStatus = (status: WorkOrderStatus, count: number) => Array.from({ length: count }, () => ({ status }));

const row = (
  id: string,
  status: WorkOrderStatus,
  vesselName: string,
  customerName: string,
  services: string[],
): WorkOrderRow => ({
  id,
  vesselId: `v-${vesselName}`,
  startDate: local(2026, 11, 17, 9, 12),
  endDate: local(2026, 11, 20, 10, 0),
  status,
  vesselName,
  customerName,
  services: services.map((name, index) => ({
    id: `${id}-s${index}`,
    name,
    startDate: local(2026, 11, 17, 9, 12),
    endDate: local(2026, 11, 20, 10, 0),
    status: 'PENDING',
  })),
});

describe('workOrderMetrics', () => {
  it('work-order-ui C5 counts 24, 08, 05, 07 and 120 over every work order', () => {
    const orders = [
      ...withStatus('IN_PROGRESS', 8),
      ...withStatus('PENDING', 5),
      ...withStatus('COMPLETED', 7),
      ...withStatus('CANCELLED', 4),
    ];

    expect(workOrderMetrics(orders)).toEqual({ total: '24', inProgress: '08', pending: '05', completed: '07' });

    const many = [
      ...withStatus('IN_PROGRESS', 30),
      ...withStatus('PENDING', 30),
      ...withStatus('COMPLETED', 30),
      ...withStatus('CANCELLED', 30),
    ];
    expect(workOrderMetrics(many).total).toBe('120');
    expect(workOrderMetrics([])).toEqual({ total: '00', inProgress: '00', pending: '00', completed: '00' });
  });
});

describe('filterWorkOrders', () => {
  const aurora = row('ab12cd34-5e6f-4a7b-8c9d-0e1f2a3b4c5d', 'IN_PROGRESS', 'Aurora', 'Pescados Atlântico', [
    'Motor',
    'Pintura do casco',
  ]);
  const auroraDone = row('99887766-5e6f-4a7b-8c9d-0e1f2a3b4c5d', 'COMPLETED', 'Aurora', 'Pescados Atlântico', []);
  const vento = row('ef56ab78-5e6f-4a7b-8c9d-0e1f2a3b4c5d', 'PENDING', 'Vento Leste', 'Cooperativa Mar Azul', [
    'Revisão elétrica',
  ]);
  const rows = [aurora, auroraDone, vento];
  const ids = (found: WorkOrderRow[]) => found.map((order) => order.id);

  it('work-order-ui C7 matches code with or without hash, vessel, customer and service names', () => {
    expect(ids(filterWorkOrders(rows, 'ALL', 'ab12cd'))).toEqual([aurora.id]);
    expect(ids(filterWorkOrders(rows, 'ALL', '#AB12CD'))).toEqual([aurora.id]);
    expect(ids(filterWorkOrders(rows, 'ALL', 'aurora'))).toEqual([aurora.id, auroraDone.id]);
    expect(ids(filterWorkOrders(rows, 'ALL', 'AURORA'))).toEqual([aurora.id, auroraDone.id]);
    expect(ids(filterWorkOrders(rows, 'ALL', 'atlântico'))).toEqual([aurora.id, auroraDone.id]);
    expect(ids(filterWorkOrders(rows, 'ALL', 'ATLÂNTICO'))).toEqual([aurora.id, auroraDone.id]);
    expect(ids(filterWorkOrders(rows, 'ALL', 'mar azul'))).toEqual([vento.id]);
    expect(ids(filterWorkOrders(rows, 'ALL', 'pintura'))).toEqual([aurora.id]);
    expect(ids(filterWorkOrders(rows, 'ALL', 'elétrica'))).toEqual([vento.id]);
    expect(ids(filterWorkOrders(rows, 'ALL', 'nada disso'))).toEqual([]);
    expect(ids(filterWorkOrders(rows, 'ALL', ''))).toEqual([aurora.id, auroraDone.id, vento.id]);

    // The search runs within the tab.
    expect(ids(filterWorkOrders(rows, 'COMPLETED', 'aurora'))).toEqual([auroraDone.id]);
    expect(ids(filterWorkOrders(rows, 'PENDING', 'aurora'))).toEqual([]);
    expect(ids(filterWorkOrders(rows, 'IN_PROGRESS', ''))).toEqual([aurora.id]);
    expect(ids(filterWorkOrders(rows, 'CANCELLED', ''))).toEqual([]);
  });
});

describe('prazoLabel', () => {
  it('work-order-ui C8 reads Hoje, Amanhã or the short date with the time', () => {
    const now = new Date(2026, 10, 17, 8, 0);

    expect(prazoLabel(local(2026, 11, 17, 14, 30), now)).toBe('Hoje, 14:30');
    expect(prazoLabel(local(2026, 11, 17, 0, 5), now)).toBe('Hoje, 00:05');
    expect(prazoLabel(local(2026, 11, 18, 9, 0), now)).toBe('Amanhã, 09:00');
    expect(prazoLabel(local(2026, 11, 20, 10, 0), now)).toBe('20 nov, 10:00');
    expect(prazoLabel(local(2026, 11, 16, 23, 59), now)).toBe('16 nov, 23:59');
    // The same day of another year is not today.
    expect(prazoLabel(local(2025, 11, 17, 14, 30), now)).toBe('17 nov, 14:30');
    // Tomorrow across the end of a month.
    expect(prazoLabel(local(2026, 12, 1, 7, 5), new Date(2026, 10, 30, 23, 0))).toBe('Amanhã, 07:05');
    expect(prazoLabel(local(2026, 12, 12, 7, 5), now)).toBe('12 dez, 07:05');
  });
});
