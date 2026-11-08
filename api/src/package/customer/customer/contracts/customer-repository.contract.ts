import { Paginate } from '@/package/shared/lib/type/paginate';
import { Customer } from '../customer.entity';

export abstract class ICustomersRepository {
  abstract findById(id: string): Promise<Customer | null>;
  abstract findByEmail(email: string): Promise<Customer | null>;
  abstract findMany(take: number, skip: number): Promise<Paginate<Customer>>;
  abstract create(customer: Customer): Promise<void>;
  abstract save(customer: Customer): Promise<void>;
}
