import { agendaItems } from '../../../work-order/agenda/agenda-week';
import { local } from '../../../work-order/work-order/__test__/work-order-list.harness';
import { WorkOrder, WorkOrderStatus } from '../../../work-order/work-order/work-order.service';
import { servicesInProgress } from '../../../workforce/staff/staff-status';
import { Assignment, TeamListItem } from '../../../workforce/staff/staff.service';
import {
  agendaLine,
  dashboardCounts,
  dateKicker,
  firstName,
  greeting,
  mobilizedLabel,
  mobilizedTeams,
  openOrders,
  periodItems,
  responsavelOf,
  teamFooter,
  teamRows,
} from '../dashboard-summary';

const at = (year: number, month: number, day: number, hours: number, minutes: number) =>
  new Date(year, month - 1, day, hours, minutes);

const assignment = (workOrderServiceId: string, who: { staffId?: string; teamId?: string }): Assignment => ({
  id: `a-${workOrderServiceId}`,
  workOrderId: 'wo',
  workOrderServiceId,
  staffId: who.staffId ?? null,
  teamId: who.teamId ?? null,
});

const order = (
  id: string,
  status: WorkOrderStatus,
  endDate: string,
  services: WorkOrder['services'] = [],
  startDate = endDate,
): WorkOrder => ({ id, vesselId: 'v-aur', startDate, endDate, status, services });

const service = (id: string, name: string, startDate: string, status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' = 'PENDING') => ({
  id,
  name,
  startDate,
  endDate: startDate,
  status,
});

describe('greeting', () => {
  it('dashboard C2 greets by the hour with the sun or the moon', () => {
    const cases: [number, number, string, string][] = [
      [5, 0, 'Bom dia', 'sun'],
      [11, 59, 'Bom dia', 'sun'],
      [12, 0, 'Boa tarde', 'sun'],
      [17, 59, 'Boa tarde', 'sun'],
      [18, 0, 'Boa noite', 'moon'],
      [23, 59, 'Boa noite', 'moon'],
      [0, 0, 'Boa noite', 'moon'],
      [4, 59, 'Boa noite', 'moon'],
    ];
    for (const [hours, minutes, text, icon] of cases) {
      expect(greeting(at(2026, 11, 17, hours, minutes)), `${hours}:${minutes}`).toEqual({ text, icon });
    }
  });
});

describe('firstName', () => {
  it('dashboard C2 takes the first word of the name', () => {
    expect(firstName('Ana Maria Souza')).toBe('Ana');
    expect(firstName('  Lucas   Costa ')).toBe('Lucas');
    expect(firstName('Lucas')).toBe('Lucas');
    expect(firstName(null)).toBe('');
  });
});

describe('dateKicker', () => {
  it('dashboard C2 writes today in pt-BR upper-case', () => {
    expect(dateKicker(at(2026, 11, 17, 12, 0))).toBe('TERÇA-FEIRA, 17 DE NOVEMBRO DE 2026');
    expect(dateKicker(at(2026, 11, 18, 0, 0))).toBe('QUARTA-FEIRA, 18 DE NOVEMBRO DE 2026');
    expect(dateKicker(at(2026, 3, 1, 23, 59))).toBe('DOMINGO, 1 DE MARÇO DE 2026');
  });
});

describe('dashboardCounts', () => {
  it('dashboard C3 counts open, in progress, pending and completed this month', () => {
    const now = at(2026, 11, 17, 12, 0);
    const fleet = [
      order('p1', 'PENDING', local(2026, 11, 20, 10, 0)),
      order('p2', 'PENDING', local(2026, 12, 2, 10, 0)),
      order('p3', 'PENDING', local(2026, 10, 1, 10, 0)),
      order('i1', 'IN_PROGRESS', local(2026, 11, 18, 10, 0)),
      order('i2', 'IN_PROGRESS', local(2025, 11, 18, 10, 0)),
      order('x1', 'CANCELLED', local(2026, 11, 10, 10, 0)),
      order('c1', 'COMPLETED', local(2026, 11, 3, 10, 0)),
      order('c2', 'COMPLETED', local(2026, 10, 31, 23, 59)),
    ];
    expect(dashboardCounts(fleet, now)).toEqual({
      open: '05',
      inProgress: '02',
      pending: '03',
      completedThisMonth: '01',
    });

    // The month's edges, and the same month of another year.
    const edges = [
      order('first', 'COMPLETED', local(2026, 11, 1, 0, 0)),
      order('last', 'COMPLETED', local(2026, 11, 30, 23, 59)),
      order('next', 'COMPLETED', local(2026, 12, 1, 0, 0)),
      order('year', 'COMPLETED', local(2025, 11, 15, 12, 0)),
    ];
    expect(dashboardCounts(edges, now).completedThisMonth).toBe('02');

    expect(dashboardCounts([], now)).toEqual({ open: '00', inProgress: '00', pending: '00', completedThisMonth: '00' });
  });
});

describe('mobilizedTeams', () => {
  it('dashboard C4 counts the teams em serviço only', () => {
    const teams = [{ id: 'alfa' }, { id: 'bravo' }, { id: 'charlie' }, { id: 'delta' }];
    const fleet = [
      order('w1', 'IN_PROGRESS', local(2026, 11, 20, 10, 0), [
        service('s1', 'Motor', local(2026, 11, 17, 8, 0), 'IN_PROGRESS'),
        service('s2', 'Casco', local(2026, 11, 17, 8, 0), 'PENDING'),
        service('s4', 'Hélice', local(2026, 11, 17, 8, 0), 'IN_PROGRESS'),
      ]),
      order('w2', 'CANCELLED', local(2026, 11, 20, 10, 0), [
        service('s3', 'Leme', local(2026, 11, 17, 8, 0), 'IN_PROGRESS'),
      ]),
    ];
    const assignments = [
      assignment('s1', { teamId: 'alfa' }),
      assignment('s2', { teamId: 'bravo' }),
      assignment('s3', { teamId: 'charlie' }),
      // A Staff of Bravo on a service in progress: its own Assignment, not its Team's.
      assignment('s4', { staffId: 'joao' }),
    ];
    const count = mobilizedTeams(teams, assignments, servicesInProgress(fleet));
    expect(count).toBe(1);
    expect(mobilizedLabel(count)).toBe('1 equipe mobilizada');

    expect(mobilizedTeams(teams, [], servicesInProgress(fleet))).toBe(0);
    expect(mobilizedLabel(0)).toBe('0 equipes mobilizadas');
    expect(mobilizedLabel(3)).toBe('3 equipes mobilizadas');
  });
});

describe('periodItems', () => {
  // #AB12CD34 docks Monday 16 at 08:00, undocks Friday 20 at 17:00; "Pintura do casco" starts Wednesday 18 at 10:30.
  const pintura = service('s-pintura', 'Pintura do casco', local(2026, 11, 18, 10, 30));
  const vistoria = service('s-vistoria', 'Vistoria', local(2026, 11, 18, 8, 30));
  const workOrder = order(
    'ab12cd34-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
    'IN_PROGRESS',
    local(2026, 11, 20, 17, 0),
    [pintura, vistoria],
    local(2026, 11, 16, 8, 0),
  );
  const names = new Map([['v-aur', 'Aurora']]);
  const wednesday = at(2026, 11, 18, 12, 0);
  const view = (days: ReturnType<typeof periodItems>) =>
    days.map((day) => [day.weekday, day.day, day.items.map((item) => [item.time, item.vesselName, item.kind, item.line])]);

  it('dashboard C5 groups the items of the period by day with only the days that have items', () => {
    const responsavel = (serviceId: string) => (serviceId === pintura.id ? 'Equipe Alfa' : null);

    expect(view(periodItems(agendaItems([workOrder], names), 'WEEK', wednesday, responsavel))).toEqual([
      ['SEG', '16', [['08:00', 'Aurora', 'DOCKING', 'Docagem · #AB12CD34']]],
      [
        'QUA',
        '18',
        [
          ['08:30', 'Aurora', 'SERVICE', 'Vistoria · #AB12CD34'],
          ['10:30', 'Aurora', 'SERVICE', 'Pintura do casco · Equipe Alfa'],
        ],
      ],
      ['SEX', '20', [['17:00', 'Aurora', 'UNDOCKING', 'Desdocagem · #AB12CD34']]],
    ]);

    // With no Responsável the service ends with the code.
    expect(view(periodItems(agendaItems([workOrder], names), 'WEEK', wednesday))[1]).toEqual([
      'QUA',
      '18',
      [
        ['08:30', 'Aurora', 'SERVICE', 'Vistoria · #AB12CD34'],
        ['10:30', 'Aurora', 'SERVICE', 'Pintura do casco · #AB12CD34'],
      ],
    ]);

    // Nothing of a CANCELLED WorkOrder.
    expect(periodItems(agendaItems([{ ...workOrder, status: 'CANCELLED' }], names), 'WEEK', wednesday)).toEqual([]);
  });

  it('dashboard C6 keeps monday to sunday for the week and today for hoje', () => {
    const items = agendaItems(
      [
        order('00000001-0000-4000-8000-000000000000', 'PENDING', local(2026, 11, 22, 23, 0), [], local(2026, 11, 15, 23, 59)),
        order('00000002-0000-4000-8000-000000000000', 'PENDING', local(2026, 11, 23, 0, 0), [], local(2026, 11, 16, 0, 0)),
        order('00000003-0000-4000-8000-000000000000', 'PENDING', local(2026, 11, 18, 23, 59), [], local(2026, 11, 18, 0, 0)),
        order('00000004-0000-4000-8000-000000000000', 'PENDING', local(2026, 11, 19, 0, 0), [], local(2026, 11, 17, 23, 59)),
      ],
      names,
    );
    const lines = (period: 'WEEK' | 'TODAY') =>
      periodItems(items, period, wednesday).flatMap((day) => day.items.map((item) => `${day.weekday} ${item.time} ${item.line}`));

    expect(lines('WEEK')).toEqual([
      'SEG 00:00 Docagem · #00000002',
      'TER 23:59 Docagem · #00000004',
      'QUA 00:00 Docagem · #00000003',
      'QUA 23:59 Desdocagem · #00000003',
      'QUI 00:00 Desdocagem · #00000004',
      'DOM 23:00 Desdocagem · #00000001',
    ]);
    // Sunday 15 at 23:59 and Monday 23 at 00:00 fall outside the week.
    expect(lines('WEEK')).not.toContain('DOM 23:59 Docagem · #00000001');
    expect(lines('WEEK')).not.toContain('SEG 00:00 Desdocagem · #00000002');
    expect(lines('TODAY')).toEqual(['QUA 00:00 Docagem · #00000003', 'QUA 23:59 Desdocagem · #00000003']);
  });
});

describe('agendaLine', () => {
  it('dashboard C5 ends a service with its responsável or the code', () => {
    const item = { kind: 'SERVICE' as const, title: 'Pintura do casco', code: '#AB12CD34' };
    expect(agendaLine(item, 'Rafael Mendes')).toBe('Pintura do casco · Rafael Mendes');
    expect(agendaLine(item, 'Equipe Alfa')).toBe('Pintura do casco · Equipe Alfa');
    expect(agendaLine(item, null)).toBe('Pintura do casco · #AB12CD34');
    // A Docagem or a Desdocagem always ends with the code.
    expect(agendaLine({ kind: 'DOCKING', title: 'Docagem', code: '#AB12CD34' }, 'Equipe Alfa')).toBe('Docagem · #AB12CD34');
    expect(agendaLine({ kind: 'UNDOCKING', title: 'Desdocagem', code: '#AB12CD34' }, null)).toBe('Desdocagem · #AB12CD34');
  });
});

describe('teamRows', () => {
  it('dashboard C10 lists every team by name with specialty, count and status', () => {
    const teams: TeamListItem[] = [
      { id: 'charlie', name: 'Charlie', specialty: 'Elétrica', staffCount: 1 },
      { id: 'bravo', name: 'Bravo', specialty: 'Hidráulica', staffCount: 0 },
      { id: 'alfa', name: 'Alfa', specialty: 'Motor', staffCount: 2 },
      { id: 'agil', name: 'Ágil', specialty: 'Pintura', staffCount: 3 },
    ];
    const fleet = [
      order('w1', 'IN_PROGRESS', local(2026, 11, 20, 10, 0), [service('s1', 'Motor', local(2026, 11, 17, 8, 0), 'IN_PROGRESS')]),
    ];
    const rows = teamRows(teams, [assignment('s1', { teamId: 'alfa' })], servicesInProgress(fleet));

    expect(rows.map((row) => [row.name, row.line, row.status, row.tone])).toEqual([
      ['Equipe Ágil', 'Pintura · 3 técnicos', 'Disponível', 0],
      ['Equipe Alfa', 'Motor · 2 técnicos', 'Em serviço', 1],
      ['Equipe Bravo', 'Hidráulica · 0 técnicos', 'Disponível', 2],
      ['Equipe Charlie', 'Elétrica · 1 técnico', 'Disponível', 0],
    ]);
    expect(teamRows([], [], new Set())).toEqual([]);
  });
});

describe('teamFooter', () => {
  it('dashboard C11 counts every staff and shows two initials and the rest', () => {
    const names = ['Rafael Mendes', 'Wagner Dias', 'Joana Prado', 'Tiago Costa', 'Sofia Lima', 'Vera Nunes', 'Rodrigo Alves'];
    const people = (count: number) => names.slice(0, count).map((name) => ({ name }));

    expect(teamFooter(people(7))).toEqual({ label: '7 técnicos ativos', initials: ['JP', 'RM'], more: '+5' });
    expect(teamFooter(people(3))).toEqual({ label: '3 técnicos ativos', initials: ['JP', 'RM'], more: '+1' });
    expect(teamFooter(people(2))).toEqual({ label: '2 técnicos ativos', initials: ['RM', 'WD'], more: null });
    expect(teamFooter(people(1))).toEqual({ label: '1 técnico ativo', initials: ['RM'], more: null });
    expect(teamFooter([])).toEqual({ label: '0 técnicos ativos', initials: [], more: null });
  });
});

describe('openOrders', () => {
  it('dashboard C14 keeps the open orders nearest desdocagem first', () => {
    const rows = [
      order('cc000000-0', 'PENDING', local(2026, 11, 20, 10, 0)),
      order('dd000000-0', 'COMPLETED', local(2026, 11, 1, 10, 0)),
      order('bb000000-0', 'IN_PROGRESS', local(2026, 11, 18, 9, 0)),
      order('ee000000-0', 'CANCELLED', local(2026, 11, 2, 10, 0)),
      order('aa000000-0', 'PENDING', local(2026, 11, 20, 10, 0)),
      order('ff000000-0', 'IN_PROGRESS', local(2026, 11, 17, 14, 30)),
    ];

    // The nearest Desdocagem first; the same Desdocagem by code; COMPLETED and CANCELLED left out.
    expect(openOrders(rows).map((row) => row.id)).toEqual(['ff000000-0', 'bb000000-0', 'aa000000-0', 'cc000000-0']);
    expect(openOrders([])).toEqual([]);
  });
});

describe('responsavelOf', () => {
  it('dashboard C16 names the responsável of the first service', () => {
    const staffNames = new Map([['rafael', 'Rafael Mendes']]);
    const teamNames = new Map([['alfa', 'Alfa']]);
    const services = [
      service('s1', 'Motor', local(2026, 11, 17, 8, 0)),
      service('s2', 'Pintura', local(2026, 11, 17, 8, 0)),
    ];
    const of = (byService: Map<string, Assignment>, list = services) =>
      responsavelOf({ services: list }, byService, staffNames, teamNames);

    expect(of(new Map([['s1', assignment('s1', { staffId: 'rafael' })]]))).toEqual({ name: 'Rafael Mendes', initials: 'RM' });
    expect(of(new Map([['s1', assignment('s1', { teamId: 'alfa' })]]))).toEqual({ name: 'Equipe Alfa', initials: 'A' });
    // Only the second service has one: the first service's is what the row shows.
    expect(of(new Map([['s2', assignment('s2', { staffId: 'rafael' })]]))).toBeNull();
    expect(of(new Map(), [])).toBeNull();
    expect(of(new Map())).toBeNull();
  });
});
