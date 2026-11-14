import { Injectable } from '@nestjs/common';

import {
  InspectionAnswer as PrismaInspectionAnswer,
  Inspection as PrismaInspection,
} from '@/package/shared/module/prisma/generated/prisma/client.js';
import { PrismaService } from '@/package/shared/module/prisma/prisma.service.js';

import { IInspectionsRepository } from './contracts/inspection-repository.contract.js';
import {
  AnswerValue,
  Inspection,
  InspectionAnswer,
} from './inspection.entity.js';

// The answer's value goes to the column of its kind; the others stay null.
export const answerColumns = (value: AnswerValue | null) => ({
  textValue: typeof value === 'string' ? value : null,
  booleanValue: typeof value === 'boolean' ? value : null,
  scoreValue: typeof value === 'number' ? value : null,
});

export const answerOf = (row: PrismaInspectionAnswer): InspectionAnswer => ({
  id: row.id,
  itemId: row.itemId,
  notApplicable: row.notApplicable,
  value: row.textValue ?? row.booleanValue ?? row.scoreValue ?? null,
  note: row.note,
});

export const inspectionOf = (
  row: PrismaInspection & { answers: PrismaInspectionAnswer[] },
): Inspection =>
  Inspection.restore(
    {
      organizationId: row.organizationId,
      assignmentId: row.assignmentId,
      result: row.result,
      inspectorId: row.inspectorId,
      inspectorName: row.inspectorName,
      completedAt: row.completedAt,
      discardedAt: row.discardedAt,
      discardedBy: row.discardedBy,
      answers: row.answers.map(answerOf),
    },
    row.id,
  );

@Injectable()
export class PrismaInspectionsRepository implements IInspectionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findVisibleById(
    organizationId: string,
    id: string,
  ): Promise<Inspection | null> {
    const inspection = await this.prisma.inspection.findFirst({
      include: { answers: true },
      where: { id, organizationId, discardedAt: null },
    });

    return inspection ? inspectionOf(inspection) : null;
  }

  async countByWorkOrderId(
    organizationId: string,
    workOrderId: string,
  ): Promise<number> {
    return this.prisma.inspection.count({
      where: { organizationId, assignment: { workOrderId } },
    });
  }

  async countByServiceId(
    organizationId: string,
    serviceId: string,
  ): Promise<number> {
    return this.prisma.inspection.count({
      where: { organizationId, assignment: { workOrderServiceId: serviceId } },
    });
  }

  async create(inspection: Inspection): Promise<void> {
    await this.prisma.inspection.create({
      data: {
        id: inspection.id,
        organizationId: inspection.organizationId,
        assignmentId: inspection.assignmentId,
        result: inspection.result,
        inspectorId: inspection.inspectorId,
        inspectorName: inspection.inspectorName,
        completedAt: inspection.completedAt,
        answers: {
          create: inspection.answers.map((answer) => ({
            id: answer.id,
            organizationId: inspection.organizationId,
            itemId: answer.itemId,
            notApplicable: answer.notApplicable,
            note: answer.note,
            ...answerColumns(answer.value),
          })),
        },
      },
    });
  }

  async saveDiscard(inspection: Inspection): Promise<void> {
    await this.prisma.inspection.updateMany({
      where: {
        id: inspection.id,
        organizationId: inspection.organizationId,
        discardedAt: null,
      },
      data: {
        discardedAt: inspection.discardedAt,
        discardedBy: inspection.discardedBy,
      },
    });
  }
}
