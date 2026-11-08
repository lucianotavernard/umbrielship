import { beforeEach, describe, expect, it } from 'vitest';

import { NotFoundDomainException } from '@/shared/lib/core/exception/not-found-domain.exception';

import { makeImage, makeService } from '../../../../test/factory';
import { InMemoryWorkOrderServiceImagesRepository } from '../../../../test/repositories/in-memory-work-order-service-images-repository';
import { InMemoryWorkOrderServicesRepository } from '../../../../test/repositories/in-memory-work-order-services-repository';
import { FetchWorkOrderServiceImagesUseCase } from './fetch-work-order-service-images.use-case';

let services: InMemoryWorkOrderServicesRepository;
let images: InMemoryWorkOrderServiceImagesRepository;
let sut: FetchWorkOrderServiceImagesUseCase;

describe('FetchWorkOrderServiceImagesUseCase', () => {
  beforeEach(() => {
    services = new InMemoryWorkOrderServicesRepository();
    images = new InMemoryWorkOrderServiceImagesRepository();
    sut = new FetchWorkOrderServiceImagesUseCase(services, images);
    services.items.push(
      makeService({ workOrderId: 'wo1' }, 's1'),
      makeService({ workOrderId: 'wo1' }, 's2'),
    );
    images.items.push(
      makeImage({ serviceId: 's1' }, 'i1'),
      makeImage({ serviceId: 's2' }, 'i2'),
      makeImage({ serviceId: 's1' }, 'i3'),
    );
  });

  it('[C23] throws NotFoundDomainException for an unknown service', async () => {
    const promise = sut.handle({ workOrderId: 'wo1', serviceId: 'missing' });

    await expect(promise).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(promise).rejects.toThrow('Work order service not found');
  });

  it('[C23] throws NotFoundDomainException for a service of another work order', async () => {
    const promise = sut.handle({ workOrderId: 'wo2', serviceId: 's1' });

    await expect(promise).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(promise).rejects.toThrow('Work order service not found');
  });

  it('[C23] returns only the images of that service', async () => {
    const result = await sut.handle({ workOrderId: 'wo1', serviceId: 's1' });

    expect(result.images.map((image) => image.id)).toEqual(['i1', 'i3']);
  });
});
