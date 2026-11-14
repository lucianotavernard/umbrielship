import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { toast } from '../../../shared/components/ui/toaster';
import { assignments, buttons, configure, dialogs, render, rows, settle } from './testing';

describe('WorkOrder Inspeções section', () => {
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

    expect([...element.querySelectorAll('h3')].map((title) => text(title))).toContain('Inspeções');
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
    const summary = () => rows(element)[1].querySelector<HTMLButtonElement>('button[aria-expanded]')!;
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
      .flush({ statusCode: 409, message: 'Inspection assignment has inspections' }, { status: 409, statusText: 'Conflict' });
    await settle();

    // An unknown API message falls back to the page's own sentence.
    expect(error).toHaveBeenCalledWith('Erro ao remover atribuição', {
      description: 'Ocorreu um erro ao remover a atribuição.',
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
      [...rows(element)[0].querySelectorAll('[data-slot="questions"] [data-slot="type"]')].map((node) =>
        node.textContent?.trim(),
      ),
    ).toEqual(['Texto livre', 'Sim/Não', 'Conforme/Não conforme', 'Nota de 0 a 10']);
  });
});
