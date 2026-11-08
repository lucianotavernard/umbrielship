import { IOrganizationsRepository } from '@/package/identity/organization/contracts/organization-repository.contract';
import { Organization } from '@/package/identity/organization/organization.entity';
import { AlreadyExistsDomainException } from '@/package/shared/lib/exception/already-exists-domain.exception';

const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

export class InMemoryOrganizationsRepository implements IOrganizationsRepository {
  public items: Organization[] = [];

  private sorted() {
    return [...this.items].sort((a, b) => a.name.localeCompare(b.name));
  }

  async findAll(page: number, perPage: number) {
    return this.sorted().slice((page - 1) * perPage, page * perPage);
  }

  async count() {
    return this.items.length;
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
}
