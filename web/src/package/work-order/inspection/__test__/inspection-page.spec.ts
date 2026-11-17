import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { toast } from '../../../shared/components/ui/toaster';
import { InspectionPage } from '../inspection-page/inspection-page';
import {
  assignment,
  button,
  buttons,
  configure,
  dialog,
  dialogs,
  inspection,
  items,
  meta,
  press,
  questionCards,
  renderPage,
  settle,
  text,
  type,
  WO_AURORA,
} from './testing';

const POST_URL = '/api/work-orders/wo-1/inspection-assignments/a1/inspections';

describe('InspectionPage', () => {
  let controller: HttpTestingController;

  beforeEach(() => {
    controller = configure();
  });

  afterEach(() => {
    controller.verify();
    vi.restoreAllMocks();
  });

  const reset = () => {
    TestBed.resetTestingModule();
    controller = configure();
  };

  const back = (element: HTMLElement) =>
    element.querySelector<HTMLAnchorElement>('[data-slot="back"]')!;

  async function answerAll(element: HTMLElement) {
    const [textQuestion, yesNo, conformity, score] = questionCards(element);
    await type(textQuestion.querySelector('textarea')!, '  Casco sem manchas  ');
    await press(yesNo, 'Não');
    await press(conformity, 'Não conforme');
    await type(conformity.querySelector('textarea')!, ' Bolhas na proa ');
    await press(score, 'Não se aplica');
  }

  async function conclude(element: HTMLElement) {
    button(element, 'Concluir inspeção').click();
    await settle();
  }

  const confirmation = (element: HTMLElement) => dialog(element, 'Concluir inspeção');

  it('work-order-ui C47 shows the header, meta and the back link by origin', async () => {
    let element = await renderPage(controller, { id: WO_AURORA, from: 'inspections' });

    expect(text(back(element))).toBe('Voltar às inspeções');
    expect(back(element).getAttribute('href')).toBe('/inspections');
    expect(text(element.querySelector('[data-slot="kicker"]'))).toBe(
      'INSPEÇÃO DE CAMPO · #AB12CD34',
    );
    expect(text(element.querySelector('h1'))).toBe('Inspeção do casco');
    expect(element.textContent).toContain(
      'Responda às perguntas e registre as condições encontradas.',
    );
    // No status pill while answering.
    expect(element.querySelector('[data-slot="result"]')).toBeNull();
    for (const pill of ['Em andamento', 'Aprovada', 'Reprovada']) {
      expect(element.textContent, pill).not.toContain(pill);
    }
    expect(meta(element)).toEqual([
      ['Embarcação', 'Aurora'],
      ['Inspetor', 'Inês Prado'],
      ['Progresso', '0 de 4 respondidas'],
    ]);
    expect(text(element.querySelector('section h2'))).toBe('Roteiro de inspeção');
    expect(element.textContent).toContain('Preencha cada item antes de concluir.');
    expect(text(element.querySelector('[data-slot="question-total"]'))).toBe('4 perguntas');

    reset();
    element = await renderPage(controller, { id: WO_AURORA });
    expect(text(back(element))).toBe('Voltar à ordem de serviço');
    expect(back(element).getAttribute('href')).toBe(`/work-orders/${WO_AURORA}`);
  });

  it('work-order-ui C48 offers the controls of each type with Não se aplica and the note', async () => {
    const element = await renderPage(controller);
    const [textQuestion, yesNo, conformity, score] = questionCards(element);
    const labelsOf = (question: HTMLElement) =>
      [...question.querySelectorAll('button')].map((control) => text(control));

    expect(
      questionCards(element).map((question) => [
        text(question.querySelector('[data-slot="question-number"]')),
        text(question.querySelector('[data-slot="question-label"]')),
      ]),
    ).toEqual([
      ['01', 'Observações do casco'],
      ['02', 'Casco limpo?'],
      ['03', 'Pintura sem bolhas'],
      ['04', 'Acabamento'],
    ]);
    expect(textQuestion.querySelectorAll('textarea')).toHaveLength(1);
    expect(textQuestion.querySelector('textarea')!.placeholder).toBe('Registre sua observação');
    expect(labelsOf(textQuestion)).toEqual(['Não se aplica']);
    expect(labelsOf(yesNo)).toEqual(['Sim', 'Não', 'Não se aplica']);
    expect(labelsOf(conformity)).toEqual(['Conforme', 'Não conforme', 'Não se aplica']);
    expect(labelsOf(score)).toEqual([
      ...Array.from({ length: 11 }, (_, n) => String(n)),
      'Não se aplica',
    ]);
    expect(
      [textQuestion, yesNo, conformity, score].map((question) =>
        question.textContent?.includes('Observação (opcional)'),
      ),
    ).toEqual([false, true, true, true]);
    // Every answer control is 40px tall (Tailwind `h-10`), for a finger on a phone.
    const controls = questionCards(element).flatMap((question) => [
      ...question.querySelectorAll('button'),
    ]);
    expect(controls).toHaveLength(1 + 3 + 3 + 12);
    expect(controls.filter((control) => !control.classList.contains('h-10'))).toEqual([]);

    // 1000 characters for a text answer and 500 for a note.
    await type(textQuestion.querySelector('textarea')!, 't'.repeat(1001));
    await press(yesNo, 'Sim');
    await type(yesNo.querySelector('textarea')!, 'n'.repeat(501));
    await press(conformity, 'Conforme');
    await press(score, '7');
    await conclude(element);
    expect(text(textQuestion.querySelector('[data-slot="error"]'))).toBe(
      'A resposta deve ter no máximo 1000 caracteres',
    );
    expect(text(yesNo.querySelector('[data-slot="error"]'))).toBe(
      'A observação deve ter no máximo 500 caracteres',
    );
    expect(confirmation(element)).toBeUndefined();

    await type(textQuestion.querySelector('textarea')!, 't'.repeat(1000));
    await type(yesNo.querySelector('textarea')!, 'n'.repeat(500));
    await conclude(element);
    expect(element.querySelectorAll('[data-slot="error"]')).toHaveLength(0);
    expect(confirmation(element)).toBeDefined();
    controller.expectNone({ method: 'POST', url: POST_URL });
  });

  it('work-order-ui C49 counts answered questions as they change', async () => {
    const element = await renderPage(controller, {
      assignments: [assignment('a1', null, [], [items[0], items[1], items[3]])],
    });
    const progress = () => meta(element).find(([label]) => label === 'Progresso')?.[1];
    const [textQuestion, yesNo, score] = questionCards(element);

    expect(progress()).toBe('0 de 3 respondidas');
    await press(yesNo, 'Sim');
    expect(progress()).toBe('1 de 3 respondidas');
    await press(score, 'Não se aplica');
    expect(progress()).toBe('2 de 3 respondidas');
    await type(textQuestion.querySelector('textarea')!, 'Sem manchas');
    expect(progress()).toBe('3 de 3 respondidas');

    // Clearing a question takes it out of the count.
    await type(textQuestion.querySelector('textarea')!, '');
    expect(progress()).toBe('2 de 3 respondidas');
    await press(score, 'Não se aplica');
    expect(progress()).toBe('1 de 3 respondidas');
  });

  it('work-order-ui C50 names and focuses the first unanswered question', async () => {
    const element = await renderPage(controller);
    const [textQuestion, , conformity] = questionCards(element);
    await type(textQuestion.querySelector('textarea')!, 'Sem manchas');
    await press(conformity, 'Conforme');

    await conclude(element);

    const alert = element.querySelector('[role="alert"]');
    expect(text(alert)).toBe('Responda à pergunta obrigatória: “Casco limpo?”.');
    expect(document.activeElement).toBe(questionCards(element)[1]);
    expect(confirmation(element)).toBeUndefined();
    controller.expectNone({ method: 'POST', url: POST_URL });

    // The next unanswered question once the first is answered.
    await press(questionCards(element)[1], 'Sim');
    await conclude(element);
    expect(text(element.querySelector('[role="alert"]'))).toBe(
      'Responda à pergunta obrigatória: “Acabamento”.',
    );
    expect(document.activeElement).toBe(questionCards(element)[3]);
    controller.expectNone({ method: 'POST', url: POST_URL });
  });

  it('work-order-ui C51 asks for the result, posts the inspection and returns to the origin', async () => {
    const success = vi.spyOn(toast, 'success');

    for (const [from, origin] of [
      ['inspections', '/inspections'],
      [undefined, '/work-orders/wo-1'],
    ] as const) {
      reset();
      const element = await renderPage(controller, { from });
      await answerAll(element);
      await conclude(element);

      const asked = confirmation(element)!;
      expect(asked.textContent).toContain('Escolha o resultado desta inspeção.');
      const choices = [...buttons(asked, 'Aprovada'), ...buttons(asked, 'Reprovada')];
      expect(choices.map((choice) => choice.getAttribute('aria-pressed'))).toEqual([
        'false',
        'false',
      ]);
      expect(button(asked, 'Confirmar').disabled).toBe(true);
      controller.expectNone({ method: 'POST', url: POST_URL });

      await press(asked, 'Aprovada');
      button(confirmation(element)!, 'Confirmar').click();

      const sent = controller.expectOne(POST_URL);
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

      expect(success).toHaveBeenLastCalledWith(
        'Inspeção registrada com sucesso',
        expect.anything(),
      );
      expect(TestBed.inject(Router).url, String(from)).toBe(origin);
    }
  });

  it('work-order-ui C52 keeps the answers when the API fails', async () => {
    const error = vi.spyOn(toast, 'error');
    const element = await renderPage(controller, { from: 'inspections' });
    await answerAll(element);
    await conclude(element);
    await press(confirmation(element)!, 'Reprovada');
    button(confirmation(element)!, 'Confirmar').click();
    controller
      .expectOne(POST_URL)
      .flush(
        { statusCode: 409, message: 'Work order is not in progress' },
        { status: 409, statusText: 'Conflict' },
      );
    await settle();

    expect(error).toHaveBeenCalledWith('Erro ao registrar inspeção', {
      description: 'A ordem de serviço não está em andamento.',
    });
    expect(confirmation(element)).toBeUndefined();
    expect(TestBed.inject(Router).url).toBe('/');
    const [textQuestion, yesNo, conformity, score] = questionCards(element);
    expect(textQuestion.querySelector('textarea')!.value).toBe('  Casco sem manchas  ');
    expect(button(yesNo, 'Não').getAttribute('aria-pressed')).toBe('true');
    expect(button(conformity, 'Não conforme').getAttribute('aria-pressed')).toBe('true');
    expect(conformity.querySelector('textarea')!.value).toBe(' Bolhas na proa ');
    expect(button(score, 'Não se aplica').getAttribute('aria-pressed')).toBe('true');
    expect(meta(element).at(-1)).toEqual(['Progresso', '4 de 4 respondidas']);
    expect(buttons(element, 'Concluir inspeção')).toHaveLength(1);
  });

  it('work-order-ui C53 says answers are stored on conclusion and offers no photos', async () => {
    const element = await renderPage(controller);

    const footer = button(element, 'Concluir inspeção').closest('footer');
    expect(text(footer)).toContain('As respostas só são gravadas ao concluir a inspeção.');
    expect(element.textContent).not.toContain('Fotos de evidência');
    expect(element.querySelector('input[type="file"]')).toBeNull();
  });

  it('work-order-ui C54 shows the reason for a blocked assignment and not found for an unknown one', async () => {
    let element = await renderPage(controller, { workOrderStatus: 'PENDING' });
    expect(text(element.querySelector('[data-slot="blocked"]'))).toBe(
      'Disponível com a ordem em andamento',
    );
    expect(buttons(element, 'Concluir inspeção')).toEqual([]);
    expect(questionCards(element)).toEqual([]);

    reset();
    element = await renderPage(controller, {
      serviceStatus: 'PENDING',
      assignments: [assignment('a1', { id: 'svc-1', name: 'Pintura do casco' })],
    });
    expect(text(element.querySelector('[data-slot="blocked"]'))).toBe(
      'Disponível com o serviço em andamento',
    );
    expect(buttons(element, 'Concluir inspeção')).toEqual([]);

    reset();
    element = await renderPage(controller, { assignmentId: 'unknown' });
    expect(text(element.querySelector('[data-slot="not-found"] h1'))).toBe(
      'Atribuição não encontrada',
    );
    const way = [...element.querySelectorAll<HTMLAnchorElement>('[data-slot="not-found"] a')];
    expect(way.map((link) => [text(link), link.getAttribute('href')])).toEqual([
      ['Voltar à ordem de serviço', '/work-orders/wo-1'],
    ]);
    expect(buttons(element, 'Concluir inspeção')).toEqual([]);
  });

  it('work-order-ui C54 a work order of another organization shows Atribuição não encontrada', async () => {
    const fixture = TestBed.createComponent(InspectionPage);
    fixture.componentRef.setInput('id', 'wo-9');
    fixture.componentRef.setInput('assignmentId', 'a1');
    await settle();
    const notFound = { statusCode: 404, message: 'Work order not found' };
    const status = { status: 404, statusText: 'Not Found' };
    controller.expectOne('/api/work-orders/wo-9').flush(notFound, status);
    controller.expectOne('/api/work-orders/wo-9/services').flush(notFound, status);
    controller.expectOne('/api/work-orders/wo-9/inspection-assignments').flush(notFound, status);
    await settle();
    const element = fixture.nativeElement as HTMLElement;

    expect(text(element.querySelector('[data-slot="not-found"] h1'))).toBe(
      'Atribuição não encontrada',
    );
    expect(buttons(element, 'Concluir inspeção')).toEqual([]);
  });

  it('work-order-ui C55 reads a completed inspection with its result and answers', async () => {
    const history = [
      inspection('i-new', 'REPROVED', '2026-11-18T14:30:00'),
      inspection('i-old', 'APPROVED', '2026-11-12T09:05:00', 'Inês Prado'),
    ];
    const element = await renderPage(controller, {
      role: 'operator',
      name: 'Ana Souza',
      id: WO_AURORA,
      inspectionId: 'i-new',
      assignments: [assignment('a1', null, history)],
    });

    expect(text(element.querySelector('[data-slot="kicker"]'))).toBe(
      'INSPEÇÃO DE CAMPO · #AB12CD34',
    );
    expect(text(element.querySelector('h1'))).toBe('Inspeção do casco');
    expect(text(element.querySelector('[data-slot="result"]'))).toBe('Reprovada');
    expect(meta(element).slice(0, 2)).toEqual([
      ['Embarcação', 'Aurora'],
      ['Inspetor', 'Carlos Lima'],
    ]);
    expect(
      [...element.querySelectorAll('[data-slot="answer"]')].map((row) => [
        text(row.firstElementChild),
        text(row.querySelector('[data-slot="label"]')),
        text(row.querySelector('[data-slot="value"]')),
        text(row.querySelector('[data-slot="note"]')) ?? null,
      ]),
    ).toEqual([
      ['01', 'Observações do casco', 'Sem manchas', null],
      ['02', 'Casco limpo?', 'Não', 'Restos de alga'],
      ['03', 'Pintura sem bolhas', 'Não se aplica', null],
      ['04', 'Acabamento', '7', null],
    ]);
    expect(text(element.querySelector('[data-slot="completed-at"]'))).toBe(
      'Concluída em 18/11/2026 14:30',
    );
    expect(element.querySelectorAll('textarea, input, select')).toHaveLength(0);
    for (const control of [
      'Sim',
      'Conforme',
      'Não se aplica',
      '7',
      'Concluir inspeção',
      'Descartar',
    ]) {
      expect(buttons(element, control), control).toEqual([]);
    }
  });

  it('inspection C23 reads Sim, Conforme and Não conforme as such', async () => {
    const answered = (id: string, yes: boolean, conforming: boolean) => ({
      ...inspection(id, 'APPROVED', '2026-11-13T08:00:00'),
      answers: [
        { itemId: 'q-text', notApplicable: false, value: 'Ok', note: null },
        { itemId: 'q-yes', notApplicable: false, value: yes, note: null },
        { itemId: 'q-conf', notApplicable: false, value: conforming, note: null },
        { itemId: 'q-score', notApplicable: false, value: 0, note: null },
      ],
    });
    const history = [answered('i-1', true, true), answered('i-2', false, false)];
    const values = (element: HTMLElement) =>
      [...element.querySelectorAll('[data-slot="answer"] [data-slot="value"]')].map((node) =>
        text(node),
      );

    let element = await renderPage(controller, {
      role: 'operator',
      inspectionId: 'i-1',
      assignments: [assignment('a1', null, history)],
    });
    expect(values(element)).toEqual(['Ok', 'Sim', 'Conforme', '0']);

    reset();
    element = await renderPage(controller, {
      role: 'operator',
      inspectionId: 'i-2',
      assignments: [assignment('a1', null, history)],
    });
    expect(values(element)).toEqual(['Ok', 'Não', 'Não conforme', '0']);
  });

  it('work-order-ui C56 an inspector discards after confirming and returns to the order', async () => {
    const success = vi.spyOn(toast, 'success');
    const history = [inspection('i-new', 'REPROVED', '2026-11-18T14:30:00')];
    const element = await renderPage(controller, {
      inspectionId: 'i-new',
      assignments: [assignment('a1', null, history)],
    });
    const router = TestBed.inject(Router);

    button(element, 'Descartar').click();
    await settle();
    let asked = dialog(element, 'Descartar inspeção')!;
    expect(asked.textContent).toContain(
      'Tem certeza que deseja descartar esta inspeção? Ela deixará de aparecer no app.',
    );
    button(asked, 'Cancelar').click();
    await settle();
    expect(dialogs(element)).toEqual([]);
    controller.expectNone((request) => request.url.endsWith('/discard'));

    button(element, 'Descartar').click();
    await settle();
    asked = dialog(element, 'Descartar inspeção')!;
    button(asked, 'Confirmar').click();
    const discarded = controller.expectOne(
      '/api/work-orders/wo-1/inspection-assignments/a1/inspections/i-new/discard',
    );
    expect(discarded.request.method).toBe('POST');
    discarded.flush(null, { status: 204, statusText: 'No Content' });
    await settle();

    expect(success).toHaveBeenCalledWith('Inspeção descartada com sucesso', expect.anything());
    expect(router.url).toBe('/work-orders/wo-1');

    for (const role of ['administrator', 'operator'] as const) {
      reset();
      const other = await renderPage(controller, {
        role,
        inspectionId: 'i-new',
        assignments: [assignment('a1', null, history)],
      });
      expect(buttons(other, 'Descartar'), role).toEqual([]);
    }
  });

  it('inspection C31 a failed discard shows the API message and keeps the page', async () => {
    const error = vi.spyOn(toast, 'error');
    const history = [inspection('i-new', 'REPROVED', '2026-11-18T14:30:00')];
    const element = await renderPage(controller, {
      inspectionId: 'i-new',
      assignments: [assignment('a1', null, history)],
    });

    button(element, 'Descartar').click();
    await settle();
    button(dialog(element, 'Descartar inspeção')!, 'Confirmar').click();
    controller
      .expectOne('/api/work-orders/wo-1/inspection-assignments/a1/inspections/i-new/discard')
      .flush(
        { statusCode: 404, message: 'Inspection not found' },
        { status: 404, statusText: 'Not Found' },
      );
    await settle();

    expect(error).toHaveBeenCalledWith('Erro ao descartar inspeção', {
      description: 'Inspeção não encontrada.',
    });
    expect(TestBed.inject(Router).url).toBe('/');
    expect(text(element.querySelector('[data-slot="result"]'))).toBe('Reprovada');
    expect(element.querySelectorAll('[data-slot="answer"]')).toHaveLength(4);
  });

  it('inspection C27 the confirmation shows the counts and waits for a result', async () => {
    const element = await renderPage(controller);
    await answerAll(element);
    await conclude(element);

    const asked = confirmation(element)!;
    expect(text(asked.querySelector('[data-slot="counts"]'))).toBe(
      'Respostas "Não conforme": 1 · Respostas "Não": 1',
    );
    expect(button(asked, 'Confirmar').disabled).toBe(true);

    await press(asked, 'Reprovada');
    expect(button(confirmation(element)!, 'Reprovada').getAttribute('aria-pressed')).toBe('true');
    expect(button(confirmation(element)!, 'Confirmar').disabled).toBe(false);

    // Cancelling sends nothing and keeps the answers on the page.
    button(confirmation(element)!, 'Cancelar').click();
    await settle();
    expect(confirmation(element)).toBeUndefined();
    controller.expectNone({ method: 'POST', url: POST_URL });
    expect(meta(element).at(-1)).toEqual(['Progresso', '4 de 4 respondidas']);
  });

  it('inspection C25 Não se aplica unpresses the value chosen before it', async () => {
    const element = await renderPage(controller);
    const [, yesNo, , score] = questionCards(element);
    await press(yesNo, 'Sim');
    await press(score, '7');

    await press(yesNo, 'Não se aplica');
    await press(score, 'Não se aplica');

    expect(button(yesNo, 'Sim').getAttribute('aria-pressed')).toBe('false');
    expect(button(yesNo, 'Não se aplica').getAttribute('aria-pressed')).toBe('true');
    expect(button(score, '7').getAttribute('aria-pressed')).toBe('false');
    expect(button(score, 'Não se aplica').getAttribute('aria-pressed')).toBe('true');
  });
});
