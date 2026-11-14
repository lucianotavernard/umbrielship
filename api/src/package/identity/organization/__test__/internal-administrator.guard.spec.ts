import { ForbiddenException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import type { UserPayload } from '@/package/shared/module/auth/user-payload.js';

import { InternalAdministratorGuard } from '../internal-administrator.guard.js';

const contextOf = (user?: Partial<UserPayload>) =>
  ({
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  }) as unknown as ExecutionContext;

describe('InternalAdministratorGuard', () => {
  const sut = new InternalAdministratorGuard();

  it('[C50] lets an internal administrator through', () => {
    expect(
      sut.canActivate(contextOf({ internal: true, role: 'administrator' })),
    ).toBe(true);
  });

  it('[C50] throws ForbiddenException for a member of a non-internal Organization', () => {
    expect(() =>
      sut.canActivate(contextOf({ internal: false, role: 'administrator' })),
    ).toThrow(ForbiddenException);
  });

  it('[C50] throws ForbiddenException for an internal operator', () => {
    expect(() =>
      sut.canActivate(contextOf({ internal: true, role: 'operator' })),
    ).toThrow(ForbiddenException);
  });

  it('[C50] throws ForbiddenException when the request has no user', () => {
    expect(() => sut.canActivate(contextOf(undefined))).toThrow(
      ForbiddenException,
    );
  });

  it('inspector C13 throws ForbiddenException for an internal inspector', () => {
    expect(() =>
      sut.canActivate(contextOf({ internal: true, role: 'inspector' })),
    ).toThrow(ForbiddenException);
  });
});
