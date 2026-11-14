import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { IInspectionTemplatesRepository } from '../inspection-template/contracts/inspection-template-repository.contract.js';
import { IWorkOrderServicesRepository } from '../work-order-service/contracts/work-order-service-repository.contract.js';
import { IWorkOrdersRepository } from '../work-order/contracts/work-order-repository.contract.js';
import { IInspectionAssignmentsRepository } from './contracts/inspection-assignment-repository.contract.js';
import { InspectionAssignment } from './inspection-assignment.entity.js';

type AssignInspectionTemplateUseCaseRequest = {
  organizationId: string;
  workOrderId: string;
  templateId: string;
  serviceId?: string;
  assignedBy: string;
};

type AssignInspectionTemplateUseCaseResponse = {
  inspectionAssignment: InspectionAssignment;
};

@Injectable()
export class AssignInspectionTemplateUseCase {
  constructor(
    private readonly workOrdersRepository: IWorkOrdersRepository,
    private readonly workOrderServicesRepository: IWorkOrderServicesRepository,
    private readonly inspectionTemplatesRepository: IInspectionTemplatesRepository,
    private readonly inspectionAssignmentsRepository: IInspectionAssignmentsRepository,
  ) {}

  async handle({
    organizationId,
    workOrderId,
    templateId,
    serviceId,
    assignedBy,
  }: AssignInspectionTemplateUseCaseRequest): Promise<AssignInspectionTemplateUseCaseResponse> {
    const workOrder = await this.workOrdersRepository.findById(
      organizationId,
      workOrderId,
    );

    if (!workOrder) {
      throw new NotFoundDomainException('Work order not found');
    }

    let service: InspectionAssignment['service'] = null;

    if (serviceId) {
      const found = await this.workOrderServicesRepository.findById(
        organizationId,
        serviceId,
      );

      if (!found || found.workOrderId !== workOrder.id) {
        throw new NotFoundDomainException('Work order service not found');
      }

      service = { id: found.id, name: found.name };
    }

    const template = await this.inspectionTemplatesRepository.findById(
      organizationId,
      templateId,
    );

    if (!template) {
      throw new NotFoundDomainException('Inspection template not found');
    }

    const inspectionAssignment = InspectionAssignment.create({
      organizationId,
      workOrderId: workOrder.id,
      service,
      templateName: template.name,
      labels: template.items.map((item) => item.label),
      assignedBy,
    });

    await this.inspectionAssignmentsRepository.create(inspectionAssignment);

    return { inspectionAssignment };
  }
}
