import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthenticationService } from '../../../identity/authentication/authentication.service';
import type { Role } from '../../../identity/user/user.service';
import { toast } from '../../../shared/components/ui/toaster';
import { InspectionTemplateList } from '../inspection-template-list/inspection-template-list';
import { button, buttons, fill, questionFields, settle, sheets, summary } from './testing';

describe('InspectionTemplateList', () => {
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    controller.verify();
    vi.restoreAllMocks();
  });

  async function render(role: Role | null, templates = [summary('t2', 'Solda', 3), summary('t1', 'Pintura', 12)], total = 2) {
    TestBed.inject(AuthenticationService).role.set(role);
    const fixture = TestBed.createComponent(InspectionTemplateList);
    await settle();
    controller.expectOne('/api/inspection-templates?page=1').flush({ inspectionTemplates: templates, total });
    await settle();
    return fixture.nativeElement as HTMLElement;
  }

  async function openNew(element: HTMLElement) {
    button(element, 'Novo modelo').click();
    await settle();
    return sheets(element)[0];
  }

  it('template C15 lists name and question count, links each row and pages', async () => {
    const element = await render('operator', undefined, 11);

    expect(element.querySelector('h1')?.textContent?.trim()).toBe('Modelos de inspeção');
    const rows = [...element.querySelectorAll('tbody tr')].map((row) =>
      [...row.querySelectorAll('td')].map((cell) => cell.textContent?.trim()),
    );
    expect(rows).toEqual([
      ['Solda', '3'],
      ['Pintura', '12'],
    ]);
    expect(
      [...element.querySelectorAll('tbody a')].map((anchor) => anchor.getAttribute('href')),
    ).toEqual(['/inspection-templates/t2', '/inspection-templates/t1']);

    [...element.querySelectorAll('a')].find((anchor) => anchor.textContent?.trim() === '2')?.click();
    await settle();
    controller.expectOne('/api/inspection-templates?page=2').flush({ inspectionTemplates: [], total: 11 });
  });

  it('template C16 an empty list says Nenhum modelo de inspeção encontrado', async () => {
    const element = await render('operator', [], 0);

    expect(element.textContent).toContain('Nenhum modelo de inspeção encontrado');
  });

  it('template C19 renders Novo modelo only for administrator', async () => {
    expect(buttons(await render('administrator'), 'Novo modelo')).toHaveLength(1);

    for (const role of ['operator', 'inspector', null] as const) {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
      });
      controller = TestBed.inject(HttpTestingController);

      expect(buttons(await render(role), 'Novo modelo'), String(role)).toEqual([]);
    }
  });

  it('template C25 creates a template in the order shown and reloads the list', async () => {
    const success = vi.spyOn(toast, 'success');
    const element = await render('administrator');
    const sheet = await openNew(element);

    fill(sheet.querySelector<HTMLInputElement>('#template-name')!, 'Pintura do casco');
    fill(questionFields(sheet)[0], 'Casco limpo');
    button(sheet, 'Adicionar pergunta').click();
    await settle();
    fill(questionFields(sheet)[1], 'Pintura sem bolhas');
    buttons(sheet, 'Subir')[1].click();
    await settle();
    sheet.querySelector('form')!.requestSubmit();
    await settle();

    const created = controller.expectOne('/api/inspection-templates');
    expect(created.request.method).toBe('POST');
    expect(created.request.body).toEqual({
      name: 'Pintura do casco',
      items: [{ label: 'Pintura sem bolhas' }, { label: 'Casco limpo' }],
    });
    created.flush({ inspectionTemplate: { id: 't3' } }, { status: 201, statusText: 'Created' });
    await settle();

    expect(success).toHaveBeenCalledWith('Modelo de inspeção criado com sucesso', {
      description: 'O modelo de inspeção foi criado com sucesso.',
    });
    expect(sheets(element)).toEqual([]);
    controller
      .expectOne('/api/inspection-templates?page=1')
      .flush({ inspectionTemplates: [summary('t3', 'Pintura do casco', 2)], total: 3 });
    await settle();
    expect(element.querySelector('tbody td')?.textContent?.trim()).toBe('Pintura do casco');
  });

  it('template C27 a 409 keeps the sheet open with the typed name', async () => {
    const error = vi.spyOn(toast, 'error');
    const element = await render('administrator');
    const sheet = await openNew(element);

    fill(sheet.querySelector<HTMLInputElement>('#template-name')!, 'Solda');
    fill(questionFields(sheet)[0], 'Cordão contínuo');
    sheet.querySelector('form')!.requestSubmit();
    await settle();
    controller
      .expectOne('/api/inspection-templates')
      .flush({ statusCode: 409, message: 'Inspection template already exists' }, { status: 409, statusText: 'Conflict' });
    await settle();

    expect(error).toHaveBeenCalledWith('Já existe um modelo de inspeção com este nome');
    expect(sheets(element)).toHaveLength(1);
    expect(sheets(element)[0].querySelector<HTMLInputElement>('#template-name')!.value).toBe('Solda');
    expect(questionFields(sheets(element)[0])[0].value).toBe('Cordão contínuo');
  });
});
