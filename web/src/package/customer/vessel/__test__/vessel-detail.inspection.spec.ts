import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { toast } from '../../../shared/components/ui/toaster';
import { configureWriteAccess, render } from '../../../shared/testing/write-access';

describe('VesselDetail with an inspected WorkOrder', () => {
  beforeEach(() => configureWriteAccess());

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    vi.restoreAllMocks();
  });

  async function settle() {
    await new Promise((resolve) => setTimeout(resolve));
    TestBed.tick();
  }

  it('inspection C37 a refused WorkOrder delete explains the inspections and keeps the row', async () => {
    const error = vi.spyOn(toast, 'error');
    const controller = TestBed.inject(HttpTestingController);
    const element = await render('vessels/:id', 'operator');
    const rows = () => element.querySelectorAll('tbody tr').length;
    const before = rows();

    element.querySelector<HTMLButtonElement>('tbody button[aria-label="Excluir"]')!.click();
    await settle();
    [...element.querySelectorAll<HTMLButtonElement>('[role="dialog"] button')]
      .find((button) => button.textContent?.trim() === 'Confirmar')!
      .click();
    const deleted = controller.expectOne('/api/work-orders/wo-1');
    expect(deleted.request.method).toBe('DELETE');
    deleted.flush(
      { statusCode: 409, message: 'Work order has inspections' },
      { status: 409, statusText: 'Conflict' },
    );
    await settle();

    expect(error).toHaveBeenCalledWith('Erro ao excluir ordem de serviço', {
      description: 'Esta ordem de serviço tem inspeções e não pode ser excluída.',
    });
    controller.expectNone((request) => request.url.startsWith('/api/work-orders?'));
    expect(rows()).toBe(before);
    expect(element.querySelectorAll('[role="dialog"]')).toHaveLength(0);
  });
});
