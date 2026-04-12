import { Injectable } from '@nestjs/common';

import { WorkOrderService as PrismaWorkOrderService } from '@/shared/module/prisma/generated/prisma/client';
import { PrismaService } from '@/shared/module/prisma/service/prisma.service';

import {
  WorkOrderServiceEntity,
  WorkOrderServiceStatus,
} from '@/work-order/core/entity/work-order-service.entity';
import { WorkOrderServiceRepository } from '@/work-order/core/interface/work-order-service.repository';

@Injectable()
export class PrismaWorkOrderServicesRepository implements WorkOrderServiceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<WorkOrderServiceEntity | null> {
    const row = await this.prisma.workOrderService.findUnique({
      where: { id },
    });

    if (!row) {
      return null;
    }

    return this.toDomain(row);
  }

  async findManyByWorkOrderId(
    workOrderId: string,
  ): Promise<WorkOrderServiceEntity[]> {
    const rows = await this.prisma.workOrderService.findMany({
      where: { workOrderId },
    });

    return rows.map((row) => this.toDomain(row));
  }

  async create(service: WorkOrderServiceEntity): Promise<void> {
    await this.prisma.workOrderService.create({
      data: {
        id: service.id,
        workOrderId: service.workOrderId,
        name: service.name,
        description: service.description,
        startDate: service.startDate,
        endDate: service.endDate,
        status: service.status,
      },
    });
  }

  async save(service: WorkOrderServiceEntity): Promise<void> {
    await this.prisma.workOrderService.update({
      where: { id: service.id },
      data: {
        name: service.name,
        description: service.description,
        startDate: service.startDate,
        endDate: service.endDate,
        status: service.status,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.workOrderService.delete({
      where: { id },
    });
  }

  private toDomain(prismaRow: PrismaWorkOrderService): WorkOrderServiceEntity {
    return new WorkOrderServiceEntity(
      {
        workOrderId: prismaRow.workOrderId,
        name: prismaRow.name,
        description: prismaRow.description,
        startDate: prismaRow.startDate,
        endDate: prismaRow.endDate,
        status: prismaRow.status as WorkOrderServiceStatus,
      },
      prismaRow.id,
    );
  }
}
