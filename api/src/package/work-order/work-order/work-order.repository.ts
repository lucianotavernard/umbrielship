import { Injectable } from '@nestjs/common';

import { Paginate } from '@/package/shared/lib/type/paginate.js';
import { WorkOrder as PrismaWorkOrder } from '@/package/shared/module/prisma/generated/prisma/client.js';
import { PrismaService } from '@/package/shared/module/prisma/prisma.service.js';

import { WorkOrder } from './work-order.entity.js';
import { IWorkOrdersRepository } from './contracts/work-order-repository.contract.js';

@Injectable()
export class PrismaWorkOrdersRepository implements IWorkOrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    organizationId: string,
    id: string,
  ): Promise<WorkOrder | null> {
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id, organizationId },
    });

    return workOrder ? this.toDomain(workOrder) : null;
  }

  async findMany(
    organizationId: string,
    take: number,
    skip: number,
  ): Promise<Paginate<WorkOrder>> {
    const where = { organizationId };
    const total = await this.prisma.workOrder.count({ where });
    const data = await this.prisma.workOrder.findMany({ where, take, skip });

    return {
      data: data.map((row) => this.toDomain(row)),
      total,
    };
  }

  async findManyByVesselId(
    organizationId: string,
    vesselId: string,
    take: number,
    skip: number,
  ): Promise<Paginate<WorkOrder>> {
    const where = { organizationId, vesselId };

    const total = await this.prisma.workOrder.count({ where });
    const data = await this.prisma.workOrder.findMany({
      where,
      take,
      skip,
    });

    return {
      data: data.map((row) => this.toDomain(row)),
      total,
    };
  }

  async create(workOrder: WorkOrder): Promise<void> {
    await this.prisma.workOrder.create({
      data: {
        id: workOrder.id,
        organizationId: workOrder.organizationId,
        vesselId: workOrder.vesselId,
        startDate: workOrder.startDate,
        endDate: workOrder.endDate,
        status: workOrder.status,
      },
    });
  }

  async save(workOrder: WorkOrder): Promise<void> {
    await this.prisma.workOrder.update({
      where: { id: workOrder.id },
      data: {
        startDate: workOrder.startDate,
        endDate: workOrder.endDate,
        status: workOrder.status,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.workOrder.delete({
      where: { id },
    });
  }

  private toDomain(prismaWorkOrder: PrismaWorkOrder): WorkOrder {
    return WorkOrder.create(
      {
        organizationId: prismaWorkOrder.organizationId,
        vesselId: prismaWorkOrder.vesselId,
        startDate: prismaWorkOrder.startDate,
        endDate: prismaWorkOrder.endDate,
        status: prismaWorkOrder.status,
      },
      prismaWorkOrder.id,
    );
  }
}
