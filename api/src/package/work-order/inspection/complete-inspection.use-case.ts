import { Injectable } from '@nestjs/common';

import { ConflictDomainException } from '@/package/shared/lib/exception/conflict-domain.exception.js';
import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { IInspectionAssignmentsRepository } from '../inspection-assignment/contracts/inspection-assignment-repository.contract.js';
import { IWorkOrderServicesRepository } from '../work-order-service/contracts/work-order-service-repository.contract.js';
import { IWorkOrdersRepository } from '../work-order/contracts/work-order-repository.contract.js';
import { IInspectionsRepository } from './contracts/inspection-repository.contract.js';
import {
  AnswerValue,
  fitsType,
  Inspection,
  InspectionResult,
} from './inspection.entity.js';

export type SubmittedAnswer = {
  itemId: string;
  notApplicable?: boolean;
  value?: AnswerValue;
  note?: string;
};

type CompleteInspectionUseCaseRequest = {
  organizationId: string;
  workOrderId: string;
  assignmentId: string;
  result: InspectionResult;
  answers: SubmittedAnswer[];
  inspector: { id: string; name: string };
};

type CompleteInspectionUseCaseResponse = {
  inspection: Inspection;
};

const ANSWERS_DO_NOT_MATCH = 'Answers do not match the questions';

@Injectable()
export class CompleteInspectionUseCase {
  constructor(
    private readonly inspectionAssignmentsRepository: IInspectionAssignmentsRepository,
    private readonly workOrdersRepository: IWorkOrdersRepository,
    private readonly workOrderServicesRepository: IWorkOrderServicesRepository,
    private readonly inspectionsRepository: IInspectionsRepository,
  ) {}

  async handle({
    organizationId,
    workOrderId,
    assignmentId,
    result,
    answers,
    inspector,
  }: CompleteInspectionUseCaseRequest): Promise<CompleteInspectionUseCaseResponse> {
    const assignment = await this.inspectionAssignmentsRepository.findById(
      organizationId,
      assignmentId,
    );

    if (!assignment || assignment.workOrderId !== workOrderId) {
      throw new NotFoundDomainException('Inspection assignment not found');
    }

    // D6 and AD-018: the WorkOrder, and the service the assignment targets, are in progress.
    const workOrder = await this.workOrdersRepository.findById(
      organizationId,
      workOrderId,
    );

    if (!workOrder) {
      throw new NotFoundDomainException('Work order not found');
    }

    if (workOrder.status !== 'IN_PROGRESS') {
      throw new ConflictDomainException('Work order is not in progress');
    }

    if (assignment.service) {
      const service = await this.workOrderServicesRepository.findById(
        organizationId,
        assignment.service.id,
      );

      if (!service || service.status !== 'IN_PROGRESS') {
        throw new ConflictDomainException(
          'Work order service is not in progress',
        );
      }
    }

    // Every question once, with a value of its type or "not applicable" (AD-019).
    const byItem = new Map(answers.map((answer) => [answer.itemId, answer]));

    if (
      byItem.size !== answers.length ||
      answers.length !== assignment.items.length
    ) {
      throw new ConflictDomainException(ANSWERS_DO_NOT_MATCH);
    }

    const stored = assignment.items.map((item) => {
      const answer = byItem.get(item.id);
      if (!answer) throw new ConflictDomainException(ANSWERS_DO_NOT_MATCH);

      const value =
        typeof answer.value === 'string' ? answer.value.trim() : answer.value;
      const note = answer.note?.trim() || null;

      if (answer.notApplicable) {
        if (value !== undefined) {
          throw new ConflictDomainException(ANSWERS_DO_NOT_MATCH);
        }
      } else if (!fitsType(item.type, value)) {
        throw new ConflictDomainException(ANSWERS_DO_NOT_MATCH);
      }

      // Free text is its own note.
      if (item.type === 'TEXT' && note !== null) {
        throw new ConflictDomainException(ANSWERS_DO_NOT_MATCH);
      }

      return {
        itemId: item.id,
        notApplicable: answer.notApplicable === true,
        value: answer.notApplicable ? null : (value as AnswerValue),
        note,
      };
    });

    const inspection = Inspection.create({
      organizationId,
      assignmentId: assignment.id,
      result,
      inspectorId: inspector.id,
      inspectorName: inspector.name,
      answers: stored,
    });

    await this.inspectionsRepository.create(inspection);

    return { inspection };
  }
}
