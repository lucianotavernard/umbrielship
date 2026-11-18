import { servicesInProgress, staffStatus, teamStatus } from '../staff-status';
import { Assignment } from '../staff.service';

const assignment = (overrides: Partial<Assignment>): Assignment => ({
  id: 'a',
  workOrderId: 'wo1',
  workOrderServiceId: 's1',
  staffId: null,
  teamId: null,
  ...overrides,
});

const service = (id: string, status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED') => ({
  id,
  name: id,
  startDate: '2026-11-17T09:00:00.000Z',
  endDate: '2026-11-18T09:00:00.000Z',
  status,
});

describe('staffStatus', () => {
  it('workforce C29 derives em serviço from its own or its team\'s service in progress', () => {
    const rafael = { id: 'rafael', teamId: 'alfa' };
    const pedro = { id: 'pedro', teamId: null };

    // Its own Assignment on a PENDING service.
    let progress = servicesInProgress([{ services: [service('s1', 'PENDING')] }]);
    expect(staffStatus(rafael, [assignment({ staffId: 'rafael' })], progress)).toBe('Disponível');

    // Its Team responsible for an IN_PROGRESS service.
    progress = servicesInProgress([{ services: [service('s1', 'PENDING'), service('s2', 'IN_PROGRESS')] }]);
    const teamOn = [assignment({ workOrderServiceId: 's2', teamId: 'alfa' })];
    expect(staffStatus(rafael, teamOn, progress)).toBe('Em serviço');

    // That service turned COMPLETED.
    progress = servicesInProgress([{ services: [service('s2', 'COMPLETED')] }]);
    expect(staffStatus(rafael, teamOn, progress)).toBe('Disponível');

    // No Team and no Assignment.
    progress = servicesInProgress([{ services: [service('s2', 'IN_PROGRESS')] }]);
    expect(staffStatus(pedro, teamOn, progress)).toBe('Disponível');

    // Its own Assignment on an IN_PROGRESS service, and another's does not count.
    expect(staffStatus(pedro, [assignment({ workOrderServiceId: 's2', staffId: 'pedro' })], progress)).toBe('Em serviço');
    expect(staffStatus(pedro, [assignment({ workOrderServiceId: 's2', staffId: 'rafael' })], progress)).toBe('Disponível');
  });
});

describe('teamStatus', () => {
  it('workforce C30 derives em serviço from its own service in progress only', () => {
    const progress = servicesInProgress([{ services: [service('s1', 'IN_PROGRESS'), service('s2', 'PENDING')] }]);

    expect(teamStatus('alfa', [assignment({ workOrderServiceId: 's1', teamId: 'alfa' })], progress)).toBe('Em serviço');
    expect(teamStatus('alfa', [assignment({ workOrderServiceId: 's2', teamId: 'alfa' })], progress)).toBe('Disponível');
    // A member's own Assignment on a service in progress does not count.
    expect(teamStatus('alfa', [assignment({ workOrderServiceId: 's1', staffId: 'rafael' })], progress)).toBe('Disponível');
    expect(teamStatus('alfa', [], progress)).toBe('Disponível');
  });
});
