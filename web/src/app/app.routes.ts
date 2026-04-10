import { Routes } from '@angular/router';

import { authGuard } from './identity/util/guard/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: '',
    children: [
      {
        path: 'auth',
        loadComponent: () =>
          import('./identity/feature/authentication/authentication').then((m) => m.Authentication),
      },
    ],
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/feature/layout/internal-layout/internal-layout').then((m) => m.InternalLayout),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./analytics/feature/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'customers',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./customer/feature/customer-list/customer-list').then((m) => m.CustomerList),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./customer/feature/customer-detail/customer-detail').then((m) => m.CustomerDetail),
          },
        ],
      },
    ],
  },
  {
    path: '',
    children: [
      {
        path: '404',
        loadComponent: () =>
          import('./shared/feature/exception/not-found').then((m) => m.NotFound),
      },
      {
        path: 'forbidden',
        loadComponent: () =>
          import('./shared/feature/exception/forbidden').then((m) => m.Forbidden),
      },
      {
        path: '**',
        redirectTo: '404',
      },
    ],
  },
];
