import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { toast } from '../../../shared/components/ui/toaster';
import {
  assignment,
  buttons,
  configure,
  dialogs,
  expand,
  inspection,
  render,
  rows,
  settle,
  text,
} from './testing';

const history = [
  inspection('i-new', 'REPROVED', '2026-11-14T15:30:00'),
  inspection('i-old', 'APPROVED', '2026-11-12T09:05:00', 'Carlos Lima'),
];

describe('Inspection history on the WorkOrder page', () => {
  let controller: HttpTestingController;

  beforeEach(() => {
    controller = configure();
  });

  afterEach(() => {
    controller.verify();
    vi.restoreAllMocks();
  });

  it('inspection C21 the summary counts the Inspections and shows the latest result', async () => {
    const element = await render(controller, 'operator', [
      assignment('a1', null, history),
      assignment('a2', null, [history[1]]),
      assignment('a3', null),
    ]);

    expect(rows(element).map((row) => text(row.querySelector('[data-slot="history"]')))).toEqual([
      '2 inspeções · última: Reprovada',
      '1 inspeção · última: Aprovada',
      'Nenhuma inspeção',
    ]);
  });

  it('inspection C22 lists the Inspections with result, inspector and date', async () => {
    const element = await render(controller, 'operator', [assignment('a1', null, history)]);
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

  it('inspection C23 the Inspeção sheet shows every answer by type and the notes', async () => {
    const element = await render(controller, 'operator', [assignment('a1', null, history)]);
    await expand(element);
    rows(element)[0].querySelector<HTMLButtonElement>('[data-slot="inspection"]')!.click();
    await settle();
    const sheet = dialogs(element)[0];

    expect(text(sheet.querySelector('h2'))).toBe('Inspeção');
    expect(text(sheet.querySelector('[data-slot="result"]'))).toBe('Reprovada');
    expect(text(sheet.querySelector('[data-slot="inspector"]'))).toBe('Inês Prado');
    expect(text(sheet.querySelector('[data-slot="date"]'))).toBe('14/11/2026 15:30');
    expect(
      [...sheet.querySelectorAll('[data-slot="answer"]')].map((row) => [
        text(row.firstElementChild),
        text(row.querySelector('[data-slot="value"]')),
        text(row.querySelector('[data-slot="note"]')) ?? null,
      ]),
    ).toEqual([
      ['1. Observações do casco', 'Sem manchas', null],
      ['2. Casco limpo?', 'Não', 'Restos de alga'],
      ['3. Pintura sem bolhas', 'Não se aplica', null],
      ['4. Acabamento', '7', null],
    ]);
  });

  it('inspection C29 an inspector discards after confirming; cancel sends nothing; others see no Descartar', async () => {
    const success = vi.spyOn(toast, 'success');
    const element = await render(controller, 'inspector', [assignment('a1', null, history)]);
    await expand(element);
    rows(element)[0].querySelector<HTMLButtonElement>('[data-slot="inspection"]')!.click();
    await settle();

    buttons(dialogs(element)[0], 'Descartar')[0].click();
    await settle();
    let confirmation = dialogs(element).find((dialog) => text(dialog.querySelector('h2')) === 'Descartar inspeção')!;
    expect(confirmation.textContent).toContain(
      'Tem certeza que deseja descartar esta inspeção? Ela deixará de aparecer no app.',
    );
    buttons(confirmation, 'Cancelar')[0].click();
    await settle();
    controller.expectNone((request) => request.url.endsWith('/discard'));

    buttons(dialogs(element)[0], 'Descartar')[0].click();
    await settle();
    confirmation = dialogs(element).find((dialog) => text(dialog.querySelector('h2')) === 'Descartar inspeção')!;
    buttons(confirmation, 'Confirmar')[0].click();
    const discarded = controller.expectOne('/api/work-orders/wo-1/inspection-assignments/a1/inspections/i-new/discard');
    expect(discarded.request.method).toBe('POST');
    discarded.flush(null, { status: 204, statusText: 'No Content' });
    await settle();

    expect(success).toHaveBeenCalledWith('Inspeção descartada com sucesso', {
      description: 'A inspeção deixou de aparecer no app.',
    });
    expect(dialogs(element)).toEqual([]);
    controller
      .expectOne('/api/work-orders/wo-1/inspection-assignments')
      .flush({ inspectionAssignments: [assignment('a1', null, [history[1]])] });
    await settle();

    for (const role of ['administrator', 'operator'] as const) {
      TestBed.resetTestingModule();
      controller = configure();
      const other = await render(controller, role, [assignment('a1', null, history)]);
      await expand(other);
      rows(other)[0].querySelector<HTMLButtonElement>('[data-slot="inspection"]')!.click();
      await settle();
      expect(buttons(dialogs(other)[0], 'Descartar'), role).toEqual([]);
    }
  });

  it('inspection C30 an inspected assignment shows no Remover', async () => {
    const element = await render(controller, 'administrator', [
      assignment('a1', null, history),
      assignment('a2', null),
    ]);

    expect(rows(element).map((row) => buttons(row, 'Remover').length)).toEqual([0, 1]);
  });

  it('inspection C31 a failed discard shows the API message and keeps the history', async () => {
    const error = vi.spyOn(toast, 'error');
    const element = await render(controller, 'inspector', [assignment('a1', null, history)]);
    await expand(element);
    rows(element)[0].querySelector<HTMLButtonElement>('[data-slot="inspection"]')!.click();
    await settle();
    buttons(dialogs(element)[0], 'Descartar')[0].click();
    await settle();
    const confirmation = dialogs(element).find((dialog) => text(dialog.querySelector('h2')) === 'Descartar inspeção')!;
    buttons(confirmation, 'Confirmar')[0].click();
    controller
      .expectOne('/api/work-orders/wo-1/inspection-assignments/a1/inspections/i-new/discard')
      .flush({ statusCode: 404, message: 'Inspection not found' }, { status: 404, statusText: 'Not Found' });
    await settle();

    expect(error).toHaveBeenCalledWith('Erro ao descartar inspeção', {
      description: 'Inspeção não encontrada.',
    });
    controller.expectNone('/api/work-orders/wo-1/inspection-assignments');
    expect(rows(element)[0].querySelectorAll('[data-slot="inspection"]')).toHaveLength(2);
  });
});
