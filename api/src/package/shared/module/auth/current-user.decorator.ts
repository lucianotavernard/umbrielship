import { ExecutionContext, createParamDecorator } from '@nestjs/common';

import type { UserPayload } from '@/package/shared/module/auth/user-payload';

export const CurrentUser = createParamDecorator(
  (_: never, context: ExecutionContext): UserPayload => {
    const request = context.switchToHttp().getRequest<{ user: UserPayload }>();
    return request.user;
  },
);
