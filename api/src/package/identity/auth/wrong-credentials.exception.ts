import { DomainException } from '@/package/shared/lib/exception/domain.exception';

export class WrongCredentialsException extends DomainException {
  constructor() {
    super('Wrong credentials');
  }
}
