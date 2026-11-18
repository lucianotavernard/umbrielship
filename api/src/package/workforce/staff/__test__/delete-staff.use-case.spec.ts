import { beforeEach, describe, expect, it } from 'vitest';

import { ConflictDomainException } from '@/package/shared/lib/exception/conflict-domain.exception.js';
import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import {
  inMemoryWorkforce,
  makeAssignment,
  makeStaff,
} from '@test/workforce.js';
import { DeleteStaffUseCase } from '../delete-staff.use-case.js';

let workforce: ReturnType<typeof inMemoryWorkforce>;
let sut: DeleteStaffUseCase;

describe('DeleteStaffUseCase', () => {
  beforeEach(() => {
    workforce = inMemoryWorkforce();
    sut = new DeleteStaffUseCase(workforce.staff, workforce.assignments);
    workforce.staff.items.push(makeStaff({ organizationId: 'A' }, 'rafael'));
  });

  it('workforce C5 removes a staff with no assignment', async () => {
    workforce.assignments.items.push(
      makeAssignment({ organizationId: 'A', staffId: 'someone-else' }),
    );

    await sut.handle({ organizationId: 'A', id: 'rafael' });

    expect(workforce.staff.items).toHaveLength(0);

    const missing = sut.handle({ organizationId: 'A', id: 'rafael' });
    await expect(missing).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(missing).rejects.toThrow('Staff not found');
  });

  it('workforce C5 refuses a staff an assignment names', async () => {
    workforce.assignments.items.push(
      makeAssignment({ organizationId: 'A', staffId: 'rafael' }),
    );

    const promise = sut.handle({ organizationId: 'A', id: 'rafael' });

    await expect(promise).rejects.toBeInstanceOf(ConflictDomainException);
    await expect(promise).rejects.toThrow('Staff has Assignment');
    expect(workforce.staff.items).toHaveLength(1);
  });
});
