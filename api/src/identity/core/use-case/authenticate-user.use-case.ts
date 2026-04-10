import { Injectable } from '@nestjs/common';

import { HashComparer } from '@/shared/module/cryptography/interface/hash-comparer';
import { Encrypter } from '@/shared/module/cryptography/interface/encrypter';

import { WrongCredentialsException } from '@/identity/core/exception/wrong-credentials.exception';
import { UserRepository } from '@/identity/core/interface/user.repository';

type AuthenticateUserUseCaseRequest = {
  email: string;
  password: string;
};

type AuthenticateUserUseCaseResponse = {
  accessToken: string;
};

@Injectable()
export class AuthenticateUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private hashComparer: HashComparer,
    private encrypter: Encrypter,
  ) {}

  async handle({
    email,
    password,
  }: AuthenticateUserUseCaseRequest): Promise<AuthenticateUserUseCaseResponse> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new WrongCredentialsException();
    }

    const isPasswordValid = await this.hashComparer.compare(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new WrongCredentialsException();
    }

    const accessToken = await this.encrypter.encrypt({
      sub: user.id
    });

    return {
      accessToken,
    };
  }
}
