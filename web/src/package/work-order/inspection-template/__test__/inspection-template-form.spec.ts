import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthenticationService } from '../../../identity/authentication/authentication.service';
import { InspectionTemplateList } from '../inspection-template-list/inspection-template-list';
import { button, buttons, fill, questionFields, questions, settle, sheets } from './testing';

// The form is reached as an Administrator reaches it: "Novo modelo" on the list page.
describe('InspectionTemplate form', () => {
  let controller: HttpTestingController;
  let element: HTMLElement;
  let sheet: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    controller = TestBed.inject(HttpTestingController);
    TestBed.inject(AuthenticationService).role.set('administrator');

    const fixture = TestBed.createComponent(InspectionTemplateList);
    await settle();
    controller.expectOne('/api/inspection-templates?page=1').flush({ inspectionTemplates: [], total: 0 });
    await settle();
    element = fixture.nativeElement as HTMLElement;
    button(element, 'Novo modelo').click();
    await settle();
    sheet = sheets(element)[0];
  });

  afterEach(() => controller.verify());

  const name = () => sheet.querySelector<HTMLInputElement>('#template-name')!;

  async function add(...labels: string[]) {
    for (const label of labels) {
      button(sheet, 'Adicionar pergunta').click();
      await settle();
      fill(questionFields(sheet).at(-1)!, label);
    }
    await settle();
  }

  it('template C20 Novo modelo opens the sheet with an empty name and one question', () => {
    expect(sheets(element)).toHaveLength(1);
    expect(sheet.querySelector('h2')?.textContent?.trim()).toBe('Novo modelo de inspeção');
    expect(name().value).toBe('');
    expect(questions(sheet)).toEqual(['']);
  });

  it('template C21 Adicionar pergunta appends an empty question', async () => {
    fill(questionFields(sheet)[0], 'A');
    await settle();
    button(sheet, 'Adicionar pergunta').click();
    await settle();

    expect(questions(sheet)).toEqual(['A', '']);
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

    expect(buttons(sheet, 'Subir').map((control) => control.disabled)).toEqual([true, false, false]);
    expect(buttons(sheet, 'Descer').map((control) => control.disabled)).toEqual([false, false, true]);
  });

  it('template C23 Remover drops a question and the limits disable the controls', async () => {
    expect(button(sheet, 'Remover').disabled).toBe(true);

    fill(questionFields(sheet)[0], 'A');
    await add('B', 'C');
    buttons(sheet, 'Remover')[1].click();
    await settle();
    expect(questions(sheet)).toEqual(['A', 'C']);

    for (let count = 2; count < 100; count++) {
      button(sheet, 'Adicionar pergunta').click();
    }
    await settle();
    expect(questionFields(sheet)).toHaveLength(100);
    expect(button(sheet, 'Adicionar pergunta').disabled).toBe(true);
  });

  it('template C24 shows the field errors and sends nothing', async () => {
    sheet.querySelector('form')!.requestSubmit();
    await settle();
    expect(sheet.textContent).toContain('Nome é obrigatório');
    expect(sheet.textContent).toContain('Pergunta é obrigatória');

    fill(name(), '   ');
    fill(questionFields(sheet)[0], 'x'.repeat(201));
    await settle();
    sheet.querySelector('form')!.requestSubmit();
    await settle();
    expect(sheet.textContent).toContain('Nome é obrigatório');
    expect(sheet.textContent).toContain('Pergunta deve ter no máximo 200 caracteres');

    fill(name(), 'n'.repeat(101));
    fill(questionFields(sheet)[0], 'x'.repeat(200));
    await settle();
    sheet.querySelector('form')!.requestSubmit();
    await settle();
    expect(sheet.textContent).toContain('Nome deve ter no máximo 100 caracteres');
    expect(sheet.textContent).not.toContain('Pergunta deve ter no máximo');

    controller.expectNone('/api/inspection-templates');
  });
});
