import { Customer } from '@/package/customer/customer/customer.entity';
import { ICustomersRepository } from '@/package/customer/customer/contracts/customer-repository.contract';
import { Paginate } from '@/package/shared/lib/type/paginate';

export class InMemoryCustomersRepository implements ICustomersRepository {
  public items: Customer[] = [];

  async findById(id: string): Promise<Customer | null> {
    return this.items.find((customer) => customer.id === id) ?? null;
  }

  async findByEmail(email: string): Promise<Customer | null> {
    return this.items.find((customer) => customer.email === email) ?? null;
  }

  async findMany(take: number, skip: number): Promise<Paginate<Customer>> {
    return {
      data: this.items.slice(skip, skip + take),
      total: this.items.length,
    };
  }

  async create(customer: Customer): Promise<void> {
    this.items.push(customer);
  }

  async save(customer: Customer): Promise<void> {
    const index = this.items.findIndex((item) => item.id === customer.id);
    if (index >= 0) this.items[index] = customer;
  }
}
