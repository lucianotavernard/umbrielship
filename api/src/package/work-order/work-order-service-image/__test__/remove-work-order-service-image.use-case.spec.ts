import { promises as fsPromises } from 'node:fs';
import { mkdir, mkdtemp, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception';

import { makeImage, makeService } from '@test/factory';
import { InMemoryWorkOrderServiceImagesRepository } from '@test/repositories/in-memory-work-order-service-images-repository';
import { InMemoryWorkOrderServicesRepository } from '@test/repositories/in-memory-work-order-services-repository';
import { RemoveWorkOrderServiceImageUseCase } from '../remove-work-order-service-image.use-case';

let services: InMemoryWorkOrderServicesRepository;
let images: InMemoryWorkOrderServiceImagesRepository;
let sut: RemoveWorkOrderServiceImageUseCase;
let cwd: string;

const url = '/uploads/work-order-service-images/photo.png';

describe('RemoveWorkOrderServiceImageUseCase', () => {
  beforeEach(async () => {
    cwd = await mkdtemp(join(tmpdir(), 'umbrielship-remove-image-'));
    await mkdir(join(cwd, 'uploads/work-order-service-images'), {
      recursive: true,
    });
    vi.spyOn(process, 'cwd').mockReturnValue(cwd);

    services = new InMemoryWorkOrderServicesRepository();
    images = new InMemoryWorkOrderServiceImagesRepository();
    sut = new RemoveWorkOrderServiceImageUseCase(services, images);
    services.items.push(
      makeService({ workOrderId: 'wo1' }, 's1'),
      makeService({ workOrderId: 'wo1' }, 's2'),
    );
    images.items.push(makeImage({ serviceId: 's1', url }, 'i1'));
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await rm(cwd, { recursive: true, force: true });
  });

  const folder = () => join(cwd, 'uploads/work-order-service-images');

  it('[C28] throws NotFoundDomainException for an unknown service', async () => {
    const promise = sut.handle({
      workOrderId: 'wo1',
      serviceId: 'missing',
      imageId: 'i1',
    });

    await expect(promise).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(promise).rejects.toThrow('Work order service not found');
    expect(images.items).toHaveLength(1);
  });

  it('[C28] throws NotFoundDomainException for a service of another work order', async () => {
    const promise = sut.handle({
      workOrderId: 'wo2',
      serviceId: 's1',
      imageId: 'i1',
    });

    await expect(promise).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(promise).rejects.toThrow('Work order service not found');
    expect(images.items).toHaveLength(1);
  });

  it('[C28] throws NotFoundDomainException for an unknown image', async () => {
    const promise = sut.handle({
      workOrderId: 'wo1',
      serviceId: 's1',
      imageId: 'missing',
    });

    await expect(promise).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(promise).rejects.toThrow('Work order service image not found');
  });

  it('[C28] throws NotFoundDomainException for an image of another service and keeps its file', async () => {
    await writeFile(join(cwd, url), 'x');

    const promise = sut.handle({
      workOrderId: 'wo1',
      serviceId: 's2',
      imageId: 'i1',
    });

    await expect(promise).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(promise).rejects.toThrow('Work order service image not found');
    expect(images.items).toHaveLength(1);
    expect(await readdir(folder())).toEqual(['photo.png']);
  });

  it('[C28] deletes the image row and the file under the working directory', async () => {
    await writeFile(join(cwd, url), 'x');

    await sut.handle({ workOrderId: 'wo1', serviceId: 's1', imageId: 'i1' });

    expect(images.items).toHaveLength(0);
    expect(await readdir(folder())).toEqual([]);
  });

  it('[C28] still succeeds when the file is already gone', async () => {
    await expect(
      sut.handle({ workOrderId: 'wo1', serviceId: 's1', imageId: 'i1' }),
    ).resolves.toBeUndefined();

    expect(images.items).toHaveLength(0);
  });

  it.each(['EACCES', 'EPERM', 'EISDIR'])(
    '[C28] rethrows %s after the row was deleted',
    async (code) => {
      const failure = Object.assign(new Error(code), { code });
      vi.spyOn(fsPromises, 'unlink').mockRejectedValue(failure);

      await expect(
        sut.handle({ workOrderId: 'wo1', serviceId: 's1', imageId: 'i1' }),
      ).rejects.toBe(failure);

      expect(images.items).toHaveLength(0);
    },
  );
});
