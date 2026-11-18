import { beforeEach, describe, expect, it } from 'vitest';

import { AlreadyExistsDomainException } from '@/package/shared/lib/exception/already-exists-domain.exception.js';
import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { inMemoryWorkforce, makeStaff, makeTeam } from '@test/workforce.js';
import { UpdateStaffUseCase } from '../update-staff.use-case.js';

let workforce: ReturnType<typeof inMemoryWorkforce>;
let sut: UpdateStaffUseCase;

describe('UpdateStaffUseCase', () => {
  beforeEach(() => {
    workforce = inMemoryWorkforce();
    sut = new UpdateStaffUseCase(workforce.staff, workforce.teams);
    workforce.staff.items.push(
      makeStaff(
        {
          organizationId: 'A',
          name: 'Rafael Mendes',
          email: 'rafael@umbriel.test',
        },
        'rafael',
      ),
      makeStaff(
        {
          organizationId: 'A',
          name: 'Camila Rocha',
          email: 'camila@umbriel.test',
        },
        'camila',
      ),
    );
  });

  it('workforce C2 keeps its own name and email', async () => {
    const { staff } = await sut.handle({
      organizationId: 'A',
      id: 'rafael',
      name: 'RAFAEL MENDES',
      specialty: 'Mecânico naval',
      email: 'Rafael@umbriel.test',
      phone: '(13) 1',
    });

    expect(staff.id).toBe('rafael');
    expect(staff.name).toBe('RAFAEL MENDES');
    expect(staff.email).toBe('rafael@umbriel.test');
  });

  it('workforce C2 refuses the email of another staff', async () => {
    const promise = sut.handle({
      organizationId: 'A',
      id: 'rafael',
      name: 'Rafael Mendes',
      specialty: 'Mecânico naval',
      email: 'CAMILA@umbriel.test',
      phone: '(13) 1',
    });

    await expect(promise).rejects.toBeInstanceOf(AlreadyExistsDomainException);
    await expect(promise).rejects.toThrow('Staff email already exists');
    expect(
      workforce.staff.items.find((item) => item.id === 'rafael')!.email,
    ).toBe('rafael@umbriel.test');
  });

  it('workforce C4 replaces every field', async () => {
    workforce.teams.items.push(makeTeam({ organizationId: 'A' }, 'team-a'));

    await sut.handle({
      organizationId: 'A',
      id: 'rafael',
      name: ' Rafael M. ',
      specialty: ' Especialista hidráulico ',
      email: ' Rafael.M@Umbriel.test ',
      phone: ' (13) 2 ',
      teamId: 'team-a',
    });

    expect(
      workforce.staff.items.find((item) => item.id === 'rafael'),
    ).toMatchObject({
      name: 'Rafael M.',
      specialty: 'Especialista hidráulico',
      email: 'rafael.m@umbriel.test',
      phone: '(13) 2',
      teamId: 'team-a',
    });

    const missing = sut.handle({
      organizationId: 'B',
      id: 'rafael',
      name: 'x',
      specialty: 'x',
      email: 'x@x.test',
      phone: '1',
    });
    await expect(missing).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(missing).rejects.toThrow('Staff not found');
  });
});
