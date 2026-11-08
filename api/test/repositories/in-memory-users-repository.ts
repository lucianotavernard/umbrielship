import { IUsersRepository } from '@/package/identity/user/contracts/user-repository.contract';
import { User } from '@/package/identity/user/user.entity';

export class InMemoryUsersRepository implements IUsersRepository {
  public items: User[] = [];

  async findByEmail(email: string): Promise<User | null> {
    return this.items.find((user) => user.email === email) ?? null;
  }

  async findById(id: string): Promise<User | null> {
    return this.items.find((user) => user.id === id) ?? null;
  }
}
