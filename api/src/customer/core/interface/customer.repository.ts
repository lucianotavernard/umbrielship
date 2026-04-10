import { Paginate } from '@/shared/lib/core/type/paginate';
import { CustomerEntity } from '../entity/customer.entity';

export abstract class CustomerRepository {
  abstract findById(id: string): Promise<CustomerEntity | null>;
  abstract findByEmail(email: string): Promise<CustomerEntity | null>;
  abstract findMany(take: number, skip: number): Promise<Paginate<CustomerEntity>>;
  abstract create(customer: CustomerEntity): Promise<void>;
  abstract save(customer: CustomerEntity): Promise<void>;
}
