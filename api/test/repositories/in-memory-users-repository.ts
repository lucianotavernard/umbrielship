import { IUsersRepository } from '@/package/identity/user/contracts/user-repository.contract.js';
import { Role, User } from '@/package/identity/user/user.entity.js';
import { AlreadyExistsDomainException } from '@/package/shared/lib/exception/already-exists-domain.exception.js';

const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

export class InMemoryUsersRepository implements IUsersRepository {
  public items: User[] = [];

  async findByEmail(email: string): Promise<User | null> {
    return this.items.find((user) => same(user.email, email)) ?? null;
  }

  async findById(id: string): Promise<User | null> {
    return this.items.find((user) => user.id === id) ?? null;
  }

  private members(organizationId: string) {
    return this.items.filter((user) =>
      user.memberships.some((m) => m.organizationId === organizationId),
    );
  }

  private outside(organizationId: string) {
    return this.items.filter(
      (user) =>
        !user.memberships.some((m) => m.organizationId === organizationId),
    );
  }

  async findManyByOrganization(
    organizationId: string,
    page: number,
    perPage: number,
  ) {
    return this.members(organizationId).slice(
      (page - 1) * perPage,
      page * perPage,
    );
  }

  async countByOrganization(organizationId: string) {
    return this.members(organizationId).length;
  }

  async countByOrganizationAndRole(organizationId: string, role: Role) {
    return this.members(organizationId).filter((user) =>
      user.memberships.some(
        (m) => m.organizationId === organizationId && m.role === role,
      ),
    ).length;
  }

  async findManyOutsideOrganization(
    organizationId: string,
    page: number,
    perPage: number,
  ) {
    return this.outside(organizationId).slice(
      (page - 1) * perPage,
      page * perPage,
    );
  }

  async countOutsideOrganization(organizationId: string) {
    return this.outside(organizationId).length;
  }

  async save(user: User): Promise<void> {
    if (this.items.some((item) => same(item.email, user.email))) {
      throw new AlreadyExistsDomainException('User already exists');
    }
    this.items.push(user);
  }

  async update(user: User): Promise<void> {
    const index = this.items.findIndex((item) => item.id === user.id);
    if (index >= 0) this.items[index] = user;
  }
}
