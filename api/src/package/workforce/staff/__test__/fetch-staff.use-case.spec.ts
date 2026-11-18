import { describe, expect, it } from 'vitest';

import { inMemoryWorkforce, makeStaff } from '@test/workforce.js';
import { FetchStaffUseCase } from '../fetch-staff.use-case.js';

describe('FetchStaffUseCase', () => {
  it('workforce C3 returns the staff of the organization by name', async () => {
    const workforce = inMemoryWorkforce();
    workforce.staff.items.push(
      makeStaff(
        { organizationId: 'A', name: 'Pedro Nascimento', email: 'p@x.test' },
        'p',
      ),
      makeStaff(
        { organizationId: 'B', name: 'Ana Souza', email: 'a@x.test' },
        'other',
      ),
      makeStaff(
        { organizationId: 'A', name: 'Bianca Costa', email: 'b@x.test' },
        'b',
      ),
    );

    const { staff } = await new FetchStaffUseCase(workforce.staff).handle({
      organizationId: 'A',
    });

    expect(staff.map((item) => item.id)).toEqual(['b', 'p']);
  });
});
