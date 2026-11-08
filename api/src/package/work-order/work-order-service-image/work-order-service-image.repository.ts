import { Injectable } from '@nestjs/common';

import { WorkOrderServiceImage as PrismaWorkOrderServiceImage } from '@/package/shared/module/prisma/generated/prisma/client.js';
import { PrismaService } from '@/package/shared/module/prisma/prisma.service.js';

import { WorkOrderServiceImage } from './work-order-service-image.entity.js';
import { IWorkOrderServiceImagesRepository } from './contracts/work-order-service-image-repository.contract.js';

@Injectable()
export class PrismaWorkOrderServiceImagesRepository implements IWorkOrderServiceImagesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    organizationId: string,
    id: string,
  ): Promise<WorkOrderServiceImage | null> {
    const row = await this.prisma.workOrderServiceImage.findFirst({
      where: { id, organizationId },
    });

    if (!row) {
      return null;
    }

    return this.toDomain(row);
  }

  async findManyByServiceId(
    organizationId: string,
    serviceId: string,
  ): Promise<WorkOrderServiceImage[]> {
    const rows = await this.prisma.workOrderServiceImage.findMany({
      where: { organizationId, serviceId },
    });

    return rows.map((row) => this.toDomain(row));
  }

  async create(image: WorkOrderServiceImage): Promise<void> {
    await this.prisma.workOrderServiceImage.create({
      data: {
        id: image.id,
        organizationId: image.organizationId,
        serviceId: image.serviceId,
        url: image.url,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.workOrderServiceImage.delete({
      where: { id },
    });
  }

  private toDomain(
    prismaRow: PrismaWorkOrderServiceImage,
  ): WorkOrderServiceImage {
    return WorkOrderServiceImage.create(
      {
        organizationId: prismaRow.organizationId,
        serviceId: prismaRow.serviceId,
        url: prismaRow.url,
      },
      prismaRow.id,
    );
  }
}
