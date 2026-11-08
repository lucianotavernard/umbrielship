import { beforeEach, describe, expect, it } from 'vitest';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception';

import { makeService } from '@test/factory';
import { InMemoryWorkOrderServiceImagesRepository } from '@test/repositories/in-memory-work-order-service-images-repository';
import { InMemoryWorkOrderServicesRepository } from '@test/repositories/in-memory-work-order-services-repository';
import { AddWorkOrderServiceImageUseCase } from '../add-work-order-service-image.use-case';

let services: InMemoryWorkOrderServicesRepository;
let images: InMemoryWorkOrderServiceImagesRepository;
let sut: AddWorkOrderServiceImageUseCase;

describe('AddWorkOrderServiceImageUseCase', () => {
  beforeEach(() => {
    services = new InMemoryWorkOrderServicesRepository();
    images = new InMemoryWorkOrderServiceImagesRepository();
    sut = new AddWorkOrderServiceImageUseCase(services, images);
    services.items.push(makeService({ workOrderId: 'wo1' }, 's1'));
  });

  it('[C29] throws NotFoundDomainException for an unknown service and stores nothing', async () => {
    const promise = sut.handle({
      workOrderId: 'wo1',
      serviceId: 'missing',
      url: '/u/a.png',
    });

    await expect(promise).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(promise).rejects.toThrow('Work order service not found');
    expect(images.items).toHaveLength(0);
  });

  it('[C29] throws NotFoundDomainException for a service of another work order and stores nothing', async () => {
    const promise = sut.handle({
      workOrderId: 'wo2',
      serviceId: 's1',
      url: '/u/a.png',
    });

    await expect(promise).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(promise).rejects.toThrow('Work order service not found');
    expect(images.items).toHaveLength(0);
  });

  it('[C29] stores the image with that serviceId and url', async () => {
    const { image } = await sut.handle({
      workOrderId: 'wo1',
      serviceId: 's1',
      url: '/u/a.png',
    });

    expect(images.items).toEqual([image]);
    expect(image).toMatchObject({ serviceId: 's1', url: '/u/a.png' });
  });
});
