import { describe, expect, it } from 'vitest';

import { AlreadyExistsDomainException } from '@/package/shared/lib/exception/already-exists-domain.exception.js';
import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { inMemoryWorkforce, makeTeam } from '@test/workforce.js';
import { UpdateTeamUseCase } from '../update-team.use-case.js';

describe('UpdateTeamUseCase', () => {
  it('workforce C6 replaces the team and refuses another team name', async () => {
    const workforce = inMemoryWorkforce();
    workforce.teams.items.push(
      makeTeam({ organizationId: 'A', name: 'Equipe Alfa' }, 'alfa'),
      makeTeam({ organizationId: 'A', name: 'Equipe Bravo' }, 'bravo'),
    );
    const sut = new UpdateTeamUseCase(workforce.teams);

    const { team } = await sut.handle({
      organizationId: 'A',
      id: 'alfa',
      name: ' equipe alfa ',
      specialty: ' Elétrica ',
    });
    expect(team).toMatchObject({
      id: 'alfa',
      name: 'equipe alfa',
      specialty: 'Elétrica',
    });

    const taken = sut.handle({
      organizationId: 'A',
      id: 'alfa',
      name: 'EQUIPE BRAVO',
      specialty: 'x',
    });
    await expect(taken).rejects.toBeInstanceOf(AlreadyExistsDomainException);
    await expect(taken).rejects.toThrow('Team name already exists');

    const other = sut.handle({
      organizationId: 'B',
      id: 'alfa',
      name: 'x',
      specialty: 'x',
    });
    await expect(other).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(other).rejects.toThrow('Team not found');
  });
});
