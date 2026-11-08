import { Customer } from '@/package/customer/customer/customer.entity';
import { VesselDetail } from '@/package/customer/vessel/vessel-detail.entity';
import { Vessel } from '@/package/customer/vessel/vessel.entity';
import { IVesselsRepository } from '@/package/customer/vessel/contracts/vessel-repository.contract';
import { Paginate } from '@/package/shared/lib/type/paginate';

import { InMemoryCustomersRepository } from '@test/repositories/in-memory-customers-repository';

export class InMemoryVesselsRepository implements IVesselsRepository {
  public items: Vessel[] = [];

  constructor(private readonly customers: InMemoryCustomersRepository) {}

  async findById(id: string): Promise<VesselDetail | null> {
    const vessel = this.items.find((item) => item.id === id);

    if (!vessel) return null;

    const customer: Customer | undefined = this.customers.items.find(
      (item) => item.id === vessel.customerId,
    );

    if (!customer) {
      throw new Error(`in-memory: customer ${vessel.customerId} is not seeded`);
    }

    return VesselDetail.create(
      {
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

  async findByImoNumber(imoNumber: string): Promise<Vessel | null> {
    return this.items.find((vessel) => vessel.imoNumber === imoNumber) ?? null;
  }

  async findMany(take: number, skip: number): Promise<Paginate<Vessel>> {
    return {
      data: this.items.slice(skip, skip + take),
      total: this.items.length,
    };
  }

  async findManyByCustomerId(
    customerId: string,
    take: number,
    skip: number,
  ): Promise<Paginate<Vessel>> {
    const owned = this.items.filter(
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
