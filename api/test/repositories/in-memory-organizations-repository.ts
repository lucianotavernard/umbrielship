import { IOrganizationsRepository } from '@/package/identity/organization/contracts/organization-repository.contract.js';
import { Organization } from '@/package/identity/organization/organization.entity.js';
import { AlreadyExistsDomainException } from '@/package/shared/lib/exception/already-exists-domain.exception.js';

const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

export class InMemoryOrganizationsRepository implements IOrganizationsRepository {
  public items: Organization[] = [];

  private sorted(search?: string) {
    const term = search?.trim().toLowerCase() ?? '';
    return [...this.items]
      .filter(
        (item) =>
          !term ||
          item.name.toLowerCase().includes(term) ||
          item.email.toLowerCase().includes(term),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async findAll(page: number, perPage: number, search?: string) {
    return this.sorted(search).slice((page - 1) * perPage, page * perPage);
  }

  async count(search?: string) {
    return this.sorted(search).length;
  }

  async findById(id: string) {
    return this.items.find((organization) => organization.id === id) ?? null;
  }

  async findByName(name: string) {
    return (
      this.items.find((organization) => same(organization.name, name)) ?? null
    );
  }

  async findByEmail(email: string) {
    return (
      this.items.find((organization) => same(organization.email, email)) ?? null
    );
  }

  async save(organization: Organization): Promise<void> {
    if (
      this.items.some(
        (item) =>
          same(item.name, organization.name) ||
          same(item.email, organization.email),
      )
    ) {
      throw new AlreadyExistsDomainException('Organization already exists');
    }
    this.items.push(organization);
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((organization) => organization.id !== id);
  }
}
