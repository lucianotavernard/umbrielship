import { Staff } from '../staff.entity.js';

export abstract class IStaffRepository {
  abstract findById(organizationId: string, id: string): Promise<Staff | null>;
  /** Compared without case. */
  abstract findByName(
    organizationId: string,
    name: string,
  ): Promise<Staff | null>;
  /** Compared without case. */
  abstract findByEmail(
    organizationId: string,
    email: string,
  ): Promise<Staff | null>;
  /** Every Staff of the Organization, by name. */
  abstract findMany(organizationId: string): Promise<Staff[]>;
  abstract create(staff: Staff): Promise<void>;
  abstract save(staff: Staff): Promise<void>;
  abstract delete(organizationId: string, id: string): Promise<void>;
}
