import { SetMetadata } from '@nestjs/common';

import type { Role } from '@/package/shared/module/auth/user-payload.js';

export const ROLES_KEY = 'roles';

// The Roles that may call a handler. A handler without it is open to every Role.
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

// Who may write the records of an Organization that existed before inspections.
export const WRITERS: Role[] = ['administrator', 'operator'];
