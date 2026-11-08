import { Injectable } from '@nestjs/common';

import { Encrypter } from '@/package/shared/module/cryptography/contracts/encrypter.js';
import { Hasher } from '@/package/shared/module/cryptography/contracts/hasher.js';

import { IUsersRepository } from '../user/contracts/user-repository.contract.js';
import { WrongCredentialsException } from './wrong-credentials.exception.js';

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
    private usersRepository: IUsersRepository,
    private encrypter: Encrypter,
    private hasher: Hasher,
  ) {}

  async handle({
    email,
    password,
  }: AuthenticateUserUseCaseRequest): Promise<AuthenticateUserUseCaseResponse> {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      throw new WrongCredentialsException();
    }

    const isPasswordValid = await this.hasher.compare(password, user.password);

    if (!isPasswordValid) {
      throw new WrongCredentialsException();
    }

    const accessToken = await this.encrypter.encrypt({
      sub: user.id,
    });

    return {
      accessToken,
    };
  }
}
