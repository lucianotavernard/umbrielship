import { HttpTestingController } from '@angular/common/http/testing';

import { configure, renderHub } from '../../inspection/__test__/testing';
import { button, buttons, fill, questionFields, questions, settle, sheets } from './testing';

// The form is reached as an Administrator reaches it: "Novo modelo" on the Inspections hub.
describe('InspectionTemplate form', () => {
  let controller: HttpTestingController;
  let element: HTMLElement;
  let sheet: HTMLElement;

  beforeEach(async () => {
    controller = configure();
    element = await renderHub(controller, 'administrator');
    button(element, 'Novo modelo').click();
    await settle();
    sheet = sheets(element)[0];
  });

  afterEach(() => controller.verify());

  const name = () => sheet.querySelector<HTMLInputElement>('#template-name')!;
  const submit = async () => {
    button(sheet, 'Criar modelo').click();
    await settle();
  };
  // The hub shows the new card after it reads the templates again.
  const reloaded = () =>
    controller
      .expectOne({ method: 'GET', url: '/api/inspection-templates' })
      .flush({ inspectionTemplates: [], total: 0 });

  async function add(...labels: string[]) {
    for (const label of labels) {
      button(sheet, 'Adicionar').click();
      await settle();
      fill(questionFields(sheet).at(-1)!, label);
    }
    await settle();
  }

  it('template C20 Novo modelo opens the sheet with an empty name and one question', () => {
    expect(sheets(element)).toHaveLength(1);
    expect(sheet.querySelector('h2')?.textContent?.trim()).toBe('Novo modelo');
    expect(name().value).toBe('');
    expect(questions(sheet)).toEqual(['']);
  });

  it('template C21 Adicionar appends an empty question', async () => {
    fill(questionFields(sheet)[0], 'A');
    await settle();
    button(sheet, 'Adicionar').click();
    await settle();

    expect(questions(sheet)).toEqual(['A', '']);
    expect(
      [...sheet.querySelectorAll('[data-slot="question-editor"] strong')].map((title) =>
        title.textContent?.trim(),
      ),
    ).toEqual(['Pergunta 01', 'Pergunta 02']);
  });

  it('template C22 Subir and Descer swap neighbours and are disabled at the ends', async () => {
    fill(questionFields(sheet)[0], 'A');
    await add('B', 'C');

    buttons(sheet, 'Descer')[0].click();
    await settle();
    expect(questions(sheet)).toEqual(['B', 'A', 'C']);

    buttons(sheet, 'Subir')[2].click();
    await settle();
    expect(questions(sheet)).toEqual(['B', 'C', 'A']);

    expect(buttons(sheet, 'Subir').map((control) => control.disabled)).toEqual([
      true,
      false,
      false,
    ]);
    expect(buttons(sheet, 'Descer').map((control) => control.disabled)).toEqual([
      false,
      false,
      true,
    ]);
  });

  it('template C23 Remover pergunta drops a question and the limits disable the controls', async () => {
    // One question cannot be removed: no "Remover pergunta" until there are two.
    expect(buttons(sheet, 'Remover pergunta 1')).toEqual([]);

    fill(questionFields(sheet)[0], 'A');
    await add('B', 'C');
    expect(
      ['Remover pergunta 1', 'Remover pergunta 2', 'Remover pergunta 3'].map(
        (label) => buttons(sheet, label).length,
      ),
    ).toEqual([1, 1, 1]);
    button(sheet, 'Remover pergunta 2').click();
    await settle();
    expect(questions(sheet)).toEqual(['A', 'C']);

    for (let count = 2; count < 100; count++) {
      button(sheet, 'Adicionar').click();
    }
    await settle();
    expect(questionFields(sheet)).toHaveLength(100);
    expect(button(sheet, 'Adicionar').disabled).toBe(true);
  });

  it('template C24 shows the field errors and sends nothing', async () => {
    await submit();
    expect(sheet.textContent).toContain('Nome é obrigatório');
    expect(sheet.textContent).toContain('Pergunta é obrigatória');

    fill(name(), '   ');
    fill(questionFields(sheet)[0], 'x'.repeat(201));
    await settle();
    await submit();
    expect(sheet.textContent).toContain('Nome é obrigatório');
    expect(sheet.textContent).toContain('Pergunta deve ter no máximo 200 caracteres');

    fill(name(), 'n'.repeat(101));
    fill(questionFields(sheet)[0], 'x'.repeat(200));
    await settle();
    await submit();
    expect(sheet.textContent).toContain('Nome deve ter no máximo 100 caracteres');
    expect(sheet.textContent).not.toContain('Pergunta deve ter no máximo');

    controller.expectNone({ method: 'POST', url: '/api/inspection-templates' });
    expect(sheets(element)).toHaveLength(1);
  });

  it('template C24 measures the name and the questions after trimming them', async () => {
    fill(name(), ` ${'n'.repeat(100)} `);
    fill(questionFields(sheet)[0], ` ${'x'.repeat(200)} `);
    await settle();
    await submit();

    expect(sheet.textContent).not.toContain('deve ter no máximo');
    const created = controller.expectOne({ method: 'POST', url: '/api/inspection-templates' });
    expect(created.request.body).toEqual({
      name: 'n'.repeat(100),
      items: [{ label: 'x'.repeat(200), type: 'CONFORMITY' }],
    });
    created.flush({ inspectionTemplate: { id: 't1' } }, { status: 201, statusText: 'Created' });
    await settle();
    reloaded();
  });

  it('inspection C4 each question has a Tipo de resposta select and the form sends the types in order', async () => {
    const typeSelect = (index: number) =>
      sheet.querySelector<HTMLSelectElement>(`#question-type-${index}`)!;
    expect(sheet.querySelector('label[for="question-type-0"]')?.textContent?.trim()).toBe(
      'Tipo de resposta',
    );
    expect(sheet.querySelector('label[for="question-0"]')?.textContent?.trim()).toBe('Enunciado');
    const optionLabels = [...typeSelect(0).options].map((option) => option.textContent?.trim());
    expect(optionLabels).toEqual([
      'Texto livre',
      'Sim ou não',
      'Conforme / não conforme',
      'Nota de 0 a 10',
    ]);
    expect(typeSelect(0).value).toBe('CONFORMITY');

    fill(name(), 'Misto');
    fill(questionFields(sheet)[0], 'Observações');
    await add('Limpo?', 'Acabamento');
    for (const [index, type] of ['TEXT', 'YES_NO', 'SCORE'].entries()) {
      typeSelect(index).value = type;
      typeSelect(index).dispatchEvent(new Event('input', { bubbles: true }));
      typeSelect(index).dispatchEvent(new Event('change', { bubbles: true }));
    }
    await settle();
    buttons(sheet, 'Subir')[2].click();
    await settle();
    await submit();

    const created = controller.expectOne({ method: 'POST', url: '/api/inspection-templates' });
    expect(created.request.body).toEqual({
      name: 'Misto',
      items: [
        { label: 'Observações', type: 'TEXT' },
        { label: 'Acabamento', type: 'SCORE' },
        { label: 'Limpo?', type: 'YES_NO' },
      ],
    });
    created.flush({ inspectionTemplate: { id: 't1' } }, { status: 201, statusText: 'Created' });
    await settle();
    reloaded();
  });
});
