import { Injectable } from '@nestjs/common';

import { WorkOrderService as PrismaWorkOrderService } from '@/package/shared/module/prisma/generated/prisma/client';
import { PrismaService } from '@/package/shared/module/prisma/prisma.service';

import { WorkOrderService } from './work-order-service.entity';
import { IWorkOrderServicesRepository } from './contracts/work-order-service-repository.contract';

@Injectable()
export class PrismaWorkOrderServicesRepository implements IWorkOrderServicesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<WorkOrderService | null> {
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
  ): Promise<WorkOrderService[]> {
    const rows = await this.prisma.workOrderService.findMany({
      where: { workOrderId },
    });

    return rows.map((row) => this.toDomain(row));
  }

  async create(service: WorkOrderService): Promise<void> {
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

  async save(service: WorkOrderService): Promise<void> {
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

  private toDomain(prismaRow: PrismaWorkOrderService): WorkOrderService {
    return WorkOrderService.create(
      {
        workOrderId: prismaRow.workOrderId,
        name: prismaRow.name,
        description: prismaRow.description,
        startDate: prismaRow.startDate,
        endDate: prismaRow.endDate,
        status: prismaRow.status,
      },
      prismaRow.id,
    );
  }
}
