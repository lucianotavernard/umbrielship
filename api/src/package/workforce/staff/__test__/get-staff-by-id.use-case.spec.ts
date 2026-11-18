import { describe, expect, it } from 'vitest';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { inMemoryWorkforce, makeStaff } from '@test/workforce.js';
import { GetStaffByIdUseCase } from '../get-staff-by-id.use-case.js';

describe('GetStaffByIdUseCase', () => {
  it('workforce C3 answers staff not found for another organization', async () => {
    const workforce = inMemoryWorkforce();
    workforce.staff.items.push(makeStaff({ organizationId: 'B' }, 'rafael'));
    const sut = new GetStaffByIdUseCase(workforce.staff);

    const promise = sut.handle({ organizationId: 'A', id: 'rafael' });
    await expect(promise).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(promise).rejects.toThrow('Staff not found');

    const { staff } = await sut.handle({ organizationId: 'B', id: 'rafael' });
    expect(staff.id).toBe('rafael');
  });
});
