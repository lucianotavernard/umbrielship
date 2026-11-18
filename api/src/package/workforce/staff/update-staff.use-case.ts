import { Injectable } from '@nestjs/common';

import { AlreadyExistsDomainException } from '@/package/shared/lib/exception/already-exists-domain.exception.js';
import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { ITeamsRepository } from '../team/contracts/team-repository.contract.js';
import { IStaffRepository } from './contracts/staff-repository.contract.js';
import { Staff } from './staff.entity.js';

type UpdateStaffUseCaseRequest = {
  organizationId: string;
  id: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  teamId?: string | null;
};

type UpdateStaffUseCaseResponse = {
  staff: Staff;
};

// A full replace, under the create's rules; its own name and email are not a conflict.
@Injectable()
export class UpdateStaffUseCase {
  constructor(
    private readonly staffRepository: IStaffRepository,
    private readonly teamsRepository: ITeamsRepository,
  ) {}

  async handle(
    input: UpdateStaffUseCaseRequest,
  ): Promise<UpdateStaffUseCaseResponse> {
    const existing = await this.staffRepository.findById(
      input.organizationId,
      input.id,
    );

    if (!existing) {
      throw new NotFoundDomainException('Staff not found');
    }

    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();
    const teamId = input.teamId ?? null;

    if (
      teamId &&
      !(await this.teamsRepository.findById(input.organizationId, teamId))
    ) {
      throw new NotFoundDomainException('Team not found');
    }

    const sameName = await this.staffRepository.findByName(
      input.organizationId,
      name,
    );
    if (sameName && sameName.id !== existing.id) {
      throw new AlreadyExistsDomainException('Staff name already exists');
    }

    const sameEmail = await this.staffRepository.findByEmail(
      input.organizationId,
      email,
    );
    if (sameEmail && sameEmail.id !== existing.id) {
      throw new AlreadyExistsDomainException('Staff email already exists');
    }

    const staff = Staff.create(
      {
        organizationId: input.organizationId,
        name,
        specialty: input.specialty.trim(),
        email,
        phone: input.phone.trim(),
        teamId,
      },
      existing.id,
    );

    await this.staffRepository.save(staff);

    return { staff };
  }
}
