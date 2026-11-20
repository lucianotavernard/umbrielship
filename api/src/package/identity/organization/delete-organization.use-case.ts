import { Injectable } from '@nestjs/common';

import { CustomerFacade } from '@/package/customer/customer.facade.js';
import { ConflictDomainException } from '@/package/shared/lib/exception/conflict-domain.exception.js';
import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';
import { WorkOrderFacade } from '@/package/work-order/work-order.facade.js';
import { WorkforceFacade } from '@/package/workforce/workforce.facade.js';

import { IUsersRepository } from '../user/contracts/user-repository.contract.js';
import { IOrganizationsRepository } from './contracts/organization-repository.contract.js';

type DeleteOrganizationUseCaseRequest = {
  id: string;
};

/**
 * Deletes an Organization that holds no records (AD-110): no Customer, WorkOrder, inspection
 * template, Staff or Team. Its Memberships and Invitations go with it, and a member it was active
 * for moves to the first Organization it still belongs to. The internal Organization stays.
 */
@Injectable()
export class DeleteOrganizationUseCase {
  constructor(
    private organizationsRepository: IOrganizationsRepository,
    private usersRepository: IUsersRepository,
    private customerFacade: CustomerFacade,
    private workOrderFacade: WorkOrderFacade,
    private workforceFacade: WorkforceFacade,
  ) {}

  async handle({ id }: DeleteOrganizationUseCaseRequest): Promise<void> {
    const organization = await this.organizationsRepository.findById(id);
    if (!organization) {
      throw new NotFoundDomainException('Organization not found');
    }
    if (organization.isInternal) {
      throw new ConflictDomainException(
        'The internal Organization cannot be deleted',
      );
    }

    const records = await Promise.all([
      this.customerFacade.hasRecords(id),
      this.workOrderFacade.hasRecords(id),
      this.workforceFacade.hasRecords(id),
    ]);
    if (records.some(Boolean)) {
      throw new ConflictDomainException('Organization has records');
    }

    const memberCount = await this.usersRepository.countByOrganization(id);
    const members = memberCount
      ? await this.usersRepository.findManyByOrganization(id, 1, memberCount)
      : [];

    await this.organizationsRepository.delete(id);

    for (const member of members) {
      member.memberships = member.memberships.filter(
        (membership) => membership.organizationId !== id,
      );
      if (member.activeOrganizationId !== id) continue;

      member.activeOrganizationId =
        member.memberships[0]?.organizationId ?? null;
      await this.usersRepository.update(member);
    }
  }
}
