import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthenticationService } from '../../../identity/authentication/authentication.service';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authenticationService = inject(AuthenticationService);

  if (!authenticationService.isAuthenticated()) {
    return router.createUrlTree(['/auth']);
  }

  return true;
};
