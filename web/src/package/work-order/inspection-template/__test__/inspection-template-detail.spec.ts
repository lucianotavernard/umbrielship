import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { provideLocationMocks } from '@angular/common/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { AuthenticationService } from '../../../identity/authentication/authentication.service';
import type { Role } from '../../../identity/user/user.service';
import { toast } from '../../../shared/components/ui/toaster';
import { InspectionTemplateDetail } from '../inspection-template-detail/inspection-template-detail';
import {
  button,
  buttons,
  fill,
  questionFields,
  questions,
  settle,
  sheets,
  template,
} from './testing';

@Component({ template: '' })
class Stub {}

describe('InspectionTemplateDetail', () => {
  let controller: HttpTestingController;

  const configure = () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'inspections', component: Stub }]),
        provideLocationMocks(),
      ],
    });
    controller = TestBed.inject(HttpTestingController);
  };

  beforeEach(configure);

  afterEach(() => {
    controller.verify();
    vi.restoreAllMocks();
  });

  const text = (node: Element | null | undefined) => node?.textContent?.replace(/\s+/g, ' ').trim();

  async function render(
    role: Role | null,
    body: object = { inspectionTemplate: template(['Casco limpo', 'Pintura sem bolhas']) },
  ) {
    TestBed.inject(AuthenticationService).role.set(role);
    const fixture = TestBed.createComponent(InspectionTemplateDetail);
    fixture.componentRef.setInput('id', 't1');
    await settle();
    controller.expectOne('/api/inspection-templates/t1').flush(body);
    await settle();
    return fixture.nativeElement as HTMLElement;
  }

  async function renderNotFound(role: Role) {
    TestBed.inject(AuthenticationService).role.set(role);
    const fixture = TestBed.createComponent(InspectionTemplateDetail);
    fixture.componentRef.setInput('id', 't1');
    await settle();
    controller
      .expectOne('/api/inspection-templates/t1')
      .flush(
        { statusCode: 404, message: 'Inspection template not found' },
        { status: 404, statusText: 'Not Found' },
      );
    await settle();
    return fixture.nativeElement as HTMLElement;
  }

  // The question and its number; the type's label is checked on its own (C5).
  const listed = (element: HTMLElement) =>
    [...element.querySelectorAll('ol li')].map((item) => {
      const copy = item.cloneNode(true) as HTMLElement;
      copy.querySelector('[data-slot="type"]')?.remove();
      return copy.textContent?.replace(/\s+/g, ' ').trim();
    });

  it('work-order-ui C44 shows the breadcrumb, kicker, count and numbered questions', async () => {
    const element = await render('operator', {
      inspectionTemplate: {
        id: 't1',
        name: 'Pintura do casco',
        createdAt: '2026-11-18T15:00:00.000Z',
        items: [
          { id: 'i1', label: 'Nota do acabamento', position: 1, type: 'SCORE' },
          { id: 'i0', label: 'Casco limpo?', position: 0, type: 'YES_NO' },
        ],
      },
    });

    const breadcrumb = element.querySelector('nav')!;
    expect([...breadcrumb.children].map((part) => text(part))).toEqual([
      'Inspeções',
      '/',
      'Pintura do casco',
    ]);
    expect(breadcrumb.querySelector('a')?.getAttribute('href')).toBe('/inspections');
    expect(text(breadcrumb.querySelector('a'))).toBe('Inspeções');
    expect(text(element.querySelector('[data-slot="kicker"]'))).toBe('MODELO DE INSPEÇÃO');
    expect(text(element.querySelector('h1'))).toBe('Pintura do casco');
    expect(text(element.querySelector('[data-slot="summary"]'))).toBe(
      '2 perguntas · criado em 18/11/2026',
    );
    expect(
      [...element.querySelectorAll('ol li')].map((item) => [
        text(item.querySelector('[data-slot="number"]')),
        text(item.querySelector('[data-slot="label"]')),
        text(item.querySelector('[data-slot="type"]')),
      ]),
    ).toEqual([
      ['01', 'Casco limpo?', 'Sim/Não'],
      ['02', 'Nota do acabamento', 'Nota de 0 a 10'],
    ]);
    expect(buttons(element, 'Editar')).toEqual([]);
    expect(buttons(element, 'Excluir')).toEqual([]);
  });

  it('work-order-ui C44 edits in the Editar modelo drawer and deletes back to the hub', async () => {
    const success = vi.spyOn(toast, 'success');
    const element = await render('administrator');

    button(element, 'Editar').click();
    await settle();
    const sheet = sheets(element)[0];
    expect(text(sheet.querySelector('[data-slot="sheet-kicker"]'))).toBe('BIBLIOTECA DE INSPEÇÕES');
    expect(text(sheet.querySelector('h2'))).toBe('Editar modelo');
    expect(text(sheet.querySelector('[data-slot="sheet-description"]'))).toBe(
      'Altere o nome e as perguntas; atribuições já feitas mantêm as perguntas antigas',
    );
    expect(sheet.querySelector<HTMLInputElement>('#template-name')!.value).toBe('Pintura do casco');
    expect(questions(sheet)).toEqual(['Casco limpo', 'Pintura sem bolhas']);
    expect(buttons(sheet, 'Criar modelo')).toEqual([]);

    fill(sheet.querySelector<HTMLInputElement>('#template-name')!, 'Pintura e casco');
    await settle();
    button(sheet, 'Salvar alterações').click();
    await settle();
    const updated = controller.expectOne('/api/inspection-templates/t1');
    expect(updated.request.method).toBe('PUT');
    expect(updated.request.body).toEqual({
      name: 'Pintura e casco',
      items: [
        { label: 'Casco limpo', type: 'CONFORMITY' },
        { label: 'Pintura sem bolhas', type: 'CONFORMITY' },
      ],
    });
    updated.flush({
      inspectionTemplate: template(['Casco limpo', 'Pintura sem bolhas'], 'Pintura e casco'),
    });
    await settle();
    expect(success).toHaveBeenCalledWith('Modelo de inspeção atualizado com sucesso', {
      description: 'O modelo de inspeção foi atualizado com sucesso.',
    });
    expect(sheets(element)).toEqual([]);
    controller
      .expectOne('/api/inspection-templates/t1')
      .flush({
        inspectionTemplate: template(['Casco limpo', 'Pintura sem bolhas'], 'Pintura e casco'),
      });
    await settle();
    expect(text(element.querySelector('h1'))).toBe('Pintura e casco');

    button(element, 'Excluir').click();
    await settle();
    const dialog = sheets(element)[0];
    expect(text(dialog.querySelector('h2'))).toBe('Excluir modelo de inspeção');
    expect(dialog.textContent).toContain(
      'Tem certeza que deseja excluir este modelo? Esta ação não pode ser desfeita.',
    );
    button(dialog, 'Confirmar').click();
    const deleted = controller.expectOne('/api/inspection-templates/t1');
    expect(deleted.request.method).toBe('DELETE');
    deleted.flush(null, { status: 204, statusText: 'No Content' });
    await settle();

    expect(success).toHaveBeenCalledWith('Modelo de inspeção excluído com sucesso', {
      description: 'O modelo de inspeção foi excluído com sucesso.',
    });
    expect(TestBed.inject(Router).url).toBe('/inspections');
  });

  it('work-order-ui C45 a 404 shows the not found state with the way back', async () => {
    const element = await renderNotFound('administrator');

    const state = element.querySelector('[data-slot="not-found"]')!;
    expect(text(state.querySelector('h1'))).toBe('Modelo de inspeção não encontrado');
    const way = [...state.querySelectorAll('a')];
    expect(way.map((link) => [text(link), link.getAttribute('href')])).toEqual([
      ['Voltar para inspeções', '/inspections'],
    ]);
    expect(buttons(element, 'Editar')).toEqual([]);
    expect(buttons(element, 'Excluir')).toEqual([]);
  });

  it('template C17 shows the name and the questions numbered from 1', async () => {
    const element = await render('operator', {
      inspectionTemplate: {
        ...template([]),
        items: [
          { id: 'i1', label: 'Pintura sem bolhas', position: 1 },
          { id: 'i0', label: 'Casco limpo', position: 0 },
        ],
      },
    });

    expect(element.querySelector('h1')?.textContent?.trim()).toBe('Pintura do casco');
    expect(listed(element)).toEqual(['01 Casco limpo', '02 Pintura sem bolhas']);
  });

  it('template C18 a 404 says Modelo de inspeção não encontrado', async () => {
    const element = await renderNotFound('administrator');

    expect(element.textContent).toContain('Modelo de inspeção não encontrado');
    expect(buttons(element, 'Editar')).toEqual([]);
  });

  it('template C19 renders Editar and Excluir only for administrator', async () => {
    const admin = await render('administrator');
    expect(buttons(admin, 'Editar')).toHaveLength(1);
    expect(buttons(admin, 'Excluir')).toHaveLength(1);

    for (const role of ['operator', 'inspector', null] as const) {
      TestBed.resetTestingModule();
      configure();
      const element = await render(role);

      expect(buttons(element, 'Editar'), String(role)).toEqual([]);
      expect(buttons(element, 'Excluir'), String(role)).toEqual([]);
      expect(listed(element), String(role)).toHaveLength(2);
    }
  });

  it('template C26 edits the template from a prefilled sheet and reloads it', async () => {
    const success = vi.spyOn(toast, 'success');
    const element = await render('administrator');

    button(element, 'Editar').click();
    await settle();
    const sheet = sheets(element)[0];
    expect(sheet.querySelector('h2')?.textContent?.trim()).toBe('Editar modelo');
    expect(sheet.querySelector<HTMLInputElement>('#template-name')!.value).toBe('Pintura do casco');
    expect(questions(sheet)).toEqual(['Casco limpo', 'Pintura sem bolhas']);

    buttons(sheet, 'Descer')[0].click();
    await settle();
    fill(questionFields(sheet)[1], 'Casco limpo e seco');
    sheet.querySelector('form')!.requestSubmit();
    await settle();

    const updated = controller.expectOne('/api/inspection-templates/t1');
    expect(updated.request.method).toBe('PUT');
    expect(updated.request.body).toEqual({
      name: 'Pintura do casco',
      items: [
        { label: 'Pintura sem bolhas', type: 'CONFORMITY' },
        { label: 'Casco limpo e seco', type: 'CONFORMITY' },
      ],
    });
    updated.flush({ inspectionTemplate: template(['Pintura sem bolhas', 'Casco limpo e seco']) });
    await settle();

    expect(success).toHaveBeenCalledWith('Modelo de inspeção atualizado com sucesso', {
      description: 'O modelo de inspeção foi atualizado com sucesso.',
    });
    expect(sheets(element)).toEqual([]);
    controller
      .expectOne('/api/inspection-templates/t1')
      .flush({ inspectionTemplate: template(['Pintura sem bolhas', 'Casco limpo e seco']) });
    await settle();
    expect(listed(element)).toEqual(['01 Pintura sem bolhas', '02 Casco limpo e seco']);
  });

  it('template C27 a 409 on edit keeps the sheet open with what was typed', async () => {
    const error = vi.spyOn(toast, 'error');
    const element = await render('administrator');

    button(element, 'Editar').click();
    await settle();
    const sheet = sheets(element)[0];
    fill(sheet.querySelector<HTMLInputElement>('#template-name')!, 'Solda');
    fill(questionFields(sheet)[0], 'Cordão contínuo');
    sheet.querySelector('form')!.requestSubmit();
    await settle();
    const updated = controller.expectOne('/api/inspection-templates/t1');
    expect(updated.request.method).toBe('PUT');
    updated.flush(
      { statusCode: 409, message: 'Inspection template already exists' },
      { status: 409, statusText: 'Conflict' },
    );
    await settle();

    expect(error).toHaveBeenCalledWith('Já existe um modelo de inspeção com este nome');
    expect(sheets(element)).toHaveLength(1);
    expect(sheets(element)[0].querySelector<HTMLInputElement>('#template-name')!.value).toBe(
      'Solda',
    );
    expect(questions(sheets(element)[0])).toEqual(['Cordão contínuo', 'Pintura sem bolhas']);
  });

  it('template C28 confirms, deletes and returns to the hub; cancel sends nothing', async () => {
    const success = vi.spyOn(toast, 'success');
    const element = await render('administrator');

    button(element, 'Excluir').click();
    await settle();
    let dialog = sheets(element)[0];
    expect(dialog.querySelector('h2')?.textContent?.trim()).toBe('Excluir modelo de inspeção');
    expect(dialog.textContent).toContain(
      'Tem certeza que deseja excluir este modelo? Esta ação não pode ser desfeita.',
    );

    button(dialog, 'Cancelar').click();
    await settle();
    expect(sheets(element)).toEqual([]);
    controller.expectNone((request) => request.method === 'DELETE');

    button(element, 'Excluir').click();
    await settle();
    dialog = sheets(element)[0];
    button(dialog, 'Confirmar').click();
    const deleted = controller.expectOne('/api/inspection-templates/t1');
    expect(deleted.request.method).toBe('DELETE');
    deleted.flush(null, { status: 204, statusText: 'No Content' });
    await settle();

    expect(success).toHaveBeenCalledWith('Modelo de inspeção excluído com sucesso', {
      description: 'O modelo de inspeção foi excluído com sucesso.',
    });
    expect(TestBed.inject(Router).url).toBe('/inspections');
  });

  it('template C33 an edit saved without changes sends back what it received', async () => {
    const labels = ['Casco limpo', 'Pintura sem bolhas', 'Casco limpo'];
    const element = await render('administrator', {
      inspectionTemplate: template(labels, 'Pintura'),
    });

    button(element, 'Editar').click();
    await settle();
    sheets(element)[0].querySelector('form')!.requestSubmit();
    await settle();

    const updated = controller.expectOne('/api/inspection-templates/t1');
    expect(updated.request.body).toEqual({
      name: 'Pintura',
      items: labels.map((label) => ({ label, type: 'CONFORMITY' })),
    });
    updated.flush({ inspectionTemplate: template(labels, 'Pintura') });
    await settle();
    controller
      .expectOne('/api/inspection-templates/t1')
      .flush({ inspectionTemplate: template(labels, 'Pintura') });
  });

  it("inspection C5 shows each question's type label", async () => {
    const element = await render('operator', {
      inspectionTemplate: {
        ...template([]),
        items: [
          { id: 'i0', label: 'Observações', position: 0, type: 'TEXT' },
          { id: 'i1', label: 'Limpo?', position: 1, type: 'YES_NO' },
          { id: 'i2', label: 'Pintura', position: 2, type: 'CONFORMITY' },
          { id: 'i3', label: 'Acabamento', position: 3, type: 'SCORE' },
        ],
      },
    });

    expect(
      [...element.querySelectorAll('ol li [data-slot="type"]')].map((node) =>
        node.textContent?.trim(),
      ),
    ).toEqual(['Texto livre', 'Sim/Não', 'Conforme/Não conforme', 'Nota de 0 a 10']);
  });
});
