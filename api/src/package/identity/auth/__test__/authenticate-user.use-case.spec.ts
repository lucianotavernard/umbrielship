import { beforeEach, describe, expect, it } from 'vitest';

import { WrongCredentialsException } from '../wrong-credentials.exception';

import { FakeEncrypter } from '@test/cryptography/fake-encrypter';
import { FakeHasher } from '@test/cryptography/fake-hasher';
import { makeUser } from '@test/factory';
import { InMemoryUsersRepository } from '@test/repositories/in-memory-users-repository';
import { AuthenticateUserUseCase } from '../authenticate-user.use-case';

let users: InMemoryUsersRepository;
let sut: AuthenticateUserUseCase;

describe('AuthenticateUserUseCase', () => {
  beforeEach(() => {
    users = new InMemoryUsersRepository();
    sut = new AuthenticateUserUseCase(
      users,
      new FakeEncrypter(),
      new FakeHasher(),
    );
    users.items.push(
      makeUser({
        id: 'u1',
        email: 'maria@umbrielship.test',
        password: 'secret123-hashed',
      }),
    );
  });

  it('[C15] throws WrongCredentialsException for an unknown email', async () => {
    await expect(
      sut.handle({ email: 'nobody@umbrielship.test', password: 'secret123' }),
    ).rejects.toBeInstanceOf(WrongCredentialsException);
  });

  it('[C15] throws WrongCredentialsException for a wrong password', async () => {
    await expect(
      sut.handle({ email: 'maria@umbrielship.test', password: 'other' }),
    ).rejects.toBeInstanceOf(WrongCredentialsException);
  });

  it('[C15] returns an access token encrypted from { sub: user id }', async () => {
    const { accessToken } = await sut.handle({
      email: 'maria@umbrielship.test',
      password: 'secret123',
    });

    expect(accessToken).toBe(JSON.stringify({ sub: 'u1' }));
  });
});
