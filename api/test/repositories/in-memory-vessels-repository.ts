import { CustomerEntity } from '@/customer/core/entity/customer.entity';
import { VesselDetailEntity } from '@/customer/core/entity/vessel-detail.entity';
import { VesselEntity } from '@/customer/core/entity/vessel.entity';
import { VesselRepository } from '@/customer/core/interface/vessel.repository';
import { Paginate } from '@/shared/lib/core/type/paginate';

import { InMemoryCustomersRepository } from './in-memory-customers-repository';

export class InMemoryVesselsRepository implements VesselRepository {
  public items: VesselEntity[] = [];

  constructor(private readonly customers: InMemoryCustomersRepository) {}

  async findById(id: string): Promise<VesselDetailEntity | null> {
    const vessel = this.items.find((item) => item.id === id);

    if (!vessel) return null;

    const customer: CustomerEntity | undefined = this.customers.items.find(
      (item) => item.id === vessel.customerId,
    );

    if (!customer) {
      throw new Error(`in-memory: customer ${vessel.customerId} is not seeded`);
    }

    return new VesselDetailEntity(
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

  async findByImoNumber(imoNumber: string): Promise<VesselEntity | null> {
    return this.items.find((vessel) => vessel.imoNumber === imoNumber) ?? null;
  }

  async findMany(take: number, skip: number): Promise<Paginate<VesselEntity>> {
    return {
      data: this.items.slice(skip, skip + take),
      total: this.items.length,
    };
  }

  async findManyByCustomerId(
    customerId: string,
    take: number,
    skip: number,
  ): Promise<Paginate<VesselEntity>> {
    const owned = this.items.filter(
      (vessel) => vessel.customerId === customerId,
    );

    return { data: owned.slice(skip, skip + take), total: owned.length };
  }

  async create(vessel: VesselEntity): Promise<void> {
    this.items.push(vessel);
  }

  async save(vessel: VesselEntity): Promise<void> {
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
