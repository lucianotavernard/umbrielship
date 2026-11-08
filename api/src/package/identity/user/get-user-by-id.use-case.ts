import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception';
import { IUsersRepository } from './contracts/user-repository.contract';

type GetUserByIdUseCaseRequest = {
  id: string;
};

type GetUserByIdUseCaseResponse = {
  user: {
    id: string;
    name: string;
    email: string;
  };
};

@Injectable()
export class GetUserByIdUseCase {
  constructor(private usersRepository: IUsersRepository) {}

  async handle({
    id,
  }: GetUserByIdUseCaseRequest): Promise<GetUserByIdUseCaseResponse> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundDomainException('User not found');
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }
}
