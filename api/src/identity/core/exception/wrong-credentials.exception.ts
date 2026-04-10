import { DomainException } from '@/shared/lib/core/exception/domain.exception';

export class WrongCredentialsException extends DomainException {
  constructor() {
    super('Wrong credentials');
  }
}
