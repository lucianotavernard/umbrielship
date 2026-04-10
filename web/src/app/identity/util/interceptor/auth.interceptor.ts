import { inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpStatusCode,
} from '@angular/common/http';
import { catchError, EMPTY, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const router = inject(Router);

  let clonedRequest = req.clone();

  if (!req.url.includes('/sessions')) {
    const accessToken = localStorage.getItem('@umbriel:access-token');
    clonedRequest = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${accessToken}`),
    });
  }

  return next(clonedRequest).pipe(
    catchError((response) => {
      if (response.error.statusCode === HttpStatusCode.Unauthorized) {
        localStorage.removeItem('@umbriel:access-token');
        router.navigateByUrl('/auth');
        return EMPTY;
      }

      return throwError(() => response);
    }),
  );
};
