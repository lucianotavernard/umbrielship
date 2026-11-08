import { Customer } from '@/package/customer/customer/customer.entity.js';
import { VesselDetail } from '@/package/customer/vessel/vessel-detail.entity.js';
import { Vessel } from '@/package/customer/vessel/vessel.entity.js';
import { IVesselsRepository } from '@/package/customer/vessel/contracts/vessel-repository.contract.js';
import { Paginate } from '@/package/shared/lib/type/paginate.js';

import { InMemoryCustomersRepository } from '@test/repositories/in-memory-customers-repository.js';

export class InMemoryVesselsRepository implements IVesselsRepository {
  public items: Vessel[] = [];

  constructor(private readonly customers: InMemoryCustomersRepository) {}

  private of(organizationId: string) {
    return this.items.filter((item) => item.organizationId === organizationId);
  }

  async findById(
    organizationId: string,
    id: string,
  ): Promise<VesselDetail | null> {
    const vessel = this.of(organizationId).find((item) => item.id === id);

    if (!vessel) return null;

    const customer: Customer | undefined = this.customers.items.find(
      (item) => item.id === vessel.customerId,
    );

    if (!customer) {
      throw new Error(`in-memory: customer ${vessel.customerId} is not seeded`);
    }

    return VesselDetail.create(
      {
        organizationId: vessel.organizationId,
        name: vessel.name,
        type: vessel.type,
        length: vessel.length,
        imoNumber: vessel.imoNumber,
        customerId: vessel.customerId,
        customer,
      },
      vessel.id,
    );
  }

  async findByImoNumber(
    organizationId: string,
    imoNumber: string,
  ): Promise<Vessel | null> {
    return (
      this.of(organizationId).find(
        (vessel) => vessel.imoNumber.toLowerCase() === imoNumber.toLowerCase(),
      ) ?? null
    );
  }

  async findMany(
    organizationId: string,
    take: number,
    skip: number,
  ): Promise<Paginate<Vessel>> {
    const owned = this.of(organizationId);

    return { data: owned.slice(skip, skip + take), total: owned.length };
  }

  async findManyByCustomerId(
    organizationId: string,
    customerId: string,
    take: number,
    skip: number,
  ): Promise<Paginate<Vessel>> {
    const owned = this.of(organizationId).filter(
      (vessel) => vessel.customerId === customerId,
    );

    return { data: owned.slice(skip, skip + take), total: owned.length };
  }

  async create(vessel: Vessel): Promise<void> {
    this.items.push(vessel);
  }

  async save(vessel: Vessel): Promise<void> {
    const stored = this.items.find((item) => item.id === vessel.id);

    // The Prisma repository updates only name, type and length.
    if (stored) {
      stored.name = vessel.name;
      stored.type = vessel.type;
      stored.length = vessel.length;
    }
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((vessel) => vessel.id !== id);
  }
}
