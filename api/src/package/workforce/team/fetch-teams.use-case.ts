import { Injectable } from '@nestjs/common';

import {
  ITeamsRepository,
  TeamWithStaffCount,
} from './contracts/team-repository.contract.js';

type FetchTeamsUseCaseRequest = {
  organizationId: string;
};

type FetchTeamsUseCaseResponse = {
  teams: TeamWithStaffCount[];
};

@Injectable()
export class FetchTeamsUseCase {
  constructor(private readonly teamsRepository: ITeamsRepository) {}

  async handle({
    organizationId,
  }: FetchTeamsUseCaseRequest): Promise<FetchTeamsUseCaseResponse> {
    return { teams: await this.teamsRepository.findMany(organizationId) };
  }
}
