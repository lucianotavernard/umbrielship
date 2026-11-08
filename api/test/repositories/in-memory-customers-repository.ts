import { CustomerEntity } from '@/customer/core/entity/customer.entity';
import { CustomerRepository } from '@/customer/core/interface/customer.repository';
import { Paginate } from '@/shared/lib/core/type/paginate';

export class InMemoryCustomersRepository implements CustomerRepository {
  public items: CustomerEntity[] = [];

  async findById(id: string): Promise<CustomerEntity | null> {
    return this.items.find((customer) => customer.id === id) ?? null;
  }

  async findByEmail(email: string): Promise<CustomerEntity | null> {
    return this.items.find((customer) => customer.email === email) ?? null;
  }

  async findMany(
    take: number,
    skip: number,
  ): Promise<Paginate<CustomerEntity>> {
    return {
      data: this.items.slice(skip, skip + take),
      total: this.items.length,
    };
  }

  async create(customer: CustomerEntity): Promise<void> {
    this.items.push(customer);
  }

  async save(customer: CustomerEntity): Promise<void> {
    const index = this.items.findIndex((item) => item.id === customer.id);
    if (index >= 0) this.items[index] = customer;
  }
}
