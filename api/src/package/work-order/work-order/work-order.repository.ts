import { Injectable } from '@nestjs/common';

import { Paginate } from '@/package/shared/lib/type/paginate.js';
import { ConflictDomainException } from '@/package/shared/lib/exception/conflict-domain.exception.js';
import {
  Prisma,
  WorkOrder as PrismaWorkOrder,
} from '@/package/shared/module/prisma/generated/prisma/client.js';
import { PrismaService } from '@/package/shared/module/prisma/prisma.service.js';

import type { WorkOrderService } from '../work-order-service/work-order-service.entity.js';
import { WorkOrder } from './work-order.entity.js';
import { WorkOrderSummary } from './work-order-summary.entity.js';
import { IWorkOrdersRepository } from './contracts/work-order-repository.contract.js';

// The services of the WorkOrder, by start date, then name.
const withServices = (organizationId: string) =>
  ({
    services: {
      where: { organizationId },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        status: true,
      },
      orderBy: [{ startDate: 'asc' }, { name: 'asc' }],
    },
  }) satisfies Prisma.WorkOrderInclude;

type SummaryRow = Prisma.WorkOrderGetPayload<{
  include: ReturnType<typeof withServices>;
}>;

// No `take` and no `skip` reads every row.
const pageOf = (
  take?: number,
  skip?: number,
): { take?: number; skip?: number } =>
  take === undefined && skip === undefined ? {} : { take, skip };

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
    take?: number,
    skip?: number,
  ): Promise<Paginate<WorkOrderSummary>> {
    const where = { organizationId };
    const total = await this.prisma.workOrder.count({ where });
    const data = await this.prisma.workOrder.findMany({
      where,
      include: withServices(organizationId),
      ...pageOf(take, skip),
    });

    return {
      data: data.map((row) => this.toSummary(row)),
      total,
    };
  }

  async findManyByVesselId(
    organizationId: string,
    vesselId: string,
    take?: number,
    skip?: number,
  ): Promise<Paginate<WorkOrderSummary>> {
    const where = { organizationId, vesselId };

    const total = await this.prisma.workOrder.count({ where });
    const data = await this.prisma.workOrder.findMany({
      where,
      include: withServices(organizationId),
      ...pageOf(take, skip),
    });

    return {
      data: data.map((row) => this.toSummary(row)),
      total,
    };
  }

  async create(
    workOrder: WorkOrder,
    services: WorkOrderService[] = [],
  ): Promise<void> {
    const data = {
      id: workOrder.id,
      organizationId: workOrder.organizationId,
      vesselId: workOrder.vesselId,
      startDate: workOrder.startDate,
      endDate: workOrder.endDate,
      status: workOrder.status,
    };

    if (services.length === 0) {
      await this.prisma.workOrder.create({ data });
      return;
    }

    // One transaction: a failed service leaves no WorkOrder behind (AD-035).
    await this.prisma.$transaction([
      this.prisma.workOrder.create({ data }),
      this.prisma.workOrderService.createMany({
        data: services.map((service) => ({
          id: service.id,
          organizationId: service.organizationId,
          workOrderId: service.workOrderId,
          name: service.name,
          description: service.description,
          startDate: service.startDate,
          endDate: service.endDate,
          status: service.status,
        })),
      }),
    ]);
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
    try {
      await this.prisma.workOrder.delete({
        where: { id },
      });
    } catch (error) {
      // An Inspection completed after the use case checked: the database refuses (D5).
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ConflictDomainException('Work order has inspections');
      }

      throw error;
    }
  }

  private toSummary({ services, ...row }: SummaryRow): WorkOrderSummary {
    const { id, ...props } = this.toDomain(row);

    return WorkOrderSummary.create(
      {
        ...props,
        services: services.map(({ id, name, startDate, endDate, status }) => ({
          id,
          name,
          startDate,
          endDate,
          status,
        })),
      },
      id,
    );
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
