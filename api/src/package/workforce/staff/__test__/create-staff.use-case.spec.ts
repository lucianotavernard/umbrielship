import { beforeEach, describe, expect, it } from 'vitest';

import { AlreadyExistsDomainException } from '@/package/shared/lib/exception/already-exists-domain.exception.js';
import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { inMemoryWorkforce, makeStaff, makeTeam } from '@test/workforce.js';
import { CreateStaffUseCase } from '../create-staff.use-case.js';

let workforce: ReturnType<typeof inMemoryWorkforce>;
let sut: CreateStaffUseCase;

const body = {
  organizationId: 'A',
  name: 'Camila Rocha',
  specialty: 'Técnica elétrica',
  email: 'camila.rocha@mareos.test',
  phone: '(13) 99712-3088',
};

describe('CreateStaffUseCase', () => {
  beforeEach(() => {
    workforce = inMemoryWorkforce();
    sut = new CreateStaffUseCase(workforce.staff, workforce.teams);
  });

  it('workforce C1 stores a staff trimmed with the email lower-cased and no team', async () => {
    const { staff } = await sut.handle({
      organizationId: 'A',
      name: '  Camila Rocha ',
      specialty: ' Técnica elétrica  ',
      email: '  Camila.Rocha@Mareos.TEST ',
      phone: ' (13) 99712-3088 ',
    });

    expect(workforce.staff.items).toEqual([staff]);
    expect(staff).toMatchObject({
      organizationId: 'A',
      name: 'Camila Rocha',
      specialty: 'Técnica elétrica',
      email: 'camila.rocha@mareos.test',
      phone: '(13) 99712-3088',
      teamId: null,
    });
  });

  it('workforce C1 stores the team of the organization', async () => {
    workforce.teams.items.push(makeTeam({ organizationId: 'A' }, 'team-a'));

    const { staff } = await sut.handle({ ...body, teamId: 'team-a' });

    expect(staff.teamId).toBe('team-a');
    expect(workforce.staff.items[0].teamId).toBe('team-a');
  });

  it('workforce C2 refuses a name used in the organization in another case', async () => {
    workforce.staff.items.push(
      makeStaff({
        organizationId: 'A',
        name: 'Rafael Mendes',
        email: 'r@x.test',
      }),
    );

    const promise = sut.handle({ ...body, name: ' rafael mendes' });

    await expect(promise).rejects.toBeInstanceOf(AlreadyExistsDomainException);
    await expect(promise).rejects.toThrow('Staff name already exists');
    expect(workforce.staff.items).toHaveLength(1);
  });

  it('workforce C2 refuses an email used in the organization in another case', async () => {
    workforce.staff.items.push(
      makeStaff({
        organizationId: 'A',
        name: 'Outro',
        email: 'camila.rocha@mareos.test',
      }),
    );

    const promise = sut.handle({ ...body, email: 'CAMILA.ROCHA@mareos.test' });

    await expect(promise).rejects.toBeInstanceOf(AlreadyExistsDomainException);
    await expect(promise).rejects.toThrow('Staff email already exists');
    expect(workforce.staff.items).toHaveLength(1);
  });

  it('workforce C2 accepts the same name in another organization', async () => {
    workforce.staff.items.push(
      makeStaff({
        organizationId: 'B',
        name: 'Camila Rocha',
        email: 'camila.rocha@mareos.test',
      }),
    );

    const { staff } = await sut.handle(body);

    expect(staff.organizationId).toBe('A');
    expect(workforce.staff.items).toHaveLength(2);
  });

  it('workforce C2 answers team not found for a team of another organization', async () => {
    workforce.teams.items.push(makeTeam({ organizationId: 'B' }, 'team-b'));

    const promise = sut.handle({ ...body, teamId: 'team-b' });

    await expect(promise).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(promise).rejects.toThrow('Team not found');
    expect(workforce.staff.items).toHaveLength(0);
  });
});
