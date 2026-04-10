import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

import { map } from 'rxjs';

import { AuthService } from '../../data-access/service/auth.service';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (!authService.isAuthenticated()) {
    void router.navigateByUrl('/auth');
  }

  return authService.whoami().pipe(map(() => authService.isAuthenticated()));
};
