import { beforeEach, describe, expect, it } from 'vitest';

import { NotFoundDomainException } from '@/shared/lib/core/exception/not-found-domain.exception';

import { makeUser } from '../../../../test/factory';
import { InMemoryUsersRepository } from '../../../../test/repositories/in-memory-users-repository';
import { GetUserByIdUseCase } from './get-user-by-id.use-case';

let users: InMemoryUsersRepository;
let sut: GetUserByIdUseCase;

describe('GetUserByIdUseCase', () => {
  beforeEach(() => {
    users = new InMemoryUsersRepository();
    sut = new GetUserByIdUseCase(users);
  });

  it('[C16] returns exactly id, name and email, never the password', async () => {
    users.items.push(
      makeUser({
        id: 'u1',
        name: 'Maria Souza',
        email: 'maria@umbrielship.test',
      }),
    );

    const { user } = await sut.handle({ id: 'u1' });

    expect(user).toEqual({
      id: 'u1',
      name: 'Maria Souza',
      email: 'maria@umbrielship.test',
    });
  });

  it('[C16] throws NotFoundDomainException for an unknown id', async () => {
    const promise = sut.handle({ id: 'missing' });

    await expect(promise).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(promise).rejects.toThrow('User not found');
  });
});
