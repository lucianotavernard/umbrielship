import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { toast } from '../../../shared/components/ui/toaster';
import { VesselDetail } from '../vessel-detail/vessel-detail';

const aurora = {
  id: 'vessel-1',
  imoNumber: '9074729',
  name: 'Aurora',
  type: 'CARGO',
  length: 12,
  customerId: 'customer-1',
};

const workOrdersUrl = '/api/work-orders?vesselId=vessel-1&take=10&skip=0';

describe('VesselDetail', () => {
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

  async function render(workOrders: unknown[] = []) {
    const fixture = TestBed.createComponent(VesselDetail);
    fixture.componentRef.setInput('id', 'vessel-1');
    await settle();
    controller.expectOne('/api/vessels/vessel-1').flush({ vessel: aurora });
    controller.expectOne(workOrdersUrl).flush({ workOrders, total: workOrders.length });
    await settle();
    return fixture.nativeElement as HTMLElement;
  }

  it('[C91] the work-order list requests take 10 and skip 0', async () => {
    const element = await render();

    expect(element.textContent).toContain('Nenhuma ordem de serviço');
    expect(element.textContent).toContain('Aurora');
    expect(element.textContent).toContain('IMO 9074729');
  });

  it('updates the vessel from the detail sheet', async () => {
    const element = await render();

    [...element.querySelectorAll('button')].find((button) => button.textContent?.trim() === 'Editar')?.click();
    await settle();
    expect(element.textContent).toContain('Editar embarcação');
    expect(element.querySelector<HTMLInputElement>('#vessel-name')?.value).toBe('Aurora');
    expect(element.querySelector('#imoNumber')).toBeNull();

    const name = element.querySelector<HTMLInputElement>('#vessel-name');
    if (!name) throw new Error('#vessel-name');
    name.value = 'Aurora II';
    name.dispatchEvent(new Event('input', { bubbles: true }));
    name.closest('form')?.requestSubmit();
    await settle();

    const updated = controller.expectOne('/api/customers/customer-1/vessels/vessel-1');
    expect(updated.request.method).toBe('PUT');
    expect(updated.request.body).toEqual({
      customerId: 'customer-1',
      name: 'Aurora II',
      type: 'CARGO',
      length: 12,
    });
    updated.flush({ vessel: { ...aurora, name: 'Aurora II' } });
    await settle();
    controller.expectOne('/api/vessels/vessel-1').flush({ vessel: { ...aurora, name: 'Aurora II' } });
  });

  it('deletes a work order only after Confirmar', async () => {
    const success = vi.spyOn(toast, 'success');
    const element = await render([
      {
        id: '11111111-1111-1111-1111-111111111111',
        vesselId: 'vessel-1',
        startDate: '2026-01-10T00:00:00.000Z',
        endDate: '2026-01-20T00:00:00.000Z',
        status: 'PENDING',
      },
    ]);

    expect(element.querySelector('a[href="/work-orders/11111111-1111-1111-1111-111111111111"]')).toBeTruthy();
    element.querySelector<HTMLButtonElement>('button[aria-label="Excluir"]')?.click();
    await settle();
    expect(element.textContent).toContain('Excluir ordem de serviço');
    [...element.querySelectorAll('button')].find((button) => button.textContent?.trim() === 'Cancelar')?.click();
    await settle();
    controller.expectNone((request) => request.method === 'DELETE');

    element.querySelector<HTMLButtonElement>('button[aria-label="Excluir"]')?.click();
    await settle();
    [...element.querySelectorAll('button')].find((button) => button.textContent?.trim() === 'Confirmar')?.click();
    const deleted = controller.expectOne('/api/work-orders/11111111-1111-1111-1111-111111111111');
    expect(deleted.request.method).toBe('DELETE');
    deleted.flush(null, { status: 204, statusText: 'No Content' });
    await settle();

    expect(success).toHaveBeenCalledWith('Ordem de serviço excluída');
    controller.expectOne(workOrdersUrl).flush({ workOrders: [], total: 0 });
  });

  it('says Embarcação não encontrada when the vessel answers 404', async () => {
    const fixture = TestBed.createComponent(VesselDetail);
    fixture.componentRef.setInput('id', 'missing');
    await settle();
    controller
      .expectOne('/api/vessels/missing')
      .flush({ message: 'Vessel not found' }, { status: 404, statusText: 'Not Found' });
    controller.expectOne('/api/work-orders?vesselId=missing&take=10&skip=0').flush({ workOrders: [], total: 0 });
    await settle();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('Embarcação não encontrada');
    expect(element.textContent).not.toContain('Ordens de serviço');
  });
});
