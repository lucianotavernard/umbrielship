import { Routes } from '@angular/router';

import { customerDetailResources } from './package/customer/customer/customer-detail/customer-detail.resources';
import { authGuard } from './package/shared/components/lib/auth.guard';
import { inspectorGuard } from './package/shared/components/lib/inspector.guard';
import { internalAdministratorGuard } from './package/shared/components/lib/internal-administrator.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'auth',
    title: 'Autenticação',
    loadComponent: () =>
      import('./package/identity/authentication/authenticate-user/authenticate-user').then(
        (m) => m.AuthenticateUser,
      ),
  },
  {
    path: 'invitations/accept',
    title: 'Aceitar convite',
    loadComponent: () =>
      import('./package/identity/invitation/invitation-accept/invitation-accept').then(
        (m) => m.InvitationAccept,
      ),
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
        resources: customerDetailResources,
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
        path: 'work-orders',
        title: 'Ordens de serviço',
        loadComponent: () =>
          import('./package/work-order/work-order/work-order-list/work-order-list').then((m) => m.WorkOrderList),
      },
      {
        path: 'work-orders/:id',
        title: 'Ordem de serviço',
        loadComponent: () =>
          import('./package/work-order/work-order/work-order-detail/work-order-detail').then(
            (m) => m.WorkOrderDetail,
          ),
      },
      {
        path: 'work-orders/:id/assignments/:assignmentId/inspect',
        title: 'Inspeção',
        canActivate: [inspectorGuard],
        loadComponent: () =>
          import('./package/work-order/inspection/inspection-page/inspection-page').then((m) => m.InspectionPage),
      },
      {
        path: 'work-orders/:id/assignments/:assignmentId/inspections/:inspectionId',
        title: 'Inspeção',
        loadComponent: () =>
          import('./package/work-order/inspection/inspection-page/inspection-page').then((m) => m.InspectionPage),
      },
      {
        path: 'inspections',
        title: 'Inspeções',
        loadComponent: () =>
          import('./package/work-order/inspection/inspections-hub/inspections-hub').then((m) => m.InspectionsHub),
      },
      { path: 'inspection-templates', pathMatch: 'full', redirectTo: 'inspections' },
      {
        path: 'inspection-templates/:id',
        title: 'Modelo de inspeção',
        loadComponent: () =>
          import('./package/work-order/inspection-template/inspection-template-detail/inspection-template-detail').then(
            (m) => m.InspectionTemplateDetail,
          ),
      },
      {
        path: 'agenda',
        title: 'Agenda',
        loadComponent: () => import('./package/work-order/agenda/agenda-page/agenda').then((m) => m.Agenda),
      },
      {
        path: 'organizations',
        title: 'Organizações',
        canActivate: [internalAdministratorGuard],
        loadComponent: () =>
          import('./package/identity/organization/organization-list/organization-list').then(
            (m) => m.OrganizationList,
          ),
      },
      {
        path: 'organizations/:id',
        title: 'Organização',
        canActivate: [internalAdministratorGuard],
        loadComponent: () =>
          import('./package/identity/organization/organization-detail/organization-detail').then(
            (m) => m.OrganizationDetail,
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
