import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';

import { AuthenticationService } from '../../../identity/authentication/authentication.service';

/** Only an `inspector` answers an Inspection; every other Role is sent to `/forbidden`. */
export const inspectorGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authenticationService = inject(AuthenticationService);

  return authenticationService
    .me()
    .pipe(map(({ user }) => (user.role === 'inspector' ? true : router.createUrlTree(['/forbidden']))));
};
