import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { VesselDetail } from '../vessel-detail/vessel-detail';
import { VesselList } from '../vessel-list/vessel-list';

const aurora = {
  id: 'vessel-1',
  imoNumber: '9074729',
  name: 'Aurora',
  type: 'CARGO',
  length: 12,
  customerId: 'customer-1',
};

describe('Vessels', () => {
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  async function settle() {
    await new Promise((resolve) => setTimeout(resolve));
    TestBed.tick();
  }

  it('[C91] requests page 1 with no organizationId and renders Aurora', async () => {
    TestBed.createComponent(VesselList);
    await settle();
    const vessels = controller.expectOne('/api/vessels?page=1');
    expect(vessels.request.url).not.toContain('organizationId');
    vessels.flush({ vessels: [aurora], total: 1 });
    controller.expectOne('/api/customers?page=1').flush({ customers: [], total: 0 });
    await settle();
    expect(document.body.textContent).toContain('Aurora');
  });

  it('[C91] an empty vessel list says Nenhuma embarcação encontrada', async () => {
    TestBed.createComponent(VesselList);
    await settle();
    controller.expectOne('/api/vessels?page=1').flush({ vessels: [], total: 0 });
    controller.expectOne('/api/customers?page=1').flush({ customers: [], total: 0 });
    await settle();
    expect(document.body.textContent).toContain('Nenhuma embarcação encontrada');
  });

  it('[C91] the work-order list requests take 10 and skip 0', async () => {
    const fixture = TestBed.createComponent(VesselDetail);
    fixture.componentRef.setInput('id', 'vessel-1');
    await settle();
    controller.expectOne('/api/vessels/vessel-1').flush({ vessel: aurora });
    const orders = controller.expectOne('/api/work-orders?vesselId=vessel-1&take=10&skip=0');
    orders.flush({ workOrders: [], total: 0 });
    await settle();
    expect(document.body.textContent).toContain('Nenhuma ordem de serviço');
  });

  it('[C93] delete calls DELETE and does not read work orders', async () => {
    const fixture = TestBed.createComponent(VesselList);
    await settle();
    controller.expectOne('/api/vessels?page=1').flush({ vessels: [aurora], total: 1 });
    controller.expectOne('/api/customers?page=1').flush({ customers: [], total: 0 });
    await settle();
    const element = fixture.nativeElement as HTMLElement;
    element.querySelector<HTMLButtonElement>('button[title="Deletar embarcação"]')?.click();
    await settle();
    expect(element.textContent).toContain(
      'Tem certeza que deseja deletar esta embarcação? Essa ação não pode ser desfeita.',
    );
    expect(element.textContent).not.toContain('ordem de serviço');
    [...element.querySelectorAll('button')].find((button) => button.textContent?.trim() === 'Confirmar')?.click();
    await settle();
    const deleted = controller.expectOne('/api/vessels/vessel-1');
    expect(deleted.request.method).toBe('DELETE');
    controller.expectNone((request) => request.url.includes('/api/work-orders'));
    deleted.flush(null);
    await settle();
    controller.expectOne('/api/vessels?page=1').flush({ vessels: [], total: 0 });
  });
});
