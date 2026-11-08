import { Injectable } from '@nestjs/common';

import { AlreadyExistsDomainException } from '@/package/shared/lib/exception/already-exists-domain.exception';
import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception';
import { Hasher } from '@/package/shared/module/cryptography/contracts/hasher';

import { IOrganizationsRepository } from '../organization/contracts/organization-repository.contract';
import { IUsersRepository } from './contracts/user-repository.contract';
import { Role, User } from './user.entity';

type CreateUserUseCaseRequest = {
  name: string;
  email: string;
  password: string;
  role: Role;
  organizationId: string;
};

type CreateUserUseCaseResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
    organizationName: string;
  };
};

@Injectable()
export class CreateUserUseCase {
  constructor(
    private usersRepository: IUsersRepository,
    private organizationsRepository: IOrganizationsRepository,
    private hasher: Hasher,
  ) {}

  async handle(
    createUserDto: CreateUserUseCaseRequest,
  ): Promise<CreateUserUseCaseResponse> {
    const organization = await this.organizationsRepository.findById(
      createUserDto.organizationId,
    );
    if (!organization)
      throw new NotFoundDomainException('Organization not found');

    const emailExists = await this.usersRepository.findByEmail(
      createUserDto.email,
    );
    if (emailExists)
      throw new AlreadyExistsDomainException('User already exists');

    const user = User.create({
      name: createUserDto.name,
      email: createUserDto.email,
      password: await this.hasher.hash(createUserDto.password),
      activeOrganizationId: organization.id,
      memberships: [
        { organizationId: organization.id, role: createUserDto.role },
      ],
    });
    await this.usersRepository.save(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: createUserDto.role,
        organizationName: organization.name,
      },
    };
  }
}
