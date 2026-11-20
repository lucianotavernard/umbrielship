import { describe, expect, it } from 'vitest';

import { inMemoryWorkforce, makeStaff, makeTeam } from '@test/workforce.js';

describe('WorkforceFacade', () => {
  it('organization-list C9 has no records for an Organization with no Staff and no Team', async () => {
    const { staff, teams, facade } = inMemoryWorkforce();
    staff.items.push(makeStaff({ organizationId: 'B' }));
    teams.items.push(makeTeam({ organizationId: 'B' }));

    expect(await facade.hasRecords('A')).toBe(false);
  });

  it('organization-list C9 has records for a Staff or a Team of the Organization', async () => {
    const { staff, teams, facade } = inMemoryWorkforce();
    staff.items.push(makeStaff({ organizationId: 'A' }));
    expect(await facade.hasRecords('A')).toBe(true);

    staff.items = [];
    teams.items.push(makeTeam({ organizationId: 'A' }));
    expect(await facade.hasRecords('A')).toBe(true);
  });
});
