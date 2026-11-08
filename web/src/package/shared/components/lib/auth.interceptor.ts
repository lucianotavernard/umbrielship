import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, EMPTY, throwError } from 'rxjs';

import { AuthenticationService } from '../../../identity/authentication/authentication.service';
import { toast } from '../ui/toaster';

const TOKEN_KEY = '@umbriel:access-token';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authenticationService = inject(AuthenticationService);

  let clonedRequest = req;

  if (!req.url.includes('/sessions') && !req.url.includes('/invitations/accept')) {
    const accessToken = localStorage.getItem(TOKEN_KEY);
    if (accessToken) {
      clonedRequest = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${accessToken}`),
      });
    }
  }

  return next(clonedRequest).pipe(
    catchError((response: HttpErrorResponse) => {
      if (response.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        authenticationService.isAuthenticated.set(false);
        authenticationService.activeOrganizationId.set(null);
        void router.navigateByUrl('/auth');
        return EMPTY;
      }

      if (req.method === 'GET' && (response.status === 0 || response.status >= 500)) {
        toast.error('Não foi possível carregar os dados', {
          description: 'Verifique a conexão e tente novamente.',
        });
      }

      return throwError(() => response);
    }),
  );
};
