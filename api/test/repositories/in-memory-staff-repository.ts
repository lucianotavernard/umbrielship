import { IStaffRepository } from '@/package/workforce/staff/contracts/staff-repository.contract.js';
import { Staff } from '@/package/workforce/staff/staff.entity.js';

// Names and emails compare without case, as the citext columns do.
const fold = (value: string) => value.toLowerCase();

export class InMemoryStaffRepository implements IStaffRepository {
  public items: Staff[] = [];

  private of(organizationId: string) {
    return this.items.filter((item) => item.organizationId === organizationId);
  }

  async findById(organizationId: string, id: string): Promise<Staff | null> {
    return this.of(organizationId).find((item) => item.id === id) ?? null;
  }

  async findByName(
    organizationId: string,
    name: string,
  ): Promise<Staff | null> {
    return (
      this.of(organizationId).find((item) => fold(item.name) === fold(name)) ??
      null
    );
  }

  async findByEmail(
    organizationId: string,
    email: string,
  ): Promise<Staff | null> {
    return (
      this.of(organizationId).find(
        (item) => fold(item.email) === fold(email),
      ) ?? null
    );
  }

  async findMany(organizationId: string): Promise<Staff[]> {
    return [...this.of(organizationId)].sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }

  async create(staff: Staff): Promise<void> {
    this.items.push(staff);
  }

  async save(staff: Staff): Promise<void> {
    const index = this.items.findIndex((item) => item.id === staff.id);
    this.items[index] = staff;
  }

  async delete(organizationId: string, id: string): Promise<void> {
    this.items = this.items.filter(
      (item) => !(item.id === id && item.organizationId === organizationId),
    );
  }
}
