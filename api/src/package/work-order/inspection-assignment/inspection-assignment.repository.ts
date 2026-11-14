import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';
import { Prisma } from '@/package/shared/module/prisma/generated/prisma/client.js';
import { PrismaService } from '@/package/shared/module/prisma/prisma.service.js';

import { IInspectionAssignmentsRepository } from './contracts/inspection-assignment-repository.contract.js';
import { InspectionAssignment } from './inspection-assignment.entity.js';

const withItemsAndService = {
  items: { orderBy: { position: 'asc' } },
  workOrderService: { select: { id: true, name: true } },
} satisfies Prisma.InspectionAssignmentInclude;

type Row = Prisma.InspectionAssignmentGetPayload<{
  include: typeof withItemsAndService;
}>;

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
    await this.prisma.inspectionAssignment.deleteMany({
      where: { organizationId, id },
    });
  }

  private toDomain(assignment: Row): InspectionAssignment {
    return InspectionAssignment.restore(
      {
        organizationId: assignment.organizationId,
        workOrderId: assignment.workOrderId,
        service: assignment.workOrderService,
        templateName: assignment.templateName,
        assignedBy: assignment.assignedBy,
        createdAt: assignment.createdAt,
        items: assignment.items.map(({ id, label, position }) => ({
          id,
          label,
          position,
        })),
      },
      assignment.id,
    );
  }
}
