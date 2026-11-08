import { beforeEach, describe, expect, it } from 'vitest';

import { NotFoundDomainException } from '@/shared/lib/core/exception/not-found-domain.exception';

import { makeService } from '../../../../test/factory';
import { InMemoryWorkOrderServicesRepository } from '../../../../test/repositories/in-memory-work-order-services-repository';
import { DeleteWorkOrderServiceUseCase } from './delete-work-order-service.use-case';

let services: InMemoryWorkOrderServicesRepository;
let sut: DeleteWorkOrderServiceUseCase;

describe('DeleteWorkOrderServiceUseCase', () => {
  beforeEach(() => {
    services = new InMemoryWorkOrderServicesRepository();
    sut = new DeleteWorkOrderServiceUseCase(services);
    services.items.push(
      makeService({ workOrderId: 'wo1' }, 's1'),
      makeService({ workOrderId: 'wo1' }, 's2'),
    );
  });

  it('[C20] throws NotFoundDomainException for an unknown service', async () => {
    const promise = sut.handle({ workOrderId: 'wo1', serviceId: 'missing' });

    await expect(promise).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(promise).rejects.toThrow('Work order service not found');
  });

  it('[C20] throws NotFoundDomainException for a service of another work order and removes nothing', async () => {
    const promise = sut.handle({ workOrderId: 'wo2', serviceId: 's1' });

    await expect(promise).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(promise).rejects.toThrow('Work order service not found');
    expect(services.items).toHaveLength(2);
  });

  it('[C20] removes exactly that service', async () => {
    await sut.handle({ workOrderId: 'wo1', serviceId: 's1' });

    expect(services.items.map((item) => item.id)).toEqual(['s2']);
  });
});
