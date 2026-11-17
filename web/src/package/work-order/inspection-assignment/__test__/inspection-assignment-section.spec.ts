import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { toast } from '../../../shared/components/ui/toaster';
import { assignments, buttons, configure, dialogs, render, rows, settle } from './testing';

const completed = (
  id: string,
  result: 'APPROVED' | 'REPROVED',
  completedAt: string,
  inspectorName = 'Inês Prado',
) => ({
  id,
  result,
  inspectorName,
  completedAt,
  answers: [],
});

// Newest first, as the API lists the visible Inspections.
const history = [
  completed('i-new', 'REPROVED', '2026-11-14T15:30:00'),
  completed('i-old', 'APPROVED', '2026-11-12T09:05:00', 'Carlos Lima'),
];

const inspected = (inspections: object[]) => ({ ...assignments[1], removable: false, inspections });

describe('Inspection assignments section', () => {
  let controller: HttpTestingController;

  beforeEach(() => {
    controller = configure();
  });

  afterEach(() => {
    controller.verify();
    vi.restoreAllMocks();
  });

  const text = (node: Element | null | undefined) => node?.textContent?.replace(/\s+/g, ' ').trim();

  it('assignment C17 lists template, target and question count', async () => {
    const element = await render(controller, 'operator');

    expect([...element.querySelectorAll('h2, h3')].map((title) => text(title))).toContain(
      'Inspeções',
    );
    expect(
      rows(element).map((row) => [
        text(row.querySelector('[data-slot="template"]')),
        text(row.querySelector('[data-slot="target"]')),
        text(row.querySelector('[data-slot="count"]')),
      ]),
    ).toEqual([
      ['Solda', 'Solda do leme', '1 pergunta'],
      ['Pintura do casco', 'Ordem de serviço inteira', '3 perguntas'],
    ]);
  });

  it('assignment C18 an empty WorkOrder says Nenhum modelo atribuído', async () => {
    const element = await render(controller, 'operator', []);

    expect(rows(element)).toEqual([]);
    expect(element.textContent).toContain('Nenhum modelo atribuído');
  });

  it('assignment C19 expands and collapses the numbered questions', async () => {
    const element = await render(controller, 'inspector');
    const summary = () =>
      rows(element)[1].querySelector<HTMLButtonElement>('button[aria-expanded]')!;
    const questions = () =>
      [...rows(element)[1].querySelectorAll('[data-slot="questions"] li')].map((item) =>
        [...item.children].map((part) => text(part)).join(' '),
      );

    expect(questions()).toEqual([]);
    summary().click();
    await settle();
    expect(questions()).toEqual(['1. Casco limpo', '2. Sem bolhas', '3. Calado visível']);
    expect(rows(element)[0].querySelector('[data-slot="questions"]')).toBeNull();

    summary().click();
    await settle();
    expect(questions()).toEqual([]);
  });

  it('assignment C20 renders Atribuir modelo and Remover only for administrator', async () => {
    const admin = await render(controller, 'administrator');
    expect(buttons(admin, 'Atribuir modelo')).toHaveLength(1);
    expect(buttons(admin, 'Remover')).toHaveLength(2);

    for (const role of ['operator', 'inspector', null] as const) {
      TestBed.resetTestingModule();
      controller = configure();
      const element = await render(controller, role);

      expect(buttons(element, 'Atribuir modelo'), String(role)).toEqual([]);
      expect(buttons(element, 'Remover'), String(role)).toEqual([]);
      expect(rows(element), String(role)).toHaveLength(2);
    }
  });

  it('assignment C25 confirms, removes and reloads; cancel sends nothing', async () => {
    const success = vi.spyOn(toast, 'success');
    const element = await render(controller, 'administrator');

    buttons(element, 'Remover')[1].click();
    await settle();
    let dialog = dialogs(element)[0];
    expect(text(dialog.querySelector('h2'))).toBe('Remover atribuição');
    expect(dialog.textContent).toContain(
      'Tem certeza que deseja remover esta atribuição? As perguntas copiadas serão excluídas.',
    );

    buttons(dialog, 'Cancelar')[0].click();
    await settle();
    expect(dialogs(element)).toEqual([]);
    controller.expectNone((request) => request.method === 'DELETE');

    buttons(element, 'Remover')[1].click();
    await settle();
    dialog = dialogs(element)[0];
    buttons(dialog, 'Confirmar')[0].click();
    const removed = controller.expectOne('/api/work-orders/wo-1/inspection-assignments/a1');
    expect(removed.request.method).toBe('DELETE');
    removed.flush(null, { status: 204, statusText: 'No Content' });
    await settle();

    expect(success).toHaveBeenCalledWith('Atribuição removida com sucesso', {
      description: 'A atribuição e as perguntas copiadas foram excluídas.',
    });
    expect(dialogs(element)).toEqual([]);
    controller
      .expectOne('/api/work-orders/wo-1/inspection-assignments')
      .flush({ inspectionAssignments: [] });
    await settle();
    expect(element.textContent).toContain('Nenhum modelo atribuído');
  });

  it('assignment C26 a failed remove shows the API message and keeps the list', async () => {
    const error = vi.spyOn(toast, 'error');
    const element = await render(controller, 'administrator');

    buttons(element, 'Remover')[0].click();
    await settle();
    buttons(dialogs(element)[0], 'Confirmar')[0].click();
    controller
      .expectOne('/api/work-orders/wo-1/inspection-assignments/a2')
      .flush(
        { statusCode: 409, message: 'Inspection assignment has inspections' },
        { status: 409, statusText: 'Conflict' },
      );
    await settle();

    expect(error).toHaveBeenCalledWith('Erro ao remover atribuição', {
      description: 'Esta atribuição tem inspeções e não pode ser removida.',
    });
    controller.expectNone('/api/work-orders/wo-1/inspection-assignments');
    expect(rows(element)).toHaveLength(2);
  });

  it("inspection C5 shows each copied question's type label", async () => {
    const element = await render(controller, 'inspector', [
      {
        ...assignments[1],
        items: [
          { id: 'q0', label: 'Notas', position: 0, type: 'TEXT' },
          { id: 'q1', label: 'Limpo?', position: 1, type: 'YES_NO' },
          { id: 'q2', label: 'Pintura', position: 2, type: 'CONFORMITY' },
          { id: 'q3', label: 'Acabamento', position: 3, type: 'SCORE' },
        ],
      },
    ]);

    rows(element)[0].querySelector<HTMLButtonElement>('button[aria-expanded]')!.click();
    await settle();

    expect(
      [...rows(element)[0].querySelectorAll('[data-slot="questions"] [data-slot="type"]')].map(
        (node) => node.textContent?.trim(),
      ),
    ).toEqual(['Texto livre', 'Sim/Não', 'Conforme/Não conforme', 'Nota de 0 a 10']);
  });

  async function expand(element: HTMLElement, index = 0) {
    rows(element)[index].querySelector<HTMLButtonElement>('button[aria-expanded]')!.click();
    await settle();
  }

  it('work-order-ui C29 Inspecionar and a history row open the inspection pages', async () => {
    const element = await render(controller, 'inspector', [inspected(history)]);
    const router = TestBed.inject(Router);
    await expand(element);

    buttons(rows(element)[0], 'Inspecionar')[0].click();
    await settle();
    expect(router.url).toBe('/work-orders/wo-1/assignments/a1/inspect');

    rows(element)[0].querySelectorAll<HTMLButtonElement>('[data-slot="inspection"]')[1].click();
    await settle();
    expect(router.url).toBe('/work-orders/wo-1/assignments/a1/inspections/i-old');

    // Anyone reads an Inspection of the history; no sheet opens on the WorkOrder page.
    for (const role of ['administrator', 'operator'] as const) {
      TestBed.resetTestingModule();
      controller = configure();
      const other = await render(controller, role, [inspected(history)]);
      await expand(other);
      expect(buttons(other, 'Inspecionar'), role).toEqual([]);
      rows(other)[0].querySelector<HTMLButtonElement>('[data-slot="inspection"]')!.click();
      await settle();
      expect(TestBed.inject(Router).url, role).toBe(
        '/work-orders/wo-1/assignments/a1/inspections/i-new',
      );
      expect(dialogs(other), role).toEqual([]);
    }
  });

  it('inspection C24 Inspecionar is for inspectors and disabled with the reason outside the work in progress', async () => {
    // a2 targets svc-2, PENDING; a1 is the whole WorkOrder.
    let element = await render(controller, 'inspector');
    await expand(element, 0);
    await expand(element, 1);
    expect(
      rows(element).map((row) => [
        buttons(row, 'Inspecionar')[0]?.disabled,
        text(row.querySelector('[data-slot="blocked"]')) ?? null,
      ]),
    ).toEqual([
      [true, 'Disponível com o serviço em andamento'],
      [false, null],
    ]);

    TestBed.resetTestingModule();
    controller = configure();
    element = await render(controller, 'inspector', [assignments[1]], {
      workOrderStatus: 'PENDING',
    });
    await expand(element);
    expect(buttons(rows(element)[0], 'Inspecionar')[0].disabled).toBe(true);
    expect(text(rows(element)[0].querySelector('[data-slot="blocked"]'))).toBe(
      'Disponível com a ordem em andamento',
    );
  });

  it('inspection C21 the summary counts the Inspections and shows the latest result', async () => {
    const element = await render(controller, 'operator', [
      { ...inspected(history), id: 'a1' },
      { ...inspected([history[1]]), id: 'a3' },
      { ...assignments[0] },
    ]);

    expect(rows(element).map((row) => text(row.querySelector('[data-slot="history"]')))).toEqual([
      '2 inspeções · última: Reprovada',
      '1 inspeção · última: Aprovada',
      'Nenhuma inspeção',
    ]);
  });

  it('inspection C22 lists the Inspections with result, inspector and date', async () => {
    const element = await render(controller, 'operator', [inspected(history)]);
    await expand(element);

    expect(
      [...rows(element)[0].querySelectorAll('[data-slot="inspection"]')].map((row) =>
        [...row.children].map((part) => text(part)),
      ),
    ).toEqual([
      ['Reprovada', 'Inês Prado', '14/11/2026 15:30'],
      ['Aprovada', 'Carlos Lima', '12/11/2026 09:05'],
    ]);
  });

  it('inspection C30 an inspected assignment shows no Remover', async () => {
    const element = await render(controller, 'administrator', [inspected(history), assignments[0]]);

    expect(rows(element).map((row) => buttons(row, 'Remover').length)).toEqual([0, 1]);
  });
});
