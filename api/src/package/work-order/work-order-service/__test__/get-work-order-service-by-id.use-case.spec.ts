import { beforeEach, describe, expect, it } from 'vitest';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception';

import { makeService } from '@test/factory';
import { InMemoryWorkOrderServicesRepository } from '@test/repositories/in-memory-work-order-services-repository';
import { GetWorkOrderServiceByIdUseCase } from '../get-work-order-service-by-id.use-case';

let services: InMemoryWorkOrderServicesRepository;
let sut: GetWorkOrderServiceByIdUseCase;

describe('GetWorkOrderServiceByIdUseCase', () => {
  beforeEach(() => {
    services = new InMemoryWorkOrderServicesRepository();
    sut = new GetWorkOrderServiceByIdUseCase(services);
    services.items.push(makeService({ workOrderId: 'wo1' }, 's1'));
  });

  it('[C27] returns the service of that work order', async () => {
    const { service } = await sut.handle({
      workOrderId: 'wo1',
      serviceId: 's1',
    });

    expect(service.id).toBe('s1');
  });

  it('[C27] throws NotFoundDomainException for an unknown service', async () => {
    const promise = sut.handle({ workOrderId: 'wo1', serviceId: 'missing' });

    await expect(promise).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(promise).rejects.toThrow('Work order service not found');
  });

  it('[C27] throws NotFoundDomainException for a service of another work order', async () => {
    const promise = sut.handle({ workOrderId: 'wo2', serviceId: 's1' });

    await expect(promise).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(promise).rejects.toThrow('Work order service not found');
  });
});
