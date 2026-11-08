import { Routes } from '@angular/router';

import { authGuard } from './package/shared/components/lib/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'auth',
    title: 'Autenticação',
    loadComponent: () =>
      import('./package/identity/authentication/authenticate-user').then((m) => m.AuthenticateUser),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./package/shared/components/internal-layout').then((m) => m.InternalLayout),
    children: [
      {
        path: 'dashboard',
        title: 'Dashboard',
        loadComponent: () =>
          import('./package/analytics/dashboard/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'customers',
        title: 'Clientes',
        loadComponent: () =>
          import('./package/customer/customer/customer-list/customer-list').then((m) => m.CustomerList),
      },
      {
        path: 'customers/:id',
        title: 'Cliente',
        loadComponent: () =>
          import('./package/customer/customer/customer-detail/customer-detail').then((m) => m.CustomerDetail),
      },
      {
        path: 'vessels',
        title: 'Embarcações',
        loadComponent: () =>
          import('./package/customer/vessel/vessel-list/vessel-list').then((m) => m.VesselList),
      },
      {
        path: 'vessels/:id',
        title: 'Embarcação',
        loadComponent: () =>
          import('./package/customer/vessel/vessel-detail/vessel-detail').then((m) => m.VesselDetail),
      },
      {
        path: 'work-orders/:id',
        title: 'Ordem de serviço',
        loadComponent: () =>
          import('./package/work-order/work-order/work-order-detail/work-order-detail').then(
            (m) => m.WorkOrderDetail,
          ),
      },
    ],
  },
  {
    path: '404',
    loadComponent: () => import('./package/shared/components/not-found').then((m) => m.NotFound),
  },
  {
    path: 'forbidden',
    loadComponent: () => import('./package/shared/components/forbidden').then((m) => m.Forbidden),
  },
  { path: '**', redirectTo: '404' },
];
