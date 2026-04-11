import { Paginate } from '@/shared/lib/core/type/paginate';

import { VesselEntity } from '../entity/vessel.entity';
import { VesselDetailEntity } from '../entity/vessel-detail.entity';

export abstract class VesselRepository {
  abstract findById(id: string): Promise<VesselDetailEntity | null>;
  abstract findByImoNumber(imoNumber: string): Promise<VesselEntity | null>;
  abstract findMany(take: number, skip: number): Promise<Paginate<VesselEntity>>;
  abstract findManyByCustomerId(
    customerId: string,
    take: number,
    skip: number,
  ): Promise<Paginate<VesselEntity>>;
  abstract create(vessel: VesselEntity): Promise<void>;
  abstract save(vessel: VesselEntity): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
