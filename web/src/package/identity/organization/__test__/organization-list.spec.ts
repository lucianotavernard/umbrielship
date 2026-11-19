import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { toast } from '../../../shared/components/ui/toaster';
import { OrganizationList } from '../organization-list/organization-list';

describe('OrganizationList', () => {
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

  async function settle() {
    await new Promise((resolve) => setTimeout(resolve));
    TestBed.tick();
  }

  function fill(element: HTMLElement, selector: string, value: string) {
    const field = element.querySelector<HTMLInputElement>(selector);
    if (!field) throw new Error(selector);
    field.value = value;
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));
  }

  const squash = (node: Element | null | undefined) => node?.textContent?.replace(/\s+/g, ' ').trim();
  const drawer = () => document.querySelector<HTMLElement>('[data-slot="sheet-content"]');

  async function click(target: Element | null | undefined) {
    if (!target) throw new Error('nothing to click');
    (target as HTMLElement).click();
    await settle();
  }

  const buttonByText = (text: string, root: ParentNode = document) =>
    [...root.querySelectorAll<HTMLButtonElement>('button')].find((button) => squash(button) === text);

  /** A label as it reads: its own text, then " *" only when it carries the required mark. */
  function labelText(label: Element) {
    const copy = label.cloneNode(true) as Element;
    const marks = [...copy.querySelectorAll('[data-slot="required-mark"]')];
    marks.forEach((mark) => mark.remove());
    return `${squash(copy)}${marks.length ? ' *' : ''}`;
  }

  /** A footer button as it reads: its type, its first child, its text and whether it is disabled. */
  function readButton(button: HTMLButtonElement | null | undefined) {
    const first = button?.firstElementChild;
    return {
      type: button?.type,
      first: first ? `${first.tagName.toLowerCase()}[name="${first.getAttribute('name')}"]` : null,
      label: squash(button),
      disabled: button?.disabled,
    };
  }

  /** The frame of the open drawer: header, width, cards with their labels, footer. */
  function readFrame(sheet: HTMLElement) {
    const footer = sheet.querySelector('footer[data-slot="drawer-footer"]');
    return {
      kicker: squash(sheet.querySelector('[data-slot="sheet-kicker"]')),
      title: squash(sheet.querySelector('[data-slot="sheet-title"]')),
      description: squash(sheet.querySelector('[data-slot="sheet-description"]')),
      closeLabel: sheet.querySelector('header button')?.getAttribute('aria-label'),
      widths: sheet.className.split(/\s+/).filter((token) => token.startsWith('sm:max-w-')),
      cards: [...sheet.querySelectorAll('section[data-slot="drawer-card"]')].map((card) => ({
        title: squash(card.querySelector('[data-slot="drawer-card-title"]')),
        subtitle: squash(card.querySelector('[data-slot="drawer-card-subtitle"]')),
        icon: card.querySelector('[data-slot="drawer-card-icon"]')?.getAttribute('data-icon'),
        labels: [...card.querySelectorAll('label')].map(labelText),
      })),
      hint: squash(footer?.querySelector('[data-slot="required-hint"]')),
      buttons: [...(footer?.querySelectorAll<HTMLButtonElement>('button') ?? [])].map(readButton),
    };
  }

  const submitButton = (sheet: HTMLElement) =>
    sheet.querySelector<HTMLButtonElement>('footer[data-slot="drawer-footer"] button[type="submit"]');

  /** The messages shown in the drawer, by the id of the field whose group shows them. */
  function messages(sheet: HTMLElement) {
    const shown: Record<string, string[]> = {};
    for (const group of sheet.querySelectorAll('t-form-group')) {
      const errors = [...group.querySelectorAll('[data-slot="error"]')].map((error) => squash(error) ?? '');
      if (errors.length) shown[group.querySelector('input, select, textarea')?.id ?? 'no field'] = errors;
    }
    return shown;
  }

  const errorCount = (sheet: HTMLElement) => sheet.querySelectorAll('[data-slot="error"], t-input-error').length;
  const invalidFields = (sheet: HTMLElement) => [...sheet.querySelectorAll('[data-invalid]')].map((field) => field.id);
  const pending = () => controller.match(() => true).map(({ request }) => `${request.method} ${request.urlWithParams}`);
  const values = () =>
    ['#organization-name', '#organization-email'].map(
      (selector) => drawer()?.querySelector<HTMLInputElement>(selector)?.value,
    );

  const saveButton = (label: string) => ({
    type: 'submit',
    first: 'ng-icon[name="lucideCheck"]',
    label,
    disabled: false,
  });
  const saving = { type: 'submit', first: 'ng-icon[name="lucideLoader2"]', label: 'Salvando...', disabled: true };

  it('[C87] renders the organization and posts the create body', async () => {
    const fixture = TestBed.createComponent(OrganizationList);
    await settle();
    controller.expectOne('/api/organizations?page=1&per_page=10').flush({
      organizations: [{ id: 'org-1', name: 'Atlantic', email: 'ops@atlantic.test', isInternal: false }],
      total: 1,
    });
    await settle();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('table[tTable]')?.textContent).toContain('Atlantic');
    expect(element.textContent).toContain('ops@atlantic.test');

    [...element.querySelectorAll('button')].find((button) => button.textContent?.includes('Nova Organização'))?.click();
    await settle();
    const sheet = element.querySelector('t-sheet');
    expect(sheet?.querySelector('#organization-name')).toBeTruthy();
    expect(sheet?.querySelector('#organization-email')).toBeTruthy();
    fill(element, '#organization-name', 'Atlantic');
    fill(element, '#organization-email', 'ops@atlantic.test');
    await settle();
    element.querySelector<HTMLButtonElement>('t-sheet button[type="submit"]')?.click();
    await settle();

    const created = controller.expectOne('/api/organizations');
    expect(created.request.method).toBe('POST');
    expect(created.request.body).toEqual({ name: 'Atlantic', email: 'ops@atlantic.test' });
    created.flush({ id: 'org-2', name: 'Atlantic', email: 'ops@atlantic.test', isInternal: false });
    await settle();
    controller.expectOne('/api/organizations?page=1&per_page=10').flush({ organizations: [], total: 0 });
  });

  it('[C87] an empty list says Nenhuma organização encontrada', async () => {
    TestBed.createComponent(OrganizationList);
    await settle();
    controller.expectOne('/api/organizations?page=1&per_page=10').flush({ organizations: [], total: 0 });
    await settle();
    expect(document.body.textContent).toContain('Nenhuma organização encontrada');
  });

  it('drawer-standard D16 Nova organização opens with GESTÃO / ORGANIZAÇÕES and posts once', async () => {
    const success = vi.spyOn(toast, 'success');
    const error = vi.spyOn(toast, 'error');
    const fixture = TestBed.createComponent(OrganizationList);
    const element = fixture.nativeElement as HTMLElement;
    await settle();
    controller.expectOne('/api/organizations?page=1&per_page=10').flush({
      organizations: [{ id: 'org-1', name: 'Atlantic', email: 'ops@atlantic.test', isInternal: false }],
      total: 1,
    });
    await settle();

    await click(buttonByText('Nova Organização', element));
    const sheet = drawer()!;
    expect(readFrame(sheet)).toEqual({
      kicker: 'GESTÃO / ORGANIZAÇÕES',
      title: 'Nova organização',
      description: 'Preencha os campos abaixo para criar uma nova organização',
      closeLabel: 'Fechar formulário',
      widths: ['sm:max-w-[580px]'],
      cards: [
        {
          title: 'Detalhes da organização',
          subtitle: 'Informações básicas sobre a organização',
          icon: 'lucideBuilding2',
          labels: ['Nome *', 'E-mail *'],
        },
      ],
      hint: '* Campos obrigatórios',
      buttons: [
        { type: 'button', first: 'ng-icon[name="lucideX"]', label: 'Cancelar', disabled: false },
        // Enabled on the empty form (AC 24).
        saveButton('Criar organização'),
      ],
    });
    expect(document.activeElement?.id).toBe('organization-name');

    // Leaving "Nome" empty before any save attempt turns nothing red (AC 25).
    const name = sheet.querySelector<HTMLInputElement>('#organization-name')!;
    name.dispatchEvent(new FocusEvent('blur'));
    name.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    await settle();
    expect(messages(sheet)).toEqual({});
    expect(errorCount(sheet)).toBe(0);
    expect(invalidFields(sheet)).toEqual([]);

    // Saving the empty form sends nothing and speaks under each field.
    await click(submitButton(sheet));
    expect(pending()).toEqual([]);
    expect(messages(sheet)).toEqual({
      'organization-name': ['Nome é obrigatório'],
      'organization-email': ['E-mail é obrigatório'],
    });
    expect(errorCount(sheet)).toBe(2);
    expect(invalidFields(sheet)).toEqual(['organization-name', 'organization-email']);

    // Cancelar closes with no request, and the next opening starts clean.
    await click(buttonByText('Cancelar', sheet));
    expect(drawer()).toBeNull();
    expect(pending()).toEqual([]);
    await click(buttonByText('Nova Organização', element));
    expect(values()).toEqual(['', '']);
    expect(messages(drawer()!)).toEqual({});
    expect(errorCount(drawer()!)).toBe(0);
    expect(invalidFields(drawer()!)).toEqual([]);

    fill(drawer()!, '#organization-name', 'Boreal');
    fill(drawer()!, '#organization-email', 'ops@boreal.test');
    await settle();
    await click(submitButton(drawer()!));

    expect(readButton(submitButton(drawer()!))).toEqual(saving);
    const requests = controller.match(() => true);
    expect(requests.map(({ request }) => `${request.method} ${request.urlWithParams}`)).toEqual([
      'POST /api/organizations',
    ]);
    expect(requests[0].request.body).toEqual({ name: 'Boreal', email: 'ops@boreal.test' });
    requests[0].flush({ id: 'org-2', name: 'Boreal', email: 'ops@boreal.test', isInternal: false });
    await settle();
    controller.expectOne('/api/organizations?page=1&per_page=10').flush({ organizations: [], total: 0 });
    await settle();

    expect(success).toHaveBeenCalledWith('Organização criada com sucesso');
    expect(drawer()).toBeNull();
    expect(pending()).toEqual([]);

    // A failed request gives the save button back, enabled, with every value kept.
    await click(buttonByText('Nova Organização', element));
    expect(values()).toEqual(['', '']);
    fill(drawer()!, '#organization-name', 'Atlantic');
    fill(drawer()!, '#organization-email', 'ops@atlantic.test');
    await settle();
    await click(submitButton(drawer()!));

    expect(readButton(submitButton(drawer()!))).toEqual(saving);
    const failed = controller.match(() => true);
    expect(failed.map(({ request }) => `${request.method} ${request.urlWithParams}`)).toEqual([
      'POST /api/organizations',
    ]);
    expect(failed[0].request.body).toEqual({ name: 'Atlantic', email: 'ops@atlantic.test' });
    failed[0].flush({ message: 'Organization already exists' }, { status: 409, statusText: 'Conflict' });
    await settle();

    expect(error).toHaveBeenCalledWith('Erro ao criar organização', expect.anything());
    expect(drawer()).not.toBeNull();
    expect(readButton(submitButton(drawer()!))).toEqual(saveButton('Criar organização'));
    expect(values()).toEqual(['Atlantic', 'ops@atlantic.test']);
    expect(messages(drawer()!)).toEqual({});
    expect(invalidFields(drawer()!)).toEqual([]);
    expect(pending()).toEqual([]);
  });
});
