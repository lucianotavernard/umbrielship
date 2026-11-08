import { Injectable } from '@nestjs/common';

import { WorkOrderServiceImage as PrismaWorkOrderServiceImage } from '@/package/shared/module/prisma/generated/prisma/client';
import { PrismaService } from '@/package/shared/module/prisma/prisma.service';

import { WorkOrderServiceImage } from './work-order-service-image.entity';
import { IWorkOrderServiceImagesRepository } from './contracts/work-order-service-image-repository.contract';

@Injectable()
export class PrismaWorkOrderServiceImagesRepository implements IWorkOrderServiceImagesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<WorkOrderServiceImage | null> {
    const row = await this.prisma.workOrderServiceImage.findUnique({
      where: { id },
    });

    if (!row) {
      return null;
    }

    return this.toDomain(row);
  }

  async findManyByServiceId(
    serviceId: string,
  ): Promise<WorkOrderServiceImage[]> {
    const rows = await this.prisma.workOrderServiceImage.findMany({
      where: { serviceId },
    });

    return rows.map((row) => this.toDomain(row));
  }

  async create(image: WorkOrderServiceImage): Promise<void> {
    await this.prisma.workOrderServiceImage.create({
      data: {
        id: image.id,
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
        serviceId: prismaRow.serviceId,
        url: prismaRow.url,
      },
      prismaRow.id,
    );
  }
}
