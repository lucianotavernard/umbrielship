import { DomainException } from '@/package/shared/lib/exception/domain.exception.js';

export class WrongCredentialsException extends DomainException {
  constructor() {
    super('Wrong credentials');
  }
}
