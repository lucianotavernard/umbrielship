import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { IUsersRepository } from '../user/contracts/user-repository.contract.js';

type SwitchOrganizationUseCaseRequest = {
  userId: string;
  organizationId: string;
};

@Injectable()
export class SwitchOrganizationUseCase {
  constructor(private usersRepository: IUsersRepository) {}

  async handle({
    userId,
    organizationId,
  }: SwitchOrganizationUseCaseRequest): Promise<void> {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new NotFoundDomainException('User not found');

    // An Organization the User does not belong to reads as missing, whether it exists or not.
    const isMember = user.memberships.some(
      (membership) => membership.organizationId === organizationId,
    );
    if (!isMember) throw new NotFoundDomainException('Organization not found');

    if (user.activeOrganizationId === organizationId) return;

    user.activeOrganizationId = organizationId;
    await this.usersRepository.update(user);
  }
}
