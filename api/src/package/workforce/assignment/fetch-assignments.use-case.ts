import { Injectable } from '@nestjs/common';

import { Assignment } from './assignment.entity.js';
import { IAssignmentsRepository } from './contracts/assignment-repository.contract.js';

type FetchAssignmentsUseCaseRequest = {
  organizationId: string;
};

type FetchAssignmentsUseCaseResponse = {
  assignments: Assignment[];
};

@Injectable()
export class FetchAssignmentsUseCase {
  constructor(private readonly assignmentsRepository: IAssignmentsRepository) {}

  async handle({
    organizationId,
  }: FetchAssignmentsUseCaseRequest): Promise<FetchAssignmentsUseCaseResponse> {
    return {
      assignments: await this.assignmentsRepository.findMany(organizationId),
    };
  }
}
