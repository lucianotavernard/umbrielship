import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';

import { AuthenticationService } from '../../../identity/authentication/authentication.service';

export const internalAdministratorGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authenticationService = inject(AuthenticationService);

  return authenticationService.me().pipe(
    map(({ user }) =>
      user.role === 'administrator' && user.organization.isInternal
        ? true
        : router.createUrlTree(['/forbidden']),
    ),
  );
};
