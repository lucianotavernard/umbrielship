import { Injectable } from '@nestjs/common';

import { Paginate } from '@/package/shared/lib/type/paginate';
import {
  Vessel as PrismaVessel,
  WorkOrder as PrismaWorkOrder,
} from '@/package/shared/module/prisma/generated/prisma/client';
import { PrismaService } from '@/package/shared/module/prisma/prisma.service';

import { WorkOrderDetail } from './work-order-detail.entity';
import { WorkOrder } from './work-order.entity';
import { IWorkOrdersRepository } from './contracts/work-order-repository.contract';

type PrismaWorkOrderWithVessel = PrismaWorkOrder & {
  vessel: PrismaVessel;
};

@Injectable()
export class PrismaWorkOrdersRepository implements IWorkOrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<WorkOrderDetail | null> {
    const workOrder = await this.prisma.workOrder.findUnique({
      where: { id },
      include: {
        vessel: true,
      },
    });

    if (!workOrder) {
      return null;
    }

    return this.toDetailDomain(workOrder);
  }

  async findMany(take: number, skip: number): Promise<Paginate<WorkOrder>> {
    const total = await this.prisma.workOrder.count();
    const data = await this.prisma.workOrder.findMany({ take, skip });

    return {
      data: data.map((row) => this.toDomain(row)),
      total,
    };
  }

  async findManyByVesselId(
    vesselId: string,
    take: number,
    skip: number,
  ): Promise<Paginate<WorkOrder>> {
    const where = { vesselId };

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
        vesselId: prismaWorkOrder.vesselId,
        startDate: prismaWorkOrder.startDate,
        endDate: prismaWorkOrder.endDate,
        status: prismaWorkOrder.status,
      },
      prismaWorkOrder.id,
    );
  }

  private toDetailDomain(
    prismaWorkOrder: PrismaWorkOrderWithVessel,
  ): WorkOrderDetail {
    return WorkOrderDetail.create(
      {
        vessel: {
          vesselId: prismaWorkOrder.vessel.id,
          name: prismaWorkOrder.vessel.name,
          type: prismaWorkOrder.vessel.type,
          length: prismaWorkOrder.vessel.length,
        },
        startDate: prismaWorkOrder.startDate,
        endDate: prismaWorkOrder.endDate,
        status: prismaWorkOrder.status,
      },
      prismaWorkOrder.id,
    );
  }
}
