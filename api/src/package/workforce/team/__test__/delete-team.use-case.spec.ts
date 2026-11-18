import { beforeEach, describe, expect, it } from 'vitest';

import { ConflictDomainException } from '@/package/shared/lib/exception/conflict-domain.exception.js';
import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import {
  inMemoryWorkforce,
  makeAssignment,
  makeStaff,
  makeTeam,
} from '@test/workforce.js';
import { DeleteTeamUseCase } from '../delete-team.use-case.js';

let workforce: ReturnType<typeof inMemoryWorkforce>;
let sut: DeleteTeamUseCase;

describe('DeleteTeamUseCase', () => {
  beforeEach(() => {
    workforce = inMemoryWorkforce();
    sut = new DeleteTeamUseCase(workforce.teams, workforce.assignments);
    workforce.teams.items.push(makeTeam({ organizationId: 'A' }, 'alfa'));
    workforce.staff.items.push(
      makeStaff(
        {
          organizationId: 'A',
          name: 'Rafael',
          email: 'r@x.test',
          teamId: 'alfa',
        },
        'rafael',
      ),
      makeStaff(
        {
          organizationId: 'A',
          name: 'Camila',
          email: 'c@x.test',
          teamId: 'alfa',
        },
        'camila',
      ),
    );
  });

  it('workforce C7 removes a team with no assignment', async () => {
    await sut.handle({ organizationId: 'A', id: 'alfa' });

    expect(workforce.teams.items).toHaveLength(0);
    expect(workforce.staff.items.map((member) => member.teamId)).toEqual([
      null,
      null,
    ]);

    const missing = sut.handle({ organizationId: 'A', id: 'alfa' });
    await expect(missing).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(missing).rejects.toThrow('Team not found');
  });

  it('workforce C7 refuses a team an assignment names', async () => {
    workforce.assignments.items.push(
      makeAssignment({ organizationId: 'A', staffId: null, teamId: 'alfa' }),
    );

    const promise = sut.handle({ organizationId: 'A', id: 'alfa' });

    await expect(promise).rejects.toBeInstanceOf(ConflictDomainException);
    await expect(promise).rejects.toThrow('Team has Assignment');
    expect(workforce.teams.items).toHaveLength(1);
    expect(workforce.staff.items.map((member) => member.teamId)).toEqual([
      'alfa',
      'alfa',
    ]);
  });
});
