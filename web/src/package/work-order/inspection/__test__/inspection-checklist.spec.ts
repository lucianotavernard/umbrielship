import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { toast } from '../../../shared/components/ui/toaster';
import { assignment, buttons, configure, dialogs, expand, render, rows, settle, text } from './testing';

describe('Inspecionar on the WorkOrder page', () => {
  let controller: HttpTestingController;

  beforeEach(() => {
    controller = configure();
  });

  afterEach(() => {
    controller.verify();
    vi.restoreAllMocks();
  });

  const sheet = (element: HTMLElement) =>
    dialogs(element).find((dialog) => text(dialog.querySelector('h2')) === 'Inspecionar')!;
  const confirmation = (element: HTMLElement) =>
    dialogs(element).find((dialog) => text(dialog.querySelector('h2')) === 'Concluir inspeção');
  const questions = (element: HTMLElement) => [...sheet(element).querySelectorAll<HTMLElement>('[data-slot="question"]')];
  const press = async (question: HTMLElement, label: string) => {
    buttons(question, label)[0].click();
    await settle();
  };
  const type = async (field: HTMLTextAreaElement, value: string) => {
    field.value = value;
    field.dispatchEvent(new Event('input', { bubbles: true }));
    await settle();
  };

  async function open(element: HTMLElement) {
    await expand(element);
    buttons(rows(element)[0], 'Inspecionar')[0].click();
    await settle();
  }

  async function answerAll(element: HTMLElement) {
    const [textQuestion, yesNo, conformity, score] = questions(element);
    await type(textQuestion.querySelector('textarea')!, '  Casco sem manchas  ');
    await press(yesNo, 'Não');
    await press(conformity, 'Não conforme');
    await type(conformity.querySelector('textarea')!, ' Bolhas na proa ');
    await press(score, 'Não se aplica');
  }

  const conclude = async (element: HTMLElement) => {
    sheet(element).querySelector('form')!.requestSubmit();
    await settle();
  };

  it('inspection C24 Inspecionar is for inspectors and disabled with the reason outside the work in progress', async () => {
    let element = await render(controller, 'inspector', [
      assignment('a1', null),
      assignment('a2', { id: 'svc-1', name: 'Pintura do casco' }),
    ]);
    await expand(element, 0);
    await expand(element, 1);
    expect(rows(element).map((row) => buttons(row, 'Inspecionar')[0]?.disabled)).toEqual([false, false]);

    TestBed.resetTestingModule();
    controller = configure();
    element = await render(controller, 'inspector', [assignment('a1', { id: 'svc-1', name: 'Pintura do casco' })], {
      serviceStatus: 'COMPLETED',
    });
    await expand(element);
    expect(buttons(rows(element)[0], 'Inspecionar')[0].disabled).toBe(true);
    expect(text(rows(element)[0].querySelector('[data-slot="blocked"]'))).toBe('Disponível com o serviço em andamento');

    TestBed.resetTestingModule();
    controller = configure();
    element = await render(controller, 'inspector', [assignment('a1', null)], { workOrderStatus: 'PENDING' });
    await expand(element);
    expect(buttons(rows(element)[0], 'Inspecionar')[0].disabled).toBe(true);
    expect(text(rows(element)[0].querySelector('[data-slot="blocked"]'))).toBe('Disponível com a ordem em andamento');

    for (const role of ['administrator', 'operator', null] as const) {
      TestBed.resetTestingModule();
      controller = configure();
      element = await render(controller, role, [assignment('a1', null)]);
      await expand(element);
      expect(buttons(rows(element)[0], 'Inspecionar'), String(role)).toEqual([]);
    }
  });

  it('inspection C25 renders the control of each type, Não se aplica and Observação', async () => {
    const element = await render(controller, 'inspector', [assignment('a1', null)]);
    await open(element);

    const [textQuestion, yesNo, conformity, score] = questions(element);
    const labelsOf = (question: HTMLElement) =>
      [...question.querySelectorAll('button')].map((button) => text(button));
    expect(questions(element).map((question) => text(question.querySelector('p')))).toEqual([
      '1. Observações do casco',
      '2. Casco limpo?',
      '3. Pintura sem bolhas',
      '4. Acabamento',
    ]);
    expect(textQuestion.querySelectorAll('textarea')).toHaveLength(1);
    expect(labelsOf(textQuestion)).toEqual(['Não se aplica']);
    expect(labelsOf(yesNo)).toEqual(['Sim', 'Não', 'Não se aplica']);
    expect(labelsOf(conformity)).toEqual(['Conforme', 'Não conforme', 'Não se aplica']);
    expect(labelsOf(score)).toEqual([...Array.from({ length: 11 }, (_, n) => String(n)), 'Não se aplica']);
    expect([yesNo, conformity, score].map((question) => question.textContent?.includes('Observação'))).toEqual([
      true,
      true,
      true,
    ]);
    expect(textQuestion.textContent).not.toContain('Observação');
  });

  it("inspection C26 shows the question's error and sends nothing", async () => {
    const element = await render(controller, 'inspector', [assignment('a1', null)]);
    await open(element);

    await conclude(element);
    expect(questions(element).map((question) => text(question.querySelector('[data-slot="error"]')))).toEqual([
      'Responda esta pergunta',
      'Responda esta pergunta',
      'Responda esta pergunta',
      'Responda esta pergunta',
    ]);
    expect(confirmation(element)).toBeUndefined();

    await answerAll(element);
    const [textQuestion, yesNo] = questions(element);
    await type(textQuestion.querySelector('textarea')!, 't'.repeat(1001));
    await type(yesNo.querySelector('textarea')!, 'n'.repeat(501));
    await conclude(element);
    expect(text(textQuestion.querySelector('[data-slot="error"]'))).toBe('A resposta deve ter no máximo 1000 caracteres');
    expect(text(yesNo.querySelector('[data-slot="error"]'))).toBe('A observação deve ter no máximo 500 caracteres');
    expect(confirmation(element)).toBeUndefined();
    controller.expectNone((request) => request.method === 'POST');
  });

  it('inspection C27 the confirmation shows the counts and waits for a result', async () => {
    const element = await render(controller, 'inspector', [assignment('a1', null)]);
    await open(element);
    await answerAll(element);
    await conclude(element);

    const dialog = confirmation(element)!;
    expect(text(dialog.querySelector('[data-slot="counts"]'))).toBe('Respostas "Não conforme": 1 · Respostas "Não": 1');
    const choices = buttons(dialog, 'Aprovada').concat(buttons(dialog, 'Reprovada'));
    expect(choices.map((choice) => choice.getAttribute('aria-pressed'))).toEqual(['false', 'false']);
    expect(buttons(dialog, 'Confirmar')[0].disabled).toBe(true);

    await press(dialog, 'Reprovada');
    expect(buttons(confirmation(element)!, 'Confirmar')[0].disabled).toBe(false);
    controller.expectNone((request) => request.method === 'POST');
  });

  it('inspection C28 sends the result and every answer and reloads', async () => {
    const success = vi.spyOn(toast, 'success');
    const element = await render(controller, 'inspector', [assignment('a1', null)]);
    await open(element);
    await answerAll(element);
    await conclude(element);
    await press(confirmation(element)!, 'Aprovada');
    buttons(confirmation(element)!, 'Confirmar')[0].click();

    const sent = controller.expectOne('/api/work-orders/wo-1/inspection-assignments/a1/inspections');
    expect(sent.request.method).toBe('POST');
    expect(sent.request.body).toEqual({
      result: 'APPROVED',
      answers: [
        { itemId: 'q-text', value: 'Casco sem manchas' },
        { itemId: 'q-yes', value: false },
        { itemId: 'q-conf', value: false, note: 'Bolhas na proa' },
        { itemId: 'q-score', notApplicable: true },
      ],
    });
    sent.flush({ inspection: { id: 'i1' } }, { status: 201, statusText: 'Created' });
    await settle();

    expect(success).toHaveBeenCalledWith('Inspeção registrada com sucesso', {
      description: 'A inspeção foi registrada no histórico da atribuição.',
    });
    expect(dialogs(element)).toEqual([]);
    controller.expectOne('/api/work-orders/wo-1/inspection-assignments').flush({ inspectionAssignments: [] });
  });

  it('inspection C31 a failed complete shows the API message and keeps the answers', async () => {
    const error = vi.spyOn(toast, 'error');
    const element = await render(controller, 'inspector', [assignment('a1', null)]);
    await open(element);
    await answerAll(element);
    await conclude(element);
    await press(confirmation(element)!, 'Reprovada');
    buttons(confirmation(element)!, 'Confirmar')[0].click();
    controller
      .expectOne('/api/work-orders/wo-1/inspection-assignments/a1/inspections')
      .flush({ statusCode: 409, message: 'Work order is not in progress' }, { status: 409, statusText: 'Conflict' });
    await settle();

    expect(error).toHaveBeenCalledWith('Erro ao registrar inspeção', {
      description: 'A ordem de serviço não está em andamento.',
    });
    expect(sheet(element)).toBeDefined();
    expect(questions(element)[0].querySelector('textarea')!.value).toBe('  Casco sem manchas  ');
    expect(buttons(questions(element)[1], 'Não')[0].getAttribute('aria-pressed')).toBe('true');
    controller.expectNone('/api/work-orders/wo-1/inspection-assignments');
  });
});
