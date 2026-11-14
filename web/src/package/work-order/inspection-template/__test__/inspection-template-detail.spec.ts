import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { AuthenticationService } from '../../../identity/authentication/authentication.service';
import type { Role } from '../../../identity/user/user.service';
import { toast } from '../../../shared/components/ui/toaster';
import { InspectionTemplateDetail } from '../inspection-template-detail/inspection-template-detail';
import { button, buttons, fill, questionFields, questions, settle, sheets, template } from './testing';

describe('InspectionTemplateDetail', () => {
  let controller: HttpTestingController;

  const configure = () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    controller = TestBed.inject(HttpTestingController);
  };

  beforeEach(configure);

  afterEach(() => {
    controller.verify();
    vi.restoreAllMocks();
  });

  async function render(role: Role | null, body: object = { inspectionTemplate: template(['Casco limpo', 'Pintura sem bolhas']) }) {
    TestBed.inject(AuthenticationService).role.set(role);
    const fixture = TestBed.createComponent(InspectionTemplateDetail);
    fixture.componentRef.setInput('id', 't1');
    await settle();
    controller.expectOne('/api/inspection-templates/t1').flush(body);
    await settle();
    return fixture.nativeElement as HTMLElement;
  }

  const listed = (element: HTMLElement) =>
    [...element.querySelectorAll('ol li')].map((item) => item.textContent?.replace(/\s+/g, ' ').trim());

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
    expect(listed(element)).toEqual(['1. Casco limpo', '2. Pintura sem bolhas']);
  });

  it('template C18 a 404 says Modelo de inspeção não encontrado', async () => {
    TestBed.inject(AuthenticationService).role.set('administrator');
    const fixture = TestBed.createComponent(InspectionTemplateDetail);
    fixture.componentRef.setInput('id', 't1');
    await settle();
    controller
      .expectOne('/api/inspection-templates/t1')
      .flush({ statusCode: 404, message: 'Inspection template not found' }, { status: 404, statusText: 'Not Found' });
    await settle();
    const element = fixture.nativeElement as HTMLElement;

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
    expect(sheet.querySelector('h2')?.textContent?.trim()).toBe('Editar modelo de inspeção');
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
      items: [{ label: 'Pintura sem bolhas' }, { label: 'Casco limpo e seco' }],
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
    expect(listed(element)).toEqual(['1. Pintura sem bolhas', '2. Casco limpo e seco']);
  });

  it('template C28 confirms, deletes and returns to the list; cancel sends nothing', async () => {
    const success = vi.spyOn(toast, 'success');
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
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
    expect(navigate).toHaveBeenCalledWith(['/inspection-templates']);
  });

  it('template C33 an edit saved without changes sends back what it received', async () => {
    const labels = ['Casco limpo', 'Pintura sem bolhas', 'Casco limpo'];
    const element = await render('administrator', { inspectionTemplate: template(labels, 'Pintura') });

    button(element, 'Editar').click();
    await settle();
    sheets(element)[0].querySelector('form')!.requestSubmit();
    await settle();

    const updated = controller.expectOne('/api/inspection-templates/t1');
    expect(updated.request.body).toEqual({
      name: 'Pintura',
      items: labels.map((label) => ({ label })),
    });
    updated.flush({ inspectionTemplate: template(labels, 'Pintura') });
    await settle();
    controller.expectOne('/api/inspection-templates/t1').flush({ inspectionTemplate: template(labels, 'Pintura') });
  });
});
