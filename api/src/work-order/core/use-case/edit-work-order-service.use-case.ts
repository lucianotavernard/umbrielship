import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/shared/lib/core/exception/not-found-domain.exception';

import {
  WorkOrderServiceEntity,
  WorkOrderServiceStatus,
} from '../entity/work-order-service.entity';
import { WorkOrderServiceRepository } from '../interface/work-order-service.repository';

type EditWorkOrderServiceUseCaseRequest = {
  workOrderId: string;
  serviceId: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: WorkOrderServiceStatus;
};

type EditWorkOrderServiceUseCaseResponse = {
  service: WorkOrderServiceEntity;
};

@Injectable()
export class EditWorkOrderServiceUseCase {
  constructor(
    private readonly workOrderServiceRepository: WorkOrderServiceRepository,
  ) {}

  async handle(
    input: EditWorkOrderServiceUseCaseRequest,
  ): Promise<EditWorkOrderServiceUseCaseResponse> {
    const existing = await this.workOrderServiceRepository.findById(
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

    await this.workOrderServiceRepository.save(existing);

    return { service: existing };
  }
}
