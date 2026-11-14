import { Component } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding, withRouterResources } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { CustomerDetail } from '../../customer/customer/customer-detail/customer-detail';
import { customerDetailResources } from '../../customer/customer/customer-detail/customer-detail.resources';
import { CustomerList } from '../../customer/customer/customer-list/customer-list';
import { VesselDetail } from '../../customer/vessel/vessel-detail/vessel-detail';
import { VesselList } from '../../customer/vessel/vessel-list/vessel-list';
import { AuthenticationService } from '../../identity/authentication/authentication.service';
import type { Role } from '../../identity/user/user.service';
import { WorkOrderDetail } from '../../work-order/work-order/work-order-detail/work-order-detail';

// Fixtures and renderers for the five pages whose write controls depend on the session Role.

@Component({ template: 'not found' })
class NotFoundStub {}

const atlantic = {
  id: 'c1',
  name: 'Atlantic',
  email: 'ops@atlantic.test',
  phone: '11999999999',
  address: { address: 'Rua 1', city: 'Santos', state: 'SP' },
};

const aurora = {
  id: 'vessel-1',
  imoNumber: '9074729',
  name: 'Aurora',
  type: 'CARGO',
  length: 12,
  customerId: 'c1',
};

const workOrder = {
  id: 'wo-1',
  vesselId: 'vessel-1',
  startDate: '2026-01-01T00:00:00.000Z',
  endDate: '2026-01-02T00:00:00.000Z',
  status: 'PENDING',
};

const service = {
  id: 'svc-1',
  workOrderId: 'wo-1',
  name: 'Pintura',
  description: 'Casco',
  startDate: '2026-01-01T00:00:00.000Z',
  endDate: '2026-01-02T00:00:00.000Z',
  status: 'PENDING',
};

export function configureWriteAccess() {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      provideRouter(
        [
          { path: 'customers/:id', component: CustomerDetail, resources: customerDetailResources },
          { path: '404', component: NotFoundStub },
        ],
        withComponentInputBinding(),
        withRouterResources(),
      ),
    ],
  });
}

async function settle() {
  await new Promise((resolve) => setTimeout(resolve));
  TestBed.tick();
}

export type Page = 'customers' | 'customers/:id' | 'vessels' | 'vessels/:id' | 'work-orders/:id';

export const pages: Page[] = [
  'customers',
  'customers/:id',
  'vessels',
  'vessels/:id',
  'work-orders/:id',
];

// What each page renders for a Role that may write, as it rendered before the inspector Role.
export const writeControlsOf: Record<Page, string[]> = {
  customers: ['Novo Cliente', 'Excluir'],
  'customers/:id': ['Editar', 'Deletar', 'Nova Embarcação', 'Excluir'],
  vessels: ['Nova Embarcação', 'Excluir'],
  'vessels/:id': ['Editar', 'Deletar', 'Nova ordem', 'Excluir'],
  'work-orders/:id': ['Editar ordem de serviço', 'Novo serviço', 'Enviar foto de Pintura'],
};

const labels = [
  'Novo Cliente',
  'Nova Embarcação',
  'Nova ordem',
  'Novo serviço',
  'Editar ordem de serviço',
  'Editar',
  'Deletar',
];

// Every control on the page that creates, edits, deletes or uploads, by its label.
export function writeControls(element: HTMLElement): string[] {
  const found: string[] = [];

  for (const button of element.querySelectorAll('button')) {
    const aria = button.getAttribute('aria-label');
    if (aria === 'Excluir') {
      found.push('Excluir');
      continue;
    }
    const text = button.textContent?.trim() ?? '';
    if (labels.includes(text)) found.push(text);
  }

  for (const input of element.querySelectorAll('input[type="file"]')) {
    found.push(input.getAttribute('aria-label') ?? 'file');
  }

  return found;
}

// The page text with the write controls' labels removed, to compare what two Roles read.
export function content(element: HTMLElement): string {
  let text = element.textContent ?? '';
  for (const label of labels) text = text.replaceAll(label, '');
  // Whitespace is dropped: a removed control leaves different spacing, not different content.
  return text.replace(/\s+/g, '');
}

export async function render(page: Page, role: Role | null): Promise<HTMLElement> {
  const controller = TestBed.inject(HttpTestingController);
  TestBed.inject(AuthenticationService).role.set(role);

  switch (page) {
    case 'customers': {
      const fixture = TestBed.createComponent(CustomerList);
      await settle();
      controller.expectOne('/api/customers?page=1').flush({ customers: [atlantic], total: 1 });
      await settle();
      return fixture.nativeElement;
    }
    case 'customers/:id': {
      const harness = await RouterTestingHarness.create();
      const navigation = harness.navigateByUrl('/customers/c1', CustomerDetail);
      await settle();
      controller.expectOne('/api/customers/c1').flush({ customer: atlantic });
      await navigation;
      await settle();
      controller
        .expectOne('/api/vessels?customerId=c1&page=1')
        .flush({ vessels: [aurora], total: 1 });
      await settle();
      return harness.routeNativeElement as HTMLElement;
    }
    case 'vessels': {
      const fixture = TestBed.createComponent(VesselList);
      await settle();
      controller.expectOne('/api/vessels?page=1').flush({ vessels: [aurora], total: 1 });
      controller.expectOne('/api/customers?page=1').flush({ customers: [atlantic], total: 1 });
      await settle();
      return fixture.nativeElement;
    }
    case 'vessels/:id': {
      const fixture = TestBed.createComponent(VesselDetail);
      fixture.componentRef.setInput('id', 'vessel-1');
      await settle();
      controller
        .expectOne('/api/vessels/vessel-1')
        .flush({ vessel: { ...aurora, customer: atlantic } });
      controller
        .expectOne('/api/work-orders?vesselId=vessel-1&take=10&skip=0')
        .flush({ workOrders: [workOrder], total: 1 });
      await settle();
      return fixture.nativeElement;
    }
    case 'work-orders/:id': {
      const fixture = TestBed.createComponent(WorkOrderDetail);
      fixture.componentRef.setInput('id', 'wo-1');
      await settle();
      controller.expectOne('/api/work-orders/wo-1').flush({
        workOrder: {
          ...workOrder,
          vessel: { vesselId: 'vessel-1', name: 'Aurora', type: 'CARGO', length: 12 },
        },
      });
      controller
        .expectOne('/api/work-orders/wo-1/services')
        .flush({ services: [service], total: 1 });
      await settle();
      return fixture.nativeElement;
    }
  }
}
