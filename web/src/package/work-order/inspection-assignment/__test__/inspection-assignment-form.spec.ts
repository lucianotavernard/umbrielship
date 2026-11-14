import { HttpTestingController } from '@angular/common/http/testing';

import { toast } from '../../../shared/components/ui/toaster';
import { assignment, assignments, buttons, choose, configure, dialogs, render, rows, settle } from './testing';

const templates = [
  { id: 'tpl-2', name: 'Solda', itemCount: 1, createdAt: '2026-11-14T10:00:00.000Z' },
  { id: 'tpl-1', name: 'Pintura do casco', itemCount: 3, createdAt: '2026-11-13T10:00:00.000Z' },
];

describe('Atribuir modelo de inspeção', () => {
  let controller: HttpTestingController;
  let element: HTMLElement;

  beforeEach(async () => {
    controller = configure();
    element = await render(controller, 'administrator');
  });

  afterEach(() => {
    controller.verify();
    vi.restoreAllMocks();
  });

  async function open(list = templates) {
    buttons(element, 'Atribuir modelo')[0].click();
    await settle();
    controller
      .expectOne('/api/inspection-templates?per_page=100')
      .flush({ inspectionTemplates: list, total: list.length });
    await settle();
    return dialogs(element)[0];
  }

  const options = (select: HTMLSelectElement | null) =>
    [...(select?.options ?? [])].map((option) => [option.value, option.textContent?.trim()]);

  const submit = async (sheet: HTMLElement) => {
    sheet.querySelector('form')!.requestSubmit();
    await settle();
  };

  it('assignment C21 opens the sheet with the templates and the targets', async () => {
    const sheet = await open();

    expect(sheet.querySelector('h2')?.textContent?.trim()).toBe('Atribuir modelo de inspeção');
    expect(options(sheet.querySelector('#assignment-template')).slice(1)).toEqual([
      ['tpl-2', 'Solda'],
      ['tpl-1', 'Pintura do casco'],
    ]);
    const target = sheet.querySelector<HTMLSelectElement>('#assignment-target')!;
    expect(options(target)).toEqual([
      ['', 'Ordem de serviço inteira'],
      ['svc-1', 'Pintura do casco'],
      ['svc-2', 'Solda do leme'],
    ]);
    expect(target.selectedIndex).toBe(0);
  });

  it('assignment C22 says Nenhum modelo de inspeção cadastrado and sends nothing', async () => {
    const sheet = await open([]);

    expect(sheet.textContent).toContain('Nenhum modelo de inspeção cadastrado');
    expect(sheet.querySelector('form')).toBeNull();
    controller.expectNone((request) => request.method === 'POST');
  });

  it('assignment C23 requires a template', async () => {
    const sheet = await open();

    await submit(sheet);

    expect(sheet.textContent).toContain('Modelo é obrigatório');
    controller.expectNone((request) => request.method === 'POST');
  });

  it('assignment C24 assigns to the whole WorkOrder and to a service and reloads', async () => {
    const success = vi.spyOn(toast, 'success');

    let sheet = await open();
    choose(sheet.querySelector('#assignment-template')!, 'tpl-1');
    await settle();
    await submit(sheet);
    let created = controller.expectOne('/api/work-orders/wo-1/inspection-assignments');
    expect(created.request.method).toBe('POST');
    expect(created.request.body).toEqual({ templateId: 'tpl-1' });
    created.flush({ inspectionAssignment: assignment('a3', 'Pintura do casco', null, ['A']) }, { status: 201, statusText: 'Created' });
    await settle();

    expect(success).toHaveBeenCalledWith('Modelo atribuído com sucesso', {
      description: 'O modelo de inspeção foi atribuído à ordem de serviço.',
    });
    expect(dialogs(element)).toEqual([]);
    controller.expectOne('/api/work-orders/wo-1/inspection-assignments').flush({
      inspectionAssignments: [assignment('a3', 'Pintura do casco', null, ['A']), ...assignments],
    });
    await settle();
    expect(rows(element)[0].querySelector('[data-slot="template"]')?.textContent?.trim()).toBe('Pintura do casco');

    sheet = await open();
    choose(sheet.querySelector('#assignment-template')!, 'tpl-2');
    choose(sheet.querySelector('#assignment-target')!, 'svc-2');
    await settle();
    await submit(sheet);
    created = controller.expectOne((request) => request.method === 'POST');
    expect(created.request.body).toEqual({ templateId: 'tpl-2', serviceId: 'svc-2' });
    created.flush({ inspectionAssignment: assignment('a4', 'Solda', { id: 'svc-2', name: 'Solda do leme' }, ['B']) }, { status: 201, statusText: 'Created' });
    await settle();
    controller.expectOne('/api/work-orders/wo-1/inspection-assignments').flush({ inspectionAssignments: assignments });
  });

  it('assignment C26 a failed assign shows the API message and keeps the list', async () => {
    const error = vi.spyOn(toast, 'error');
    const sheet = await open();
    choose(sheet.querySelector('#assignment-template')!, 'tpl-1');
    await settle();
    await submit(sheet);

    controller
      .expectOne('/api/work-orders/wo-1/inspection-assignments')
      .flush({ statusCode: 404, message: 'Inspection template not found' }, { status: 404, statusText: 'Not Found' });
    await settle();

    expect(error).toHaveBeenCalledWith('Erro ao atribuir modelo', {
      description: 'Modelo de inspeção não encontrado.',
    });
    controller.expectNone('/api/work-orders/wo-1/inspection-assignments');
    expect(rows(element)).toHaveLength(2);
  });
});
