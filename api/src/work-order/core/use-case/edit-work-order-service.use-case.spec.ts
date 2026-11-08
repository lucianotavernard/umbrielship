import { beforeEach, describe, expect, it } from 'vitest';

import { NotFoundDomainException } from '@/shared/lib/core/exception/not-found-domain.exception';

import { makeService } from '../../../../test/factory';
import { InMemoryWorkOrderServicesRepository } from '../../../../test/repositories/in-memory-work-order-services-repository';
import { EditWorkOrderServiceUseCase } from './edit-work-order-service.use-case';

let services: InMemoryWorkOrderServicesRepository;
let sut: EditWorkOrderServiceUseCase;

const input = {
  name: 'Repaint',
  description: 'Anti-fouling',
  startDate: new Date('2026-04-01T00:00:00.000Z'),
  endDate: new Date('2026-04-02T00:00:00.000Z'),
  status: 'COMPLETED' as const,
};

describe('EditWorkOrderServiceUseCase', () => {
  beforeEach(() => {
    services = new InMemoryWorkOrderServicesRepository();
    sut = new EditWorkOrderServiceUseCase(services);
    services.items.push(makeService({ workOrderId: 'wo1' }, 's1'));
  });

  it('[C22] throws NotFoundDomainException for an unknown service', async () => {
    const promise = sut.handle({
      workOrderId: 'wo1',
      serviceId: 'missing',
      ...input,
    });

    await expect(promise).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(promise).rejects.toThrow('Work order service not found');
  });

  it('[C22] throws NotFoundDomainException for a service of another work order and changes nothing', async () => {
    const promise = sut.handle({
      workOrderId: 'wo2',
      serviceId: 's1',
      ...input,
    });

    await expect(promise).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(promise).rejects.toThrow('Work order service not found');
    expect(services.items[0].name).toBe('Hull cleaning');
  });

  it('[C22] saves the new fields and keeps workOrderId', async () => {
    await sut.handle({ workOrderId: 'wo1', serviceId: 's1', ...input });

    expect(services.items[0]).toMatchObject({
      id: 's1',
      workOrderId: 'wo1',
      ...input,
    });
  });
});
