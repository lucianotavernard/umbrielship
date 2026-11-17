import { Customer } from '@/package/customer/customer/customer.entity.js';
import { CustomerSummary } from '@/package/customer/customer/customer-summary.entity.js';
import type { Vessel } from '@/package/customer/vessel/vessel.entity.js';
import { ICustomersRepository } from '@/package/customer/customer/contracts/customer-repository.contract.js';
import { Paginate } from '@/package/shared/lib/type/paginate.js';

export class InMemoryCustomersRepository implements ICustomersRepository {
  public items: Customer[] = [];

  /** The Vessels `findMany` counts; an InMemoryVesselsRepository built on this fake links itself here. */
  public vessels: { items: Vessel[] } = { items: [] };

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
    take?: number,
    skip?: number,
  ): Promise<Paginate<CustomerSummary>> {
    const owned = this.of(organizationId);
    const page =
      take === undefined ? owned : owned.slice(skip ?? 0, (skip ?? 0) + take);

    return {
      data: page.map(({ id, ...props }) =>
        CustomerSummary.create(
          {
            ...props,
            vesselCount: this.vessels.items.filter(
              (vessel) =>
                vessel.organizationId === organizationId &&
                vessel.customerId === id,
            ).length,
          },
          id,
        ),
      ),
      total: owned.length,
    };
  }

  async create(customer: Customer): Promise<void> {
    this.items.push(customer);
  }

  async save(customer: Customer): Promise<void> {
    const index = this.items.findIndex((item) => item.id === customer.id);
    if (index >= 0) this.items[index] = customer;
  }

  async delete(organizationId: string, id: string): Promise<void> {
    this.items = this.items.filter(
      (customer) =>
        !(customer.id === id && customer.organizationId === organizationId),
    );
  }
}
