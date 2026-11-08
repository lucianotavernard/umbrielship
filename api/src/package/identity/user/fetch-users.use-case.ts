import { Injectable } from '@nestjs/common';

import { IUsersRepository } from './contracts/user-repository.contract.js';

type FetchUsersUseCaseRequest = {
  notInOrganizationId: string;
  page: number;
  perPage: number;
};

type FetchUsersUseCaseResponse = {
  users: {
    id: string;
    name: string;
    email: string;
  }[];
  total: number;
};

@Injectable()
export class FetchUsersUseCase {
  constructor(private usersRepository: IUsersRepository) {}

  async handle({
    notInOrganizationId,
    page,
    perPage,
  }: FetchUsersUseCaseRequest): Promise<FetchUsersUseCaseResponse> {
    const users = await this.usersRepository.findManyOutsideOrganization(
      notInOrganizationId,
      page,
      perPage,
    );
    const total =
      await this.usersRepository.countOutsideOrganization(notInOrganizationId);

    return {
      users: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
      })),
      total,
    };
  }
}
