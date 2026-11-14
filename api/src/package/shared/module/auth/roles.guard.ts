import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from '@/package/shared/module/auth/roles.js';
import type {
  Role,
  UserPayload,
} from '@/package/shared/module/auth/user-payload.js';

// Runs after JwtAuthGuard, before interceptors and pipes, so a refused Role
// reads nothing, validates nothing and stores no upload.
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<Role[] | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!roles) {
      return true;
    }

    const user = context
      .switchToHttp()
      .getRequest<{ user?: UserPayload }>().user;

    if (!user || !roles.includes(user.role)) {
      throw new ForbiddenException();
    }

    return true;
  }
}
