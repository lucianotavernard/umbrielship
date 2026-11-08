import { Paginate } from '@/package/shared/lib/type/paginate';

import { Vessel } from '../vessel.entity';
import { VesselDetail } from '../vessel-detail.entity';

export abstract class IVesselsRepository {
  abstract findById(id: string): Promise<VesselDetail | null>;
  abstract findByImoNumber(imoNumber: string): Promise<Vessel | null>;
  abstract findMany(take: number, skip: number): Promise<Paginate<Vessel>>;
  abstract findManyByCustomerId(
    customerId: string,
    take: number,
    skip: number,
  ): Promise<Paginate<Vessel>>;
  abstract create(vessel: Vessel): Promise<void>;
  abstract save(vessel: Vessel): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
