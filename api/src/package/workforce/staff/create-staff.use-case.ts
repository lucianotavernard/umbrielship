import { Injectable } from '@nestjs/common';

import { AlreadyExistsDomainException } from '@/package/shared/lib/exception/already-exists-domain.exception.js';
import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { ITeamsRepository } from '../team/contracts/team-repository.contract.js';
import { IStaffRepository } from './contracts/staff-repository.contract.js';
import { Staff } from './staff.entity.js';

type CreateStaffUseCaseRequest = {
  organizationId: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  teamId?: string | null;
};

type CreateStaffUseCaseResponse = {
  staff: Staff;
};

@Injectable()
export class CreateStaffUseCase {
  constructor(
    private readonly staffRepository: IStaffRepository,
    private readonly teamsRepository: ITeamsRepository,
  ) {}

  async handle(
    input: CreateStaffUseCaseRequest,
  ): Promise<CreateStaffUseCaseResponse> {
    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();
    const teamId = input.teamId ?? null;

    if (
      teamId &&
      !(await this.teamsRepository.findById(input.organizationId, teamId))
    ) {
      throw new NotFoundDomainException('Team not found');
    }

    if (await this.staffRepository.findByName(input.organizationId, name)) {
      throw new AlreadyExistsDomainException('Staff name already exists');
    }

    if (await this.staffRepository.findByEmail(input.organizationId, email)) {
      throw new AlreadyExistsDomainException('Staff email already exists');
    }

    const staff = Staff.create({
      organizationId: input.organizationId,
      name,
      specialty: input.specialty.trim(),
      email,
      phone: input.phone.trim(),
      teamId,
    });

    await this.staffRepository.create(staff);

    return { staff };
  }
}
