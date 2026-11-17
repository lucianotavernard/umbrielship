import type { WorkOrder } from '../../work-order/work-order.service';
import { agendaItems, rangeLabel, rowOf, weekDays, weekLabel } from '../agenda-week';

// Local times, as the browser reads them.
const at = (day: number, hours: number, minutes = 0) =>
  new Date(2026, 10, day, hours, minutes).toISOString();

const order = (
  id: string,
  vesselId: string,
  status: WorkOrder['status'],
  start: string,
  end: string,
  services: WorkOrder['services'] = [],
): WorkOrder => ({
  id,
  vesselId,
  startDate: start,
  endDate: end,
  status,
  services,
});

const service = (id: string, name: string, start: string): WorkOrder['services'][number] => ({
  id,
  name,
  startDate: start,
  endDate: start,
  status: 'PENDING',
});

describe('agendaItems', () => {
  it('work-order-ui C59 places services and dockings, clamps the rows and hides cancelled orders', () => {
    const vesselNames = new Map([
      ['v1', 'Aurora'],
      ['v2', 'Cassiopeia'],
    ]);
    const items = agendaItems(
      [
        // Docagem Mon 16 at 06:00, Desdocagem Sat 21 at 21:00, a service Tue 17 at 09:30.
        order('ab12cd34-1111-4111-8111-111111111111', 'v1', 'IN_PROGRESS', at(16, 6), at(21, 21), [
          service('svc-1', 'Pintura do casco', at(17, 9, 30)),
        ]),
        order('cc00cc00-3333-4333-8333-333333333333', 'v2', 'CANCELLED', at(19, 10), at(19, 16), [
          service('svc-9', 'Lixamento', at(19, 12)),
        ]),
      ],
      vesselNames,
    );

    expect(
      items.map((item) => [
        item.kind,
        item.title,
        item.at.getDate(),
        item.at.getDay(),
        item.time,
        rowOf(item.at),
        item.vesselName,
        item.code,
      ]),
    ).toEqual([
      ['DOCKING', 'Docagem', 16, 1, '06:00', 0, 'Aurora', '#AB12CD34'],
      ['SERVICE', 'Pintura do casco', 17, 2, '09:30', 0, 'Aurora', '#AB12CD34'],
      ['UNDOCKING', 'Desdocagem', 21, 6, '21:00', 5, 'Aurora', '#AB12CD34'],
    ]);

    // Rows of two hours from 08:00: before 08:00 in "08:00", from 18:00 in "18:00".
    const row = (hours: number, minutes = 0) => rowOf(new Date(2026, 10, 18, hours, minutes));
    expect([
      row(0),
      row(7, 59),
      row(8),
      row(9, 59),
      row(10),
      row(13),
      row(16),
      row(17, 59),
      row(18),
      row(23, 59),
    ]).toEqual([0, 0, 0, 0, 1, 2, 4, 4, 5, 5]);
  });
});

describe('weekLabel', () => {
  it('work-order-ui C61 reads one month or the cross month range', () => {
    // Wednesday 18 Nov 2026: the week is Monday 16 to Sunday 22.
    const november = weekDays(new Date(2026, 10, 18, 10));
    expect(november.map((day) => day.getDate())).toEqual([16, 17, 18, 19, 20, 21, 22]);
    expect(weekLabel(november)).toBe('Novembro 2026');
    expect(rangeLabel(november)).toBe('16 de nov — 22 de nov');

    // A Monday and a Sunday belong to their own week.
    expect(weekDays(new Date(2026, 10, 16))[0].getDate()).toBe(16);
    expect(weekDays(new Date(2026, 10, 22))[0].getDate()).toBe(16);

    // The mareos `shortDate`: two-digit day, "de" and the short month (AD-049).
    const across = weekDays(new Date(2026, 10, 30));
    expect(weekLabel(across)).toBe('30 de nov — 06 de dez, 2026');
    expect(rangeLabel(across)).toBe('30 de nov — 06 de dez');
    const early = weekDays(new Date(2026, 10, 9));
    expect(weekLabel(early)).toBe('Novembro 2026');
    expect(rangeLabel(early)).toBe('09 de nov — 15 de nov');
    // Across the year end the label carries the year of the Sunday.
    expect(weekLabel(weekDays(new Date(2026, 11, 28)))).toBe('28 de dez — 03 de jan, 2027');
  });
});
