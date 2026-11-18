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

  // The dashed "Adicionar pergunta" under the questions replaces "Adicionar" above them (AD-056).
  const ADD = 'Adicionar pergunta';
  const editors = () => [...sheet.querySelectorAll<HTMLElement>('div[data-slot="question-editor"]')];
  const titles = () => editors().map((editor) => editor.querySelector('strong')?.textContent?.trim());

  async function add(...labels: string[]) {
    for (const label of labels) {
      button(sheet, ADD).click();
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
    button(sheet, ADD).click();
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
      button(sheet, ADD).click();
    }
    await settle();
    expect(questionFields(sheet)).toHaveLength(100);
    expect(button(sheet, ADD).disabled).toBe(true);
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
      items: [{ label: 'x'.repeat(200), type: 'TEXT' }],
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
    // "Enunciado" is required and opens empty: the red mark (AD-053).
    expect(
      sheet.querySelector('label[for="question-0"]')?.textContent?.replace(/\s+/g, ' ').trim(),
    ).toBe('Enunciado *');
    const optionLabels = [...typeSelect(0).options].map((option) => option.textContent?.trim());
    expect(optionLabels).toEqual([
      'Texto livre',
      'Sim ou não',
      'Conforme / não conforme',
      'Nota de 0 a 10',
    ]);
    // A new question starts at "Texto livre", as the mareos drawer (work-order-ui C39).
    expect(typeSelect(0).value).toBe('TEXT');

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

  it('drawer-standard C32 Adicionar pergunta adds the next block with Texto livre and stops at 100', async () => {
    const addButton = () => sheet.querySelector<HTMLButtonElement>('button[data-slot="drawer-add"]')!;
    const typeSelect = (index: number) =>
      sheet.querySelector<HTMLSelectElement>(`#question-type-${index}`)!;
    const typeLabel = (index: number) => typeSelect(index).selectedOptions[0]?.textContent?.trim();

    expect(addButton().textContent?.trim()).toBe('Adicionar pergunta');
    fill(questionFields(sheet)[0], 'A');
    await settle();

    // 1 question → "Pergunta 02" at the end, its "Enunciado" empty and "Texto livre".
    addButton().click();
    await settle();
    expect(titles()).toEqual(['Pergunta 01', 'Pergunta 02']);
    expect(editors().map((editor) => editor.getAttribute('aria-label'))).toEqual([
      'Pergunta 01',
      'Pergunta 02',
    ]);
    expect(questions(sheet)).toEqual(['A', '']);
    expect([typeSelect(1).value, typeLabel(1)]).toEqual(['TEXT', 'Texto livre']);
    expect(
      editors().at(-1)!.compareDocumentPosition(addButton()) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    for (let count = 2; count < 99; count++) {
      addButton().click();
    }
    await settle();
    expect(editors()).toHaveLength(99);
    expect(addButton().disabled).toBe(false);

    // 99 questions → the 100th, numbered after the last, then the button is disabled.
    addButton().click();
    await settle();
    expect(editors()).toHaveLength(100);
    expect(titles().slice(-2)).toEqual(['Pergunta 99', 'Pergunta 100']);
    expect(questions(sheet).at(-1)).toBe('');
    expect([typeSelect(99).value, typeLabel(99)]).toEqual(['TEXT', 'Texto livre']);
    expect(addButton().disabled).toBe(true);

    // At 100 a use adds nothing.
    addButton().click();
    await settle();
    expect(editors()).toHaveLength(100);
    expect(questionFields(sheet)).toHaveLength(100);
    controller.expectNone(() => true);
  });

  it('drawer-standard C33 Subir, Descer and Remover pergunta show from two questions with the trash icon', async () => {
    const controls = (editor: HTMLElement) =>
      [...editor.querySelectorAll('button')].map((control) => control.getAttribute('aria-label'));

    // One question: no "Subir", "Descer" or "Remover pergunta 1".
    expect(editors()).toHaveLength(1);
    expect(controls(editors()[0])).toEqual([]);
    expect(buttons(sheet, 'Subir')).toEqual([]);
    expect(buttons(sheet, 'Descer')).toEqual([]);
    expect(buttons(sheet, 'Remover pergunta 1')).toEqual([]);

    // Two: each block shows them, "Remover pergunta <n>" with the trash icon.
    button(sheet, ADD).click();
    await settle();
    expect(editors().map(controls)).toEqual([
      ['Subir', 'Descer', 'Remover pergunta 1'],
      ['Subir', 'Descer', 'Remover pergunta 2'],
    ]);
    expect(
      editors().map((editor, index) =>
        buttons(editor, `Remover pergunta ${index + 1}`)[0]
          .firstElementChild?.getAttribute('name'),
      ),
    ).toEqual(['lucideTrash', 'lucideTrash']);

    // Back to one: none of them.
    button(sheet, 'Remover pergunta 2').click();
    await settle();
    expect(editors()).toHaveLength(1);
    expect(controls(editors()[0])).toEqual([]);
  });
});
