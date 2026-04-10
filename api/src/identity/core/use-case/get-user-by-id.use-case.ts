import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@/shared/lib/core/exception/not-found-domain.exception';
import { UserRepository } from '@/identity/core/interface/user.repository';

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
  constructor(private userRepository: UserRepository) {}

  async handle({
    id,
  }: GetUserByIdUseCaseRequest): Promise<GetUserByIdUseCaseResponse> {
    const user = await this.userRepository.findById(id);

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
