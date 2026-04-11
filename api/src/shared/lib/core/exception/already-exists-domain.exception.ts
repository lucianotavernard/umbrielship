import { DomainException } from './domain.exception';

export class AlreadyExistsDomainException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}