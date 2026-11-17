import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ResourceContext } from '@angular/router';

import { catchError, map, of } from 'rxjs';

import { GetCustomerResponse } from '../customer.service';

/**
 * Router resources of `customers/:id`. `customer` is blocking: the router waits for it and binds
 * the loaded Customer to the `customer` input of the page. A Customer that does not exist (or that
 * belongs to another Organization) answers 404 and binds `null`: the page says "Cliente não
 * encontrado" inside the shell, as the mareos does.
 */
export function customerDetailResources({ params }: ResourceContext) {
  const http = inject(HttpClient);

  return {
    customer: rxResource({
      params: () => params()['id'] as string,
      stream: ({ params: id }) =>
        http.get<GetCustomerResponse>(`/api/customers/${id}`).pipe(
          map((response) => response.customer),
          catchError((error: unknown) => {
            if (error instanceof HttpErrorResponse && error.status === 404) return of(null);

            throw error;
          }),
        ),
    }),
  };
}
