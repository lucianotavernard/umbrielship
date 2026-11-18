import { Injectable } from '@nestjs/common';

import { AlreadyExistsDomainException } from '@/package/shared/lib/exception/already-exists-domain.exception.js';
import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { ITeamsRepository } from './contracts/team-repository.contract.js';
import { Team } from './team.entity.js';

type UpdateTeamUseCaseRequest = {
  organizationId: string;
  id: string;
  name: string;
  specialty: string;
};

type UpdateTeamUseCaseResponse = {
  team: Team;
};

@Injectable()
export class UpdateTeamUseCase {
  constructor(private readonly teamsRepository: ITeamsRepository) {}

  async handle(
    input: UpdateTeamUseCaseRequest,
  ): Promise<UpdateTeamUseCaseResponse> {
    const existing = await this.teamsRepository.findById(
      input.organizationId,
      input.id,
    );

    if (!existing) {
      throw new NotFoundDomainException('Team not found');
    }

    const name = input.name.trim();
    const sameName = await this.teamsRepository.findByName(
      input.organizationId,
      name,
    );

    if (sameName && sameName.id !== existing.id) {
      throw new AlreadyExistsDomainException('Team name already exists');
    }

    const team = Team.create(
      {
        organizationId: input.organizationId,
        name,
        specialty: input.specialty.trim(),
      },
      existing.id,
    );

    await this.teamsRepository.save(team);

    return { team };
  }
}
