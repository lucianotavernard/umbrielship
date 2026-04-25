import { Injectable } from '@nestjs/common';

import { Paginate } from '@/shared/lib/core/type/paginate';
import {
  Vessel as PrismaVessel,
  WorkOrder as PrismaWorkOrder,
} from '@/shared/module/prisma/generated/prisma/client';
import { PrismaService } from '@/shared/module/prisma/service/prisma.service';

import { WorkOrderDetailEntity } from '@/work-order/core/entity/work-order-detail.entity';
import {
  WorkOrderEntity,
  WorkOrderStatus,
} from '@/work-order/core/entity/work-order.entity';
import { WorkOrderRepository } from '@/work-order/core/interface/work-order.repository';

type PrismaWorkOrderWithVessel = PrismaWorkOrder & {
  vessel: PrismaVessel;
};

@Injectable()
export class PrismaWorkOrdersRepository implements WorkOrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<WorkOrderDetailEntity | null> {
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

  async findMany(
    take: number,
    skip: number,
  ): Promise<Paginate<WorkOrderEntity>> {
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
  ): Promise<Paginate<WorkOrderEntity>> {
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

  async create(workOrder: WorkOrderEntity): Promise<void> {
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

  async save(workOrder: WorkOrderEntity): Promise<void> {
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

  private toDomain(prismaWorkOrder: PrismaWorkOrder): WorkOrderEntity {
    return new WorkOrderEntity(
      {
        vesselId: prismaWorkOrder.vesselId,
        startDate: prismaWorkOrder.startDate,
        endDate: prismaWorkOrder.endDate,
        status: prismaWorkOrder.status as WorkOrderStatus,
      },
      prismaWorkOrder.id,
    );
  }

  private toDetailDomain(
    prismaWorkOrder: PrismaWorkOrderWithVessel,
  ): WorkOrderDetailEntity {
    return new WorkOrderDetailEntity(
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
