import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { toast } from '../../../shared/components/ui/toaster';
import { OrganizationDetail } from '../organization-detail/organization-detail';

describe('OrganizationDetail', () => {
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

  function fill(element: ParentNode, selector: string, value: string) {
    const field = element.querySelector<HTMLInputElement | HTMLSelectElement>(selector);
    if (!field) throw new Error(selector);
    field.value = value;
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function flushReads() {
    controller.expectOne('/api/organizations/org-1').flush({
      organization: { id: 'org-1', name: 'Atlantic', email: 'ops@atlantic.test', isInternal: false },
    });
    controller.expectOne('/api/organizations/org-1/users?page=1&per_page=10').flush({
      users: [{ id: 'user-ana', name: 'Ana', email: 'ana@atlantic.test', role: 'operator' }],
      total: 1,
    });
    controller.expectOne('/api/organizations/org-1/roles').flush({
      roles: [
        { role: 'administrator', users: 0 },
        { role: 'operator', users: 1 },
      ],
    });
    controller.expectOne('/api/organizations/org-1/invitations?page=1&per_page=10').flush({
      invitations: [
        {
          id: 'inv-1',
          email: 'ana@atlantic.test',
          role: 'operator',
          status: 'pending',
          deliveryStatus: 'failed',
        },
      ],
      total: 1,
    });
    controller.expectOne('/api/users?not_in_organization=org-1&per_page=100').flush({
      users: [{ id: 'user-1', name: 'Ana', email: 'ana@atlantic.test' }],
      total: 1,
    });
  }

  async function openPage() {
    const fixture = TestBed.createComponent(OrganizationDetail);
    fixture.componentRef.setInput('id', 'org-1');
    await settle();
    flushReads();
    await settle();
    return fixture.nativeElement as HTMLElement;
  }

  /** Answers the reads still open (the lists a closing drawer reloads) and returns every open request, sorted. */
  async function answerReads() {
    const open = controller.match(() => true);
    for (const pendingRequest of open) {
      const { method, urlWithParams: url } = pendingRequest.request;
      if (method !== 'GET') continue;
      if (url.startsWith('/api/users?not_in_organization=')) {
        pendingRequest.flush({ users: [{ id: 'user-1', name: 'Ana', email: 'ana@atlantic.test' }], total: 1 });
      } else if (url.endsWith('/roles')) {
        pendingRequest.flush({ roles: [{ role: 'operator', users: 1 }] });
      } else if (url.includes('/invitations?')) {
        pendingRequest.flush({ invitations: [], total: 0 });
      } else {
        pendingRequest.flush({
          users: [{ id: 'user-ana', name: 'Ana', email: 'ana@atlantic.test', role: 'operator' }],
          total: 1,
        });
      }
    }
    await settle();
    return open.map(({ request }) => `${request.method} ${request.urlWithParams}`).sort();
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
  const values = (...selectors: string[]) =>
    selectors.map((selector) => drawer()?.querySelector<HTMLInputElement | HTMLSelectElement>(selector)?.value);

  const cancelButton = { type: 'button', first: 'ng-icon[name="lucideX"]', label: 'Cancelar', disabled: false };
  const saveButton = (label: string) => ({
    type: 'submit',
    first: 'ng-icon[name="lucideCheck"]',
    label,
    disabled: false,
  });
  const saving = { type: 'submit', first: 'ng-icon[name="lucideLoader2"]', label: 'Salvando...', disabled: true };

  it('[C88] shows the user and the invitation and posts create, send and resend', async () => {
    const fixture = TestBed.createComponent(OrganizationDetail);
    fixture.componentRef.setInput('id', 'org-1');
    await settle();
    flushReads();
    await settle();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Ana');
    expect(element.textContent).toContain('ana@atlantic.test');
    expect(element.textContent).toContain('Operador');

    [...element.querySelectorAll('button')].find((button) => button.textContent?.trim() === 'Reenviar')?.click();
    await settle();
    const resent = controller.expectOne('/api/invitations/inv-1/resend');
    expect(resent.request.method).toBe('POST');
    resent.flush({
      id: 'inv-1',
      email: 'ana@atlantic.test',
      role: 'operator',
      status: 'pending',
      deliveryStatus: 'queued',
    });
    await settle();
    controller.match(() => true).forEach((request) =>
      request.flush({
        invitations: [
          {
            id: 'inv-1',
            email: 'ana@atlantic.test',
            role: 'operator',
            status: 'pending',
            deliveryStatus: 'queued',
          },
        ],
        users: [],
        total: 1,
      }),
    );

    [...element.querySelectorAll('button')].find((button) => button.textContent?.trim() === 'Novo usuário')?.click();
    await settle();
    fill(element, '#user-name', 'Ana');
    fill(element, '#user-email', 'ana@atlantic.test');
    fill(element, '#user-password', 'secret-pass');
    fill(element, '#user-role', 'operator');
    element.querySelector<HTMLButtonElement>('#user-name')?.closest('form')?.requestSubmit();
    await settle();
    const created = controller.expectOne('/api/users');
    expect(created.request.method).toBe('POST');
    expect(created.request.body).toEqual({
      name: 'Ana',
      email: 'ana@atlantic.test',
      password: 'secret-pass',
      role: 'operator',
      organizationId: 'org-1',
    });
    created.flush({ id: 'user-ana', name: 'Ana', email: 'ana@atlantic.test', role: 'operator' });
    await settle();
    controller.match(() => true).forEach((request) => request.flush({ users: [], roles: [], total: 0 }));

    [...element.querySelectorAll('button')].find((button) => button.textContent?.trim() === 'Novo convite')?.click();
    await settle();
    fill(element, '#invitation-user', 'user-1');
    fill(element, '#invitation-role', 'operator');
    element.querySelector<HTMLButtonElement>('#invitation-user')?.closest('form')?.requestSubmit();
    await settle();
    const sent = controller.expectOne('/api/invitations');
    expect(sent.request.method).toBe('POST');
    expect(sent.request.body).toEqual({
      userId: 'user-1',
      organizationId: 'org-1',
      role: 'operator',
    });
    sent.flush({ id: 'inv-2', email: 'ana@atlantic.test', role: 'operator', status: 'pending', deliveryStatus: 'queued' });
    await settle();
    controller.match(() => true).forEach((request) =>
      request.flush({ invitations: [], users: [], total: 0 }),
    );
  });

  it('drawer-standard D17 Novo usuário opens with the Detalhes do usuário and Acesso cards and posts once', async () => {
    const success = vi.spyOn(toast, 'success');
    const error = vi.spyOn(toast, 'error');
    const element = await openPage();
    const userValues = () => values('#user-name', '#user-email', '#user-password', '#user-role');
    const userReads = ['GET /api/organizations/org-1/roles', 'GET /api/organizations/org-1/users?page=1&per_page=10'];

    await click(buttonByText('Novo usuário', element));
    const sheet = drawer()!;
    expect(readFrame(sheet)).toEqual({
      kicker: 'ORGANIZAÇÃO / USUÁRIOS',
      title: 'Novo usuário',
      description: 'Crie um usuário nesta organização',
      closeLabel: 'Fechar formulário',
      widths: ['sm:max-w-[580px]'],
      cards: [
        {
          title: 'Detalhes do usuário',
          subtitle: 'Informações básicas sobre o usuário',
          icon: 'lucideUser',
          labels: ['Nome *', 'E-mail *'],
        },
        {
          title: 'Acesso',
          subtitle: 'Senha e papel do usuário na organização',
          icon: 'lucideShield',
          labels: ['Senha *', 'Papel'],
        },
      ],
      hint: '* Campos obrigatórios',
      buttons: [cancelButton, saveButton('Criar usuário')],
    });
    expect(document.activeElement?.id).toBe('user-name');
    expect(messages(sheet)).toEqual({});
    expect(invalidFields(sheet)).toEqual([]);

    // Saving the empty form sends nothing and speaks under each field.
    await click(submitButton(sheet));
    expect(pending()).toEqual([]);
    expect(messages(sheet)).toEqual({
      'user-name': ['Nome é obrigatório'],
      'user-email': ['E-mail é obrigatório'],
      'user-password': ['Senha é obrigatória'],
    });
    expect(errorCount(sheet)).toBe(3);
    expect(invalidFields(sheet)).toEqual(['user-name', 'user-email', 'user-password']);

    // Cancelar closes and sends nothing (the page only reloads its lists), and the next opening starts clean.
    await click(buttonByText('Cancelar', sheet));
    expect(drawer()).toBeNull();
    expect(await answerReads()).toEqual(userReads);
    await click(buttonByText('Novo usuário', element));
    expect(userValues()).toEqual(['', '', '', 'operator']);
    expect(messages(drawer()!)).toEqual({});
    expect(errorCount(drawer()!)).toBe(0);
    expect(invalidFields(drawer()!)).toEqual([]);

    fill(drawer()!, '#user-name', 'Bia');
    fill(drawer()!, '#user-email', 'bia@atlantic.test');
    fill(drawer()!, '#user-password', 'secret-pass');
    fill(drawer()!, '#user-role', 'inspector');
    await settle();
    await click(submitButton(drawer()!));

    expect(readButton(submitButton(drawer()!))).toEqual(saving);
    const requests = controller.match(() => true);
    expect(requests.map(({ request }) => `${request.method} ${request.urlWithParams}`)).toEqual(['POST /api/users']);
    expect(requests[0].request.body).toEqual({
      name: 'Bia',
      email: 'bia@atlantic.test',
      password: 'secret-pass',
      role: 'inspector',
      organizationId: 'org-1',
    });
    requests[0].flush({ id: 'user-bia', name: 'Bia', email: 'bia@atlantic.test', role: 'inspector' });
    await settle();
    expect(await answerReads()).toEqual(userReads);

    expect(success).toHaveBeenCalledWith('Usuário criado com sucesso');
    expect(drawer()).toBeNull();

    // A failed request gives "Criar usuário" back, enabled, with every value kept.
    await click(buttonByText('Novo usuário', element));
    expect(userValues()).toEqual(['', '', '', 'operator']);
    fill(drawer()!, '#user-name', 'Ana');
    fill(drawer()!, '#user-email', 'ana@atlantic.test');
    fill(drawer()!, '#user-password', 'secret-pass');
    fill(drawer()!, '#user-role', 'administrator');
    await settle();
    await click(submitButton(drawer()!));

    expect(readButton(submitButton(drawer()!))).toEqual(saving);
    const failed = controller.match(() => true);
    expect(failed.map(({ request }) => `${request.method} ${request.urlWithParams}`)).toEqual(['POST /api/users']);
    expect(failed[0].request.body).toEqual({
      name: 'Ana',
      email: 'ana@atlantic.test',
      password: 'secret-pass',
      role: 'administrator',
      organizationId: 'org-1',
    });
    failed[0].flush({ message: 'User already exists' }, { status: 409, statusText: 'Conflict' });
    await settle();

    expect(error).toHaveBeenCalledWith('Erro ao criar usuário', expect.anything());
    expect(drawer()).not.toBeNull();
    expect(readButton(submitButton(drawer()!))).toEqual(saveButton('Criar usuário'));
    expect(userValues()).toEqual(['Ana', 'ana@atlantic.test', 'secret-pass', 'administrator']);
    expect(messages(drawer()!)).toEqual({});
    expect(invalidFields(drawer()!)).toEqual([]);
    expect(pending()).toEqual([]);
  });

  it('drawer-standard D18 Novo convite opens with the Convite card and posts once', async () => {
    const success = vi.spyOn(toast, 'success');
    const error = vi.spyOn(toast, 'error');
    const element = await openPage();
    const invitationValues = () => values('#invitation-user', '#invitation-role');
    const invitationReads = [
      'GET /api/organizations/org-1/invitations?page=1&per_page=10',
      'GET /api/users?not_in_organization=org-1&per_page=100',
    ];

    await click(buttonByText('Novo convite', element));
    const sheet = drawer()!;
    expect(readFrame(sheet)).toEqual({
      kicker: 'ORGANIZAÇÃO / CONVITES',
      title: 'Novo convite',
      description: 'Convide um usuário que já existe para esta organização',
      closeLabel: 'Fechar formulário',
      widths: ['sm:max-w-[580px]'],
      cards: [
        {
          title: 'Convite',
          subtitle: 'Quem será convidado e com qual papel',
          icon: 'lucideSend',
          labels: ['Usuário *', 'Papel'],
        },
      ],
      hint: '* Campos obrigatórios',
      buttons: [cancelButton, saveButton('Enviar convite')],
    });
    expect(document.activeElement?.id).toBe('invitation-user');
    expect(messages(sheet)).toEqual({});
    expect(invalidFields(sheet)).toEqual([]);

    // Saving the empty form sends nothing and speaks under "Usuário".
    await click(submitButton(sheet));
    expect(pending()).toEqual([]);
    expect(messages(sheet)).toEqual({ 'invitation-user': ['Usuário é obrigatório'] });
    expect(errorCount(sheet)).toBe(1);
    expect(invalidFields(sheet)).toEqual(['invitation-user']);

    // Cancelar closes and sends nothing (the page only reloads its lists), and the next opening starts clean.
    await click(buttonByText('Cancelar', sheet));
    expect(drawer()).toBeNull();
    expect(await answerReads()).toEqual(invitationReads);
    await click(buttonByText('Novo convite', element));
    expect(invitationValues()).toEqual(['', 'operator']);
    expect(messages(drawer()!)).toEqual({});
    expect(errorCount(drawer()!)).toBe(0);
    expect(invalidFields(drawer()!)).toEqual([]);

    fill(drawer()!, '#invitation-user', 'user-1');
    fill(drawer()!, '#invitation-role', 'administrator');
    await settle();
    await click(submitButton(drawer()!));

    expect(readButton(submitButton(drawer()!))).toEqual(saving);
    const requests = controller.match(() => true);
    expect(requests.map(({ request }) => `${request.method} ${request.urlWithParams}`)).toEqual([
      'POST /api/invitations',
    ]);
    expect(requests[0].request.body).toEqual({ userId: 'user-1', organizationId: 'org-1', role: 'administrator' });
    requests[0].flush({
      id: 'inv-2',
      email: 'ana@atlantic.test',
      role: 'administrator',
      status: 'pending',
      deliveryStatus: 'queued',
    });
    await settle();
    expect(await answerReads()).toEqual(invitationReads);

    expect(success).toHaveBeenCalledWith('Convite enviado');
    expect(drawer()).toBeNull();

    // A failed request gives "Enviar convite" back, enabled, with every value kept.
    await click(buttonByText('Novo convite', element));
    expect(invitationValues()).toEqual(['', 'operator']);
    fill(drawer()!, '#invitation-user', 'user-1');
    fill(drawer()!, '#invitation-role', 'inspector');
    await settle();
    await click(submitButton(drawer()!));

    expect(readButton(submitButton(drawer()!))).toEqual(saving);
    const failed = controller.match(() => true);
    expect(failed.map(({ request }) => `${request.method} ${request.urlWithParams}`)).toEqual([
      'POST /api/invitations',
    ]);
    expect(failed[0].request.body).toEqual({ userId: 'user-1', organizationId: 'org-1', role: 'inspector' });
    failed[0].flush({ message: 'Invitation already exists' }, { status: 409, statusText: 'Conflict' });
    await settle();

    expect(error).toHaveBeenCalledWith('Erro ao enviar convite', expect.anything());
    expect(drawer()).not.toBeNull();
    expect(readButton(submitButton(drawer()!))).toEqual(saveButton('Enviar convite'));
    expect(invitationValues()).toEqual(['user-1', 'inspector']);
    expect(messages(drawer()!)).toEqual({});
    expect(invalidFields(drawer()!)).toEqual([]);
    expect(pending()).toEqual([]);
  });

  const read = (root: ParentNode | null | undefined, selector: string) =>
    [...(root?.querySelectorAll(selector) ?? [])].map((node) => squash(node));

  it('organization-detail C1 shows the organization card, then Membros and Convites in sections of their own', async () => {
    const element = await openPage();

    expect(read(element, 'nav[aria-label="Navegação estrutural"] a, nav[aria-label="Navegação estrutural"] span')).toEqual([
      'Voltar às organizações',
      'Atlantic',
    ]);
    expect(element.querySelector('nav a')?.getAttribute('href')).toBe('/organizations');
    expect(squash(element.querySelector('h1'))).toBe('Atlantic');
    expect(squash(element.querySelector('[data-slot="type-pill"]'))).toBe('Externa');
    expect(squash(element.querySelector('[data-slot="spec-email"] dd'))).toBe('ops@atlantic.test');
    expect(squash(element.querySelector('[data-slot="spec-members"] dd'))).toBe('1');
    expect(squash(element.querySelector('[data-slot="spec-invitations"] dd'))).toBe('1');

    // Membros first, Convites under it, each in its own section with its table and its pager.
    const sections = [...element.querySelectorAll('section[aria-labelledby]')].map((section) =>
      section.getAttribute('aria-labelledby'),
    );
    expect(sections).toEqual(['organization-detail-title', 'organization-members-title', 'organization-invitations-title']);

    const members = element.querySelector('section[aria-labelledby="organization-members-title"]')!;
    expect(squash(members.querySelector('h2'))).toBe('Membros');
    expect(read(members, 'thead th')).toEqual(['USUÁRIO', 'E-MAIL', 'PAPEL']);
    expect(read(members, '[data-slot="member-name"]')).toEqual(['Ana']);
    expect(read(members, '[data-slot="member-email"]')).toEqual(['ana@atlantic.test']);
    expect(read(members, '[data-slot="role"]')).toEqual(['Operador']);
    expect(squash(members.querySelector('[data-slot="range"]'))).toBe('Exibindo 1–1 de 1 membros');
    expect(buttonByText('Novo usuário', members)).toBeDefined();

    const invitations = element.querySelector('section[aria-labelledby="organization-invitations-title"]')!;
    expect(squash(invitations.querySelector('h2'))).toBe('Convites');
    expect(read(invitations, 'thead th')).toEqual(['E-MAIL', 'PAPEL', 'STATUS', 'Ações']);
    expect(read(invitations, '[data-slot="invitation-email"]')).toEqual(['ana@atlantic.test']);
    expect(read(invitations, '[data-slot="invitation-status"]')).toEqual(['Pendente']);
    expect(invitations.querySelector('[aria-label="Reenviar convite para ana@atlantic.test"]')).not.toBeNull();
    expect(squash(invitations.querySelector('[data-slot="range"]'))).toBe('Exibindo 1–1 de 1 convites');
    expect(buttonByText('Novo convite', invitations)).toBeDefined();
  });

  it('organization-detail C2 the internal organization has no Convites section', async () => {
    const fixture = TestBed.createComponent(OrganizationDetail);
    fixture.componentRef.setInput('id', 'org-1');
    await settle();
    controller.expectOne('/api/organizations/org-1').flush({
      organization: { id: 'org-1', name: 'Umbrielship', email: 'internal@umbrielship.test', isInternal: true },
    });
    controller.expectOne('/api/organizations/org-1/users?page=1&per_page=10').flush({ users: [], total: 0 });
    controller.expectOne('/api/organizations/org-1/roles').flush({ roles: [] });
    controller.expectOne('/api/organizations/org-1/invitations?page=1&per_page=10').flush({ invitations: [], total: 0 });
    controller.expectOne('/api/users?not_in_organization=org-1&per_page=100').flush({ users: [], total: 0 });
    await settle();
    const element = fixture.nativeElement as HTMLElement;

    expect(squash(element.querySelector('[data-slot="type-pill"]'))).toBe('Interna');
    expect(element.querySelector('section[aria-labelledby="organization-invitations-title"]')).toBeNull();
    expect(element.querySelector('[data-slot="spec-invitations"]')).toBeNull();
    expect(squash(element.querySelector('[data-slot="empty"]'))).toBe('Nenhum membro nesta organização.');
  });

  it('organization-detail C3 an unknown organization reads Organização não encontrada', async () => {
    const fixture = TestBed.createComponent(OrganizationDetail);
    fixture.componentRef.setInput('id', 'org-1');
    await settle();
    controller
      .expectOne('/api/organizations/org-1')
      .flush({ message: 'Organization not found' }, { status: 404, statusText: 'Not Found' });
    for (const request of controller.match(() => true)) request.flush({ users: [], invitations: [], roles: [], total: 0 });
    await settle();
    const element = fixture.nativeElement as HTMLElement;

    expect(squash(element.querySelector('h1'))).toBe('Organização não encontrada');
    expect(element.querySelector('section[aria-labelledby="organization-members-title"]')).toBeNull();
  });
});
