import { describe, expect, it } from 'vitest';

import { inMemoryWorkforce, makeAssignment } from '@test/workforce.js';
import { FetchAssignmentsUseCase } from '../fetch-assignments.use-case.js';

describe('FetchAssignmentsUseCase', () => {
  it('workforce C19 returns every assignment of the organization', async () => {
    const workforce = inMemoryWorkforce();
    workforce.assignments.items.push(
      makeAssignment(
        { organizationId: 'A', workOrderServiceId: 's1', staffId: 'rafael' },
        'a1',
      ),
      makeAssignment(
        { organizationId: 'B', workOrderServiceId: 's2' },
        'other',
      ),
      makeAssignment(
        {
          organizationId: 'A',
          workOrderServiceId: 's3',
          staffId: null,
          teamId: 'alfa',
        },
        'a3',
      ),
    );

    const { assignments } = await new FetchAssignmentsUseCase(
      workforce.assignments,
    ).handle({
      organizationId: 'A',
    });

    expect(assignments.map((item) => item.id)).toEqual(['a1', 'a3']);
    expect(assignments[1]).toMatchObject({ staffId: null, teamId: 'alfa' });
  });
});
