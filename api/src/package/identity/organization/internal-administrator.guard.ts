import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import type { UserPayload } from '@/package/shared/module/auth/user-payload.js';

@Injectable()
export class InternalAdministratorGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const user = context
      .switchToHttp()
      .getRequest<{ user?: UserPayload }>().user;

    if (!user?.internal || user.role !== 'administrator') {
      throw new ForbiddenException();
    }

    return true;
  }
}
