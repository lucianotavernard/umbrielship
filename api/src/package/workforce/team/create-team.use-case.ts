import { Injectable } from '@nestjs/common';

import { AlreadyExistsDomainException } from '@/package/shared/lib/exception/already-exists-domain.exception.js';

import { ITeamsRepository } from './contracts/team-repository.contract.js';
import { Team } from './team.entity.js';

type CreateTeamUseCaseRequest = {
  organizationId: string;
  name: string;
  specialty: string;
};

type CreateTeamUseCaseResponse = {
  team: Team;
};

@Injectable()
export class CreateTeamUseCase {
  constructor(private readonly teamsRepository: ITeamsRepository) {}

  async handle(
    input: CreateTeamUseCaseRequest,
  ): Promise<CreateTeamUseCaseResponse> {
    const name = input.name.trim();

    if (await this.teamsRepository.findByName(input.organizationId, name)) {
      throw new AlreadyExistsDomainException('Team name already exists');
    }

    const team = Team.create({
      organizationId: input.organizationId,
      name,
      specialty: input.specialty.trim(),
    });

    await this.teamsRepository.create(team);

    return { team };
  }
}
