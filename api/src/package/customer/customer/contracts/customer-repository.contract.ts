import { Paginate } from '@/package/shared/lib/type/paginate.js';
import { Customer } from '../customer.entity.js';
import { CustomerSummary } from '../customer-summary.entity.js';

export abstract class ICustomersRepository {
  abstract findById(
    organizationId: string,
    id: string,
  ): Promise<Customer | null>;
  abstract findByEmail(
    organizationId: string,
    email: string,
  ): Promise<Customer | null>;
  /** Every Customer of the Organization when `take` and `skip` are not given. */
  abstract findMany(
    organizationId: string,
    take?: number,
    skip?: number,
  ): Promise<Paginate<CustomerSummary>>;
  abstract create(customer: Customer): Promise<void>;
  abstract save(customer: Customer): Promise<void>;
  abstract delete(organizationId: string, id: string): Promise<void>;
}
