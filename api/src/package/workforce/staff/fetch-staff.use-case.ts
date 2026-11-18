import { Injectable } from '@nestjs/common';

import { IStaffRepository } from './contracts/staff-repository.contract.js';
import { Staff } from './staff.entity.js';

type FetchStaffUseCaseRequest = {
  organizationId: string;
};

type FetchStaffUseCaseResponse = {
  staff: Staff[];
};

@Injectable()
export class FetchStaffUseCase {
  constructor(private readonly staffRepository: IStaffRepository) {}

  async handle({
    organizationId,
  }: FetchStaffUseCaseRequest): Promise<FetchStaffUseCaseResponse> {
    return { staff: await this.staffRepository.findMany(organizationId) };
  }
}
