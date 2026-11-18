import { Injectable } from '@nestjs/common';

import { ConflictDomainException } from '@/package/shared/lib/exception/conflict-domain.exception.js';
import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { IAssignmentsRepository } from '../assignment/contracts/assignment-repository.contract.js';
import { ITeamsRepository } from './contracts/team-repository.contract.js';

type DeleteTeamUseCaseRequest = {
  organizationId: string;
  id: string;
};

@Injectable()
export class DeleteTeamUseCase {
  constructor(
    private readonly teamsRepository: ITeamsRepository,
    private readonly assignmentsRepository: IAssignmentsRepository,
  ) {}

  async handle({
    organizationId,
    id,
  }: DeleteTeamUseCaseRequest): Promise<void> {
    const team = await this.teamsRepository.findById(organizationId, id);

    if (!team) {
      throw new NotFoundDomainException('Team not found');
    }

    // A Team that answers for a WorkOrderService stays (AD-064); otherwise its Staff lose it (AD-062).
    if (
      (await this.assignmentsRepository.countByTeamId(organizationId, id)) > 0
    ) {
      throw new ConflictDomainException('Team has Assignment');
    }

    await this.teamsRepository.delete(organizationId, id);
  }
}
