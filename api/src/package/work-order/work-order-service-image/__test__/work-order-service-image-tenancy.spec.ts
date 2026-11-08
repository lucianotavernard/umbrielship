import { promises as fs } from 'fs';
import { join } from 'path';

import { beforeEach, describe, expect, it } from 'vitest';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception';

import { makeImage, makeService } from '@test/factory';
import { InMemoryWorkOrderServiceImagesRepository } from '@test/repositories/in-memory-work-order-service-images-repository';
import { InMemoryWorkOrderServicesRepository } from '@test/repositories/in-memory-work-order-services-repository';
import { AddWorkOrderServiceImageUseCase } from '../add-work-order-service-image.use-case';
import { FetchWorkOrderServiceImagesUseCase } from '../fetch-work-order-service-images.use-case';
import { RemoveWorkOrderServiceImageUseCase } from '../remove-work-order-service-image.use-case';

let services: InMemoryWorkOrderServicesRepository;
let images: InMemoryWorkOrderServiceImagesRepository;

describe('WorkOrderServiceImage tenancy', () => {
  beforeEach(() => {
    services = new InMemoryWorkOrderServicesRepository();
    images = new InMemoryWorkOrderServiceImagesRepository();
    services.items.push(
      makeService({ organizationId: 'B', workOrderId: 'wb' }, 'sb'),
    );
  });

  it('[C39] add, fetch and remove answer not found for a service or image of another Organization', async () => {
    images.items.push(
      makeImage(
        { organizationId: 'B', serviceId: 'sb', url: '/uploads/x.png' },
        'ib',
      ),
    );
    const ids = { organizationId: 'A', workOrderId: 'wb', serviceId: 'sb' };

    const add = new AddWorkOrderServiceImageUseCase(services, images).handle({
      ...ids,
      url: '/uploads/y.png',
    });
    const fetch = new FetchWorkOrderServiceImagesUseCase(
      services,
      images,
    ).handle(ids);
    const remove = new RemoveWorkOrderServiceImageUseCase(
      services,
      images,
    ).handle({
      ...ids,
      imageId: 'ib',
    });

    for (const promise of [add, fetch, remove]) {
      await expect(promise).rejects.toBeInstanceOf(NotFoundDomainException);
      await expect(promise).rejects.toThrow('Work order service not found');
    }
    expect(images.items).toHaveLength(1);
  });

  it('[C39] remove leaves the file of another Organization on disk', async () => {
    const relative = 'uploads/c39-tenancy-test.png';
    const absolute = join(process.cwd(), relative);
    await fs.mkdir(join(process.cwd(), 'uploads'), { recursive: true });
    await fs.writeFile(absolute, 'x');
    images.items.push(
      makeImage(
        { organizationId: 'B', serviceId: 'sb', url: `/${relative}` },
        'ib',
      ),
    );

    await expect(
      new RemoveWorkOrderServiceImageUseCase(services, images).handle({
        organizationId: 'A',
        workOrderId: 'wb',
        serviceId: 'sb',
        imageId: 'ib',
      }),
    ).rejects.toBeInstanceOf(NotFoundDomainException);

    await expect(fs.stat(absolute)).resolves.toBeDefined();
    await fs.unlink(absolute);
  });
});
