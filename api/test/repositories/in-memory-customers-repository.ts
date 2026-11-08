import { Customer } from '@/package/customer/customer/customer.entity';
import { ICustomersRepository } from '@/package/customer/customer/contracts/customer-repository.contract';
import { Paginate } from '@/package/shared/lib/type/paginate';

export class InMemoryCustomersRepository implements ICustomersRepository {
  public items: Customer[] = [];

  private of(organizationId: string) {
    return this.items.filter((item) => item.organizationId === organizationId);
  }

  async findById(organizationId: string, id: string): Promise<Customer | null> {
    return (
      this.of(organizationId).find((customer) => customer.id === id) ?? null
    );
  }

  async findByEmail(
    organizationId: string,
    email: string,
  ): Promise<Customer | null> {
    return (
      this.of(organizationId).find(
        (customer) => customer.email.toLowerCase() === email.toLowerCase(),
      ) ?? null
    );
  }

  async findMany(
    organizationId: string,
    take: number,
    skip: number,
  ): Promise<Paginate<Customer>> {
    const owned = this.of(organizationId);

    return { data: owned.slice(skip, skip + take), total: owned.length };
  }

  async create(customer: Customer): Promise<void> {
    this.items.push(customer);
  }

  async save(customer: Customer): Promise<void> {
    const index = this.items.findIndex((item) => item.id === customer.id);
    if (index >= 0) this.items[index] = customer;
  }
}
