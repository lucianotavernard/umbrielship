import { DomainException } from '@/shared/lib/core/exception/domain.exception';

export class CustomerAlreadyExistException extends DomainException {
  constructor() {
    super('Customer already exist');
  }
}
