import { describe, expect, it } from 'vitest';

import { inMemoryWorkforce, makeStaff, makeTeam } from '@test/workforce.js';
import { FetchTeamsUseCase } from '../fetch-teams.use-case.js';

describe('FetchTeamsUseCase', () => {
  it('workforce C6 returns the teams by name with their staff count', async () => {
    const workforce = inMemoryWorkforce();
    workforce.teams.items.push(
      makeTeam({ organizationId: 'A', name: 'Equipe Charlie' }, 'charlie'),
      makeTeam({ organizationId: 'B', name: 'Equipe Alfa' }, 'other'),
      makeTeam({ organizationId: 'A', name: 'Equipe Bravo' }, 'bravo'),
    );
    workforce.staff.items.push(
      makeStaff({
        organizationId: 'A',
        name: 'a',
        email: 'a@x.test',
        teamId: 'bravo',
      }),
      makeStaff({
        organizationId: 'A',
        name: 'b',
        email: 'b@x.test',
        teamId: 'bravo',
      }),
      makeStaff({
        organizationId: 'A',
        name: 'c',
        email: 'c@x.test',
        teamId: null,
      }),
    );

    const { teams } = await new FetchTeamsUseCase(workforce.teams).handle({
      organizationId: 'A',
    });

    expect(teams.map(({ team, staffCount }) => [team.id, staffCount])).toEqual([
      ['bravo', 2],
      ['charlie', 0],
    ]);
  });
});
