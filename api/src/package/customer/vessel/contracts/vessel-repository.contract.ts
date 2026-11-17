import { Paginate } from '@/package/shared/lib/type/paginate.js';

import { Vessel } from '../vessel.entity.js';
import { VesselDetail } from '../vessel-detail.entity.js';

export abstract class IVesselsRepository {
  abstract findById(
    organizationId: string,
    id: string,
  ): Promise<VesselDetail | null>;
  abstract findByImoNumber(
    organizationId: string,
    imoNumber: string,
  ): Promise<Vessel | null>;
  /** Every Vessel of the Organization when `take` and `skip` are not given. */
  abstract findMany(
    organizationId: string,
    take?: number,
    skip?: number,
  ): Promise<Paginate<Vessel>>;
  /** Every Vessel of the Customer when `take` and `skip` are not given. */
  abstract findManyByCustomerId(
    organizationId: string,
    customerId: string,
    take?: number,
    skip?: number,
  ): Promise<Paginate<Vessel>>;
  abstract create(vessel: Vessel): Promise<void>;
  abstract save(vessel: Vessel): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
