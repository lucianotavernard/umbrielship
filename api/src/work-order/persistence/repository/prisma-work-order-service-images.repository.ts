import { Injectable } from '@nestjs/common';

import { WorkOrderServiceImage as PrismaWorkOrderServiceImage } from '@/shared/module/prisma/generated/prisma/client';
import { PrismaService } from '@/shared/module/prisma/service/prisma.service';

import { WorkOrderServiceImageEntity } from '@/work-order/core/entity/work-order-service-image.entity';
import { WorkOrderServiceImageRepository } from '@/work-order/core/interface/work-order-service-image.repository';

@Injectable()
export class PrismaWorkOrderServiceImagesRepository implements WorkOrderServiceImageRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<WorkOrderServiceImageEntity | null> {
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
  ): Promise<WorkOrderServiceImageEntity[]> {
    const rows = await this.prisma.workOrderServiceImage.findMany({
      where: { serviceId },
    });

    return rows.map((row) => this.toDomain(row));
  }

  async create(image: WorkOrderServiceImageEntity): Promise<void> {
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
  ): WorkOrderServiceImageEntity {
    return new WorkOrderServiceImageEntity(
      {
        serviceId: prismaRow.serviceId,
        url: prismaRow.url,
      },
      prismaRow.id,
    );
  }
}
