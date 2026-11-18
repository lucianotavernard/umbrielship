import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { IStaffRepository } from './contracts/staff-repository.contract.js';
import { Staff } from './staff.entity.js';

type GetStaffByIdUseCaseRequest = {
  organizationId: string;
  id: string;
};

type GetStaffByIdUseCaseResponse = {
  staff: Staff;
};

@Injectable()
export class GetStaffByIdUseCase {
  constructor(private readonly staffRepository: IStaffRepository) {}

  async handle({
    organizationId,
    id,
  }: GetStaffByIdUseCaseRequest): Promise<GetStaffByIdUseCaseResponse> {
    const staff = await this.staffRepository.findById(organizationId, id);

    if (!staff) {
      throw new NotFoundDomainException('Staff not found');
    }

    return { staff };
  }
}
