import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';
import { ConflictDomainException } from '@/package/shared/lib/exception/conflict-domain.exception.js';
import { Prisma } from '@/package/shared/module/prisma/generated/prisma/client.js';
import { PrismaService } from '@/package/shared/module/prisma/prisma.service.js';

import { IInspectionAssignmentsRepository } from './contracts/inspection-assignment-repository.contract.js';
import { inspectionOf } from '../inspection/inspection.repository.js';
import { InspectionAssignment } from './inspection-assignment.entity.js';
import type { InspectionAssignmentSummary } from './inspection-assignment-summary.entity.js';

const withItemsAndService = {
  items: { orderBy: { position: 'asc' } },
  workOrderService: { select: { id: true, name: true } },
  inspections: {
    where: { discardedAt: null },
    orderBy: [{ completedAt: 'desc' }, { id: 'desc' }],
    include: { answers: true },
  },
  _count: { select: { inspections: true } },
} satisfies Prisma.InspectionAssignmentInclude;

type Row = Prisma.InspectionAssignmentGetPayload<{
  include: typeof withItemsAndService;
}>;

// The Organization-wide list also reads the WorkOrder and the target service's status.
const withWorkOrder = {
  ...withItemsAndService,
  workOrderService: { select: { id: true, name: true, status: true } },
  workOrder: { select: { id: true, vesselId: true, status: true } },
} satisfies Prisma.InspectionAssignmentInclude;

@Injectable()
export class PrismaInspectionAssignmentsRepository implements IInspectionAssignmentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    organizationId: string,
    id: string,
  ): Promise<InspectionAssignment | null> {
    const assignment = await this.prisma.inspectionAssignment.findFirst({
      include: withItemsAndService,
      where: { id, organizationId },
    });

    return assignment ? this.toDomain(assignment) : null;
  }

  async findManyByWorkOrderId(
    organizationId: string,
    workOrderId: string,
  ): Promise<InspectionAssignment[]> {
    const assignments = await this.prisma.inspectionAssignment.findMany({
      include: withItemsAndService,
      where: { organizationId, workOrderId },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });

    return assignments.map((assignment) => this.toDomain(assignment));
  }

  async findMany(
    organizationId: string,
  ): Promise<InspectionAssignmentSummary[]> {
    const assignments = await this.prisma.inspectionAssignment.findMany({
      include: withWorkOrder,
      where: { organizationId },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });

    return assignments.map((row) => ({
      assignment: this.toDomain(row),
      workOrder: {
        id: row.workOrder.id,
        vesselId: row.workOrder.vesselId,
        status: row.workOrder.status,
      },
      service: row.workOrderService
        ? {
            id: row.workOrderService.id,
            name: row.workOrderService.name,
            status: row.workOrderService.status,
          }
        : null,
    }));
  }

  async create(assignment: InspectionAssignment): Promise<void> {
    try {
      await this.prisma.inspectionAssignment.create({
        data: {
          id: assignment.id,
          organizationId: assignment.organizationId,
          workOrderId: assignment.workOrderId,
          workOrderServiceId: assignment.service?.id ?? null,
          templateName: assignment.templateName,
          assignedBy: assignment.assignedBy,
          createdAt: assignment.createdAt,
          items: {
            create: assignment.items.map((item) => ({
              id: item.id,
              organizationId: assignment.organizationId,
              label: item.label,
              position: item.position,
              type: item.type,
            })),
          },
        },
      });
    } catch (error) {
      // The WorkOrder or its service was deleted after the use case read it.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new NotFoundDomainException('Work order not found');
      }

      throw error;
    }
  }

  async delete(organizationId: string, id: string): Promise<void> {
    try {
      await this.prisma.inspectionAssignment.deleteMany({
        where: { organizationId, id },
      });
    } catch (error) {
      // An Inspection completed after the use case checked: the database refuses (D5).
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ConflictDomainException(
          'Inspection assignment has inspections',
        );
      }

      throw error;
    }
  }

  private toDomain(assignment: Row): InspectionAssignment {
    return InspectionAssignment.restore(
      {
        organizationId: assignment.organizationId,
        workOrderId: assignment.workOrderId,
        service: assignment.workOrderService
          ? {
              id: assignment.workOrderService.id,
              name: assignment.workOrderService.name,
            }
          : null,
        templateName: assignment.templateName,
        assignedBy: assignment.assignedBy,
        createdAt: assignment.createdAt,
        items: assignment.items.map(({ id, label, position, type }) => ({
          id,
          label,
          position,
          type,
        })),
        inspections: assignment.inspections.map(inspectionOf),
        inspectionCount: assignment._count.inspections,
      },
      assignment.id,
    );
  }
}
