import { UserRepository } from '@/identity/core/interface/user.repository';
import { User } from '@/shared/module/prisma/generated/prisma/client';

export class InMemoryUsersRepository implements UserRepository {
  public items: User[] = [];

  async findByEmail(email: string): Promise<User | null> {
    return this.items.find((user) => user.email === email) ?? null;
  }

  async findById(id: string): Promise<User | null> {
    return this.items.find((user) => user.id === id) ?? null;
  }
}
