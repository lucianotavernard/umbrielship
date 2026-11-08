import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import {
  WorkOrderService,
  WorkOrderServiceStatus,
} from './work-order-service.entity.js';
import { IWorkOrderServicesRepository } from './contracts/work-order-service-repository.contract.js';

type EditWorkOrderServiceUseCaseRequest = {
  organizationId: string;
  workOrderId: string;
  serviceId: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: WorkOrderServiceStatus;
};

type EditWorkOrderServiceUseCaseResponse = {
  service: WorkOrderService;
};

@Injectable()
export class EditWorkOrderServiceUseCase {
  constructor(
    private readonly workOrderServicesRepository: IWorkOrderServicesRepository,
  ) {}

  async handle(
    input: EditWorkOrderServiceUseCaseRequest,
  ): Promise<EditWorkOrderServiceUseCaseResponse> {
    const existing = await this.workOrderServicesRepository.findById(
      input.organizationId,
      input.serviceId,
    );

    if (!existing || existing.workOrderId !== input.workOrderId) {
      throw new NotFoundDomainException('Work order service not found');
    }

    existing.name = input.name;
    existing.description = input.description;
    existing.startDate = input.startDate;
    existing.endDate = input.endDate;
    existing.status = input.status;

    await this.workOrderServicesRepository.save(existing);

    return { service: existing };
  }
}
