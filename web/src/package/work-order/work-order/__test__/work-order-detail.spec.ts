import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { WorkOrderDetail } from '../work-order-detail/work-order-detail';
import { AuthenticationService } from '../../../identity/authentication/authentication.service';

describe('WorkOrderDetail', () => {
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    controller = TestBed.inject(HttpTestingController);
    // Write controls render only for a Role that may write.
    TestBed.inject(AuthenticationService).role.set('operator');
  });

  afterEach(() => controller.verify());

  async function settle() {
    await new Promise((resolve) => setTimeout(resolve));
    TestBed.tick();
  }

  it('[C91] uploads a file to the service images route', async () => {
    const fixture = TestBed.createComponent(WorkOrderDetail);
    fixture.componentRef.setInput('id', 'wo-1');
    await settle();
    controller.expectOne('/api/work-orders/wo-1').flush({
      workOrder: {
        id: 'wo-1',
        startDate: '2026-01-01T00:00:00.000Z',
        endDate: '2026-01-02T00:00:00.000Z',
        status: 'PENDING',
        vessel: { vesselId: 'vessel-1', name: 'Aurora', type: 'CARGO', length: 12 },
      },
    });
    controller.expectOne('/api/work-orders/wo-1/services').flush({
      services: [
        {
          id: 'svc-1',
          workOrderId: 'wo-1',
          name: 'Pintura',
          description: 'Casco',
          startDate: '2026-01-01T00:00:00.000Z',
          endDate: '2026-01-02T00:00:00.000Z',
          status: 'PENDING',
        },
      ],
      total: 1,
    });
    await settle();

    const input = fixture.nativeElement.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['PNG-S4'], 'photo.png', { type: 'image/png' });
    Object.defineProperty(input, 'files', { value: [file] });
    input.dispatchEvent(new Event('change'));
    await settle();

    const uploaded = controller.expectOne('/api/work-orders/wo-1/services/svc-1/images');
    expect(uploaded.request.method).toBe('POST');
    expect(uploaded.request.body).toBeInstanceOf(FormData);
    expect((uploaded.request.body as FormData).get('file')).toBe(file);
    uploaded.flush({ image: { id: 'img-1', url: '/uploads/work-order-service-images/photo.png' } });
  });
});
