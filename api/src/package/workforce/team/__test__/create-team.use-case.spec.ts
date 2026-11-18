import { beforeEach, describe, expect, it } from 'vitest';

import { AlreadyExistsDomainException } from '@/package/shared/lib/exception/already-exists-domain.exception.js';

import { inMemoryWorkforce, makeTeam } from '@test/workforce.js';
import { CreateTeamUseCase } from '../create-team.use-case.js';

let workforce: ReturnType<typeof inMemoryWorkforce>;
let sut: CreateTeamUseCase;

describe('CreateTeamUseCase', () => {
  beforeEach(() => {
    workforce = inMemoryWorkforce();
    sut = new CreateTeamUseCase(workforce.teams);
  });

  it('workforce C6 stores a team trimmed', async () => {
    const { team } = await sut.handle({
      organizationId: 'A',
      name: '  Equipe Bravo ',
      specialty: ' Hidráulica ',
    });

    expect(workforce.teams.items).toEqual([team]);
    expect(team).toMatchObject({
      organizationId: 'A',
      name: 'Equipe Bravo',
      specialty: 'Hidráulica',
    });
  });

  it('workforce C6 refuses a name used in the organization in another case', async () => {
    workforce.teams.items.push(
      makeTeam({ organizationId: 'A', name: 'Equipe Alfa' }),
    );
    workforce.teams.items.push(
      makeTeam({ organizationId: 'B', name: 'Equipe Bravo' }),
    );

    const promise = sut.handle({
      organizationId: 'A',
      name: 'EQUIPE ALFA',
      specialty: 'Motor',
    });

    await expect(promise).rejects.toBeInstanceOf(AlreadyExistsDomainException);
    await expect(promise).rejects.toThrow('Team name already exists');

    await sut.handle({
      organizationId: 'A',
      name: 'Equipe Bravo',
      specialty: 'Motor',
    });
    expect(workforce.teams.items).toHaveLength(3);
  });
});
