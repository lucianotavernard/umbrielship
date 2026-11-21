import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';

import { AuthenticationService, MeOrganization } from '../../../identity/authentication/authentication.service';
import { Role } from '../../../identity/user/user.service';
import { InternalLayout } from '../internal-layout';
import { PAGE_RELOAD } from '../lib/page-reload';
import { THEME_KEY } from '../lib/theme';
import { SidebarProvider } from '../ui/sidebar';
import { flushNotificationReads } from '../../testing/notification-reads';

@Component({ template: 'page' })
class Page {}

const ROUTES = [
  'dashboard',
  'customers',
  'customers/:id',
  'vessels',
  'vessels/:id',
  'work-orders',
  'work-orders/:id',
  'work-orders/:id/assignments/:assignmentId/inspect',
  'work-orders/:id/assignments/:assignmentId/inspections/:inspectionId',
  'inspections',
  'inspection-templates/:id',
  'agenda',
  'organizations',
  'organizations/:id',
  'account',
  'notifications',
  'auth',
].map((path) => ({ path, component: Page }));

function profile(
  organizations: MeOrganization[],
  activeId: string,
  name = 'Ana Souza',
) {
  const active = organizations.find((organization) => organization.id === activeId)!;
  return {
    user: {
      id: 'user-1',
      name,
      email: 'ana@atlantic.test',
      role: active.role,
      organization: { id: active.id, name: active.name, isInternal: active.isInternal },
      organizations,
    },
  };
}

const atlantic = (role: Role = 'operator'): MeOrganization => ({
  id: 'org-a',
  name: 'Pescados Atlântico',
  isInternal: false,
  role,
});
const internal: MeOrganization = {
  id: 'org-u',
  name: 'maréOS',
  isInternal: true,
  role: 'administrator',
};

describe('Shell', () => {
  let controller: HttpTestingController;
  const reload = vi.fn();

  beforeEach(() => {
    reload.mockReset();
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter(ROUTES),
        { provide: PAGE_RELOAD, useValue: reload },
      ],
    });
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // The bell's reads, empty: this spec is about the shell (AD-116).
    flushNotificationReads(controller);
    controller.verify();
  });

  async function settle() {
    await new Promise((resolve) => setTimeout(resolve));
    TestBed.tick();
  }

  async function open(organizations: MeOrganization[], activeId: string) {
    const fixture = TestBed.createComponent(InternalLayout);
    await settle();
    controller.expectOne('/api/me').flush(profile(organizations, activeId));
    await settle();
    return { fixture, element: fixture.nativeElement as HTMLElement };
  }

  const menuLinks = (element: HTMLElement) =>
    [...element.querySelectorAll<HTMLAnchorElement>('nav a')].map((link) => [
      link.textContent?.trim(),
      link.getAttribute('href'),
    ]);

  const byLabel = <T extends HTMLElement>(element: HTMLElement, label: string) =>
    element.querySelector<T>(`[aria-label="${label}"]`);

  it('customer-ui C1 renders the sidebar and the topbar around the page and no header of links', async () => {
    const { element } = await open([atlantic()], 'org-a');

    expect(element.querySelector('t-sidebar')).not.toBeNull();
    const inset = element.querySelector('main[data-slot="sidebar-inset"]')!;
    expect(inset).not.toBeNull();
    const topbar = inset.querySelector('header')!;
    expect(topbar.textContent).toContain('Operação');
    expect(inset.querySelector('router-outlet')).not.toBeNull();
    // The links live in the sidebar now, never in a header.
    expect(element.querySelector('header nav')).toBeNull();
    // Only the menus of the bell and the avatar hold links (AD-116, AD-118).
    expect(element.querySelector('header a:not([role="menuitem"])')).toBeNull();
  });

  const SIX_ITEMS = [
    ['Visão geral', '/dashboard'],
    ['Ordens de serviço', '/work-orders'],
    ['Inspeções', '/inspections'],
    ['Embarcações', '/vessels'],
    ['Clientes', '/customers'],
    ['Agenda', '/agenda'],
    // AD-066: "Equipe técnica" follows "Agenda", as the mareos orders them.
    ['Equipe técnica', '/staff'],
  ];

  it('work-order-ui C16 lists six items in the mareos order and Organizações only for the internal Administrator', async () => {
    const operator = await open([atlantic()], 'org-a');

    expect(operator.element.textContent?.replace(/\s+/g, '')).toContain('MARÉOS');
    expect(operator.element.textContent).toContain('MENU PRINCIPAL');
    expect(menuLinks(operator.element)).toEqual(SIX_ITEMS);
    expect(operator.element.textContent).not.toContain('GESTÃO');
    expect(operator.element.textContent).not.toContain('Modelos de inspeção');
    operator.fixture.destroy();

    const administrator = await open([internal], 'org-u');

    expect(menuLinks(administrator.element)).toEqual([...SIX_ITEMS, ['Organizações', '/organizations']]);
    expect(administrator.element.textContent).not.toContain('Modelos de inspeção');
    // "Organizações" sits under "GESTÃO", not in "MENU PRINCIPAL".
    const groups = [...administrator.element.querySelectorAll<HTMLElement>('t-sidebar-group')].map((group) => [
      group.textContent?.includes('GESTÃO') ? 'GESTÃO' : group.textContent?.includes('MENU PRINCIPAL') ? 'MENU PRINCIPAL' : '',
      [...group.querySelectorAll('a')].map((link) => link.textContent?.trim()),
    ]);
    expect(groups).toEqual([
      ['MENU PRINCIPAL', SIX_ITEMS.map(([label]) => label)],
      ['GESTÃO', ['Organizações']],
    ]);
    administrator.fixture.destroy();

    // An administrator of a client Organization is not the internal one.
    const clientAdministrator = await open([atlantic('administrator')], 'org-a');
    expect(clientAdministrator.element.textContent).not.toContain('GESTÃO');
    expect(menuLinks(clientAdministrator.element)).toEqual(SIX_ITEMS);
  });

  it('customer-ui C4 the theme button switches to dark, says Ativar tema claro and keeps the choice', async () => {
    const { fixture, element } = await open([atlantic()], 'org-a');

    const toDark = byLabel<HTMLButtonElement>(element, 'Ativar tema escuro')!;
    expect(toDark.getAttribute('aria-pressed')).toBe('false');
    toDark.click();
    fixture.detectChanges();

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem(THEME_KEY)).toBe('dark');
    const toLight = byLabel<HTMLButtonElement>(element, 'Ativar tema claro')!;
    expect(toLight.getAttribute('aria-pressed')).toBe('true');

    toLight.click();
    fixture.detectChanges();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem(THEME_KEY)).toBe('light');
    expect(byLabel(element, 'Ativar tema escuro')).not.toBeNull();
  });

  it('work-order-ui C16 the breadcrumb and the active item follow the work order, inspection and agenda routes', async () => {
    const { fixture, element } = await open([internal], 'org-u');
    const router = TestBed.inject(Router);

    const cases: [string, string][] = [
      ['/work-orders', 'Ordens de serviço'],
      ['/work-orders/wo-1', 'Ordens de serviço'],
      // The inspection pages under a WorkOrder belong to the Inspections hub (AD-048).
      ['/work-orders/wo-1/assignments/a1/inspect', 'Inspeções'],
      ['/work-orders/wo-1/assignments/a1/inspections/i1', 'Inspeções'],
      ['/work-orders/wo-1?from=inspections', 'Ordens de serviço'],
      ['/inspections', 'Inspeções'],
      ['/inspection-templates/t1', 'Inspeções'],
      ['/agenda', 'Agenda'],
      // The other sections keep theirs.
      ['/dashboard', 'Visão geral'],
      ['/customers', 'Clientes'],
      ['/customers/c1', 'Clientes'],
      ['/vessels', 'Embarcações'],
      ['/vessels/v1', 'Embarcações'],
      ['/organizations', 'Organizações'],
      ['/organizations/o1', 'Organizações'],
    ];

    const LINKS: Record<string, string> = Object.fromEntries([...SIX_ITEMS, ['Organizações', '/organizations']]);

    for (const [url, label] of cases) {
      await router.navigateByUrl(url);
      await settle();
      fixture.detectChanges();

      const crumb = element.querySelector('main[data-slot="sidebar-inset"] > header [data-slot="breadcrumb-section"]')!;
      expect(crumb.textContent?.trim(), url).toBe(label);
      // "Operação" > the section.
      expect(crumb.parentElement!.textContent?.replace(/\s+/g, ' ').trim(), url).toBe(`Operação ${label}`);
      const current = [...element.querySelectorAll('nav a[aria-current="page"]')].map((link) => [
        link.textContent?.trim(),
        link.getAttribute('href'),
      ]);
      expect(current, url).toEqual([[label, LINKS[label]]]);
    }
  });

  it('work-order-ui C72 the layout keeps the signed-in name for the inspection page', async () => {
    const authentication = TestBed.inject(AuthenticationService);
    expect(authentication.name()).toBeNull();

    const fixture = TestBed.createComponent(InternalLayout);
    await settle();
    // Nothing is known before GET /me answers.
    expect(authentication.name()).toBeNull();
    controller.expectOne('/api/me').flush(profile([atlantic('inspector')], 'org-a', 'Camila Rocha'));
    await settle();

    expect(authentication.name()).toBe('Camila Rocha');
    expect(authentication.role()).toBe('inspector');
    fixture.destroy();
  });

  it('customer-ui C6 the Organization menu lists each Membership with its initials, name and Role and checks the active one', async () => {
    const organizations: MeOrganization[] = [
      atlantic('operator'),
      { id: 'org-b', name: 'Costa Branca Reparos', isInternal: false, role: 'inspector' },
      internal,
    ];
    const { fixture, element } = await open(organizations, 'org-a');

    const trigger = byLabel<HTMLButtonElement>(element, 'Selecionar organização')!;
    expect(trigger.textContent).toContain('PA');
    expect(trigger.textContent).toContain('Pescados Atlântico');
    expect(trigger.textContent).toContain('Operador');
    trigger.click();
    await settle();
    fixture.detectChanges();

    const content = element.querySelector('t-dropdown-menu-content')!;
    expect(content.getAttribute('data-state')).toBe('open');
    expect(content.textContent).toContain('Trocar organização');
    const items = [...content.querySelectorAll<HTMLElement>('[role="menuitem"]')].map((item) => ({
      parts: [...item.querySelectorAll('span[aria-hidden="true"], strong, small')].map((part) =>
        part.textContent?.trim(),
      ),
      checked: item.hasAttribute('data-checked') && !!item.querySelector('[data-slot="active-check"]'),
    }));
    expect(items).toEqual([
      { parts: ['PA', 'Pescados Atlântico', 'Operador'], checked: true },
      { parts: ['CB', 'Costa Branca Reparos', 'Inspetor'], checked: false },
      { parts: ['M', 'maréOS', 'Administrador'], checked: false },
    ]);
  });

  it('customer-ui C7 picking the active Organization posts nothing and closes the menu', async () => {
    const { fixture, element } = await open(
      [atlantic(), { id: 'org-b', name: 'Costa Branca', isInternal: false, role: 'inspector' }],
      'org-a',
    );

    byLabel<HTMLButtonElement>(element, 'Selecionar organização')!.click();
    await settle();
    [...element.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')]
      .find((item) => item.textContent?.includes('Pescados Atlântico'))!
      .click();
    await settle();
    fixture.detectChanges();

    controller.expectNone('/api/organizations/switch');
    expect(reload).not.toHaveBeenCalled();
    expect(element.querySelector('t-dropdown-menu-content')!.getAttribute('data-state')).toBe(
      'closed',
    );
  });

  it('customer-ui C8 the profile shows the user and Sair signs out to /auth', async () => {
    localStorage.setItem('@mareos:access-token', 'token');
    const { fixture, element } = await open([atlantic('inspector')], 'org-a');
    const router = TestBed.inject(Router);

    const profileBlock = element.querySelector('[data-slot="profile"]')!;
    expect(
      // The block itself, not the user menu inside it.
      [...profileBlock.querySelectorAll(':scope > span, :scope > span > strong, :scope > span > small')].map((part) =>
        part.textContent?.trim(),
      ),
    ).toEqual(['AS', expect.stringContaining('Ana Souza'), 'Ana Souza', 'Inspetor']);

    byLabel<HTMLButtonElement>(element, 'Abrir menu do usuário')!.click();
    await settle();
    fixture.detectChanges();
    const exit = [...profileBlock.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')].find(
      (item) => item.textContent?.trim() === 'Sair',
    )!;
    exit.click();
    await settle();

    expect(router.url).toBe('/auth');
    expect(localStorage.getItem('@mareos:access-token')).toBeNull();
  });

  it('user-menu C1 names who is signed in and offers Conta and Notificações before Sair', async () => {
    const { fixture, element } = await open([atlantic()], 'org-a');
    const router = TestBed.inject(Router);

    byLabel<HTMLButtonElement>(element, 'Abrir menu do usuário')!.click();
    await settle();
    fixture.detectChanges();

    // Beside the sidebar on a desktop, its bottom on the profile's, 24px from the menu button (AD-115).
    const menu = element.querySelector<HTMLElement>('[data-slot="profile"] t-dropdown-menu-content')!;
    expect(menu.getAttribute('data-side')).toBe('right');
    expect(menu.style.getPropertyValue('position-area')).toBe('right span-top');
    expect(menu.style.margin).toBe('0px 0px 0px 24px');

    const header = element.querySelector('[data-slot="user-menu-header"]')!;
    expect(header.querySelector('span')?.textContent?.trim()).toBe('AS');
    expect(header.querySelector('[data-slot="user-menu-name"]')?.textContent?.trim()).toBe('Ana Souza');
    expect(header.querySelector('[data-slot="user-menu-email"]')?.textContent?.trim()).toBe('ana@atlantic.test');

    const items = [...element.querySelectorAll<HTMLElement>('[data-slot="profile"] [role="menuitem"]')];
    expect(items.map((item) => item.textContent?.trim())).toEqual(['Conta', 'Notificações', 'Sair']);
    expect(items[0].getAttribute('href')).toBe('/account');
    expect(items[1].getAttribute('href')).toBe('/notifications');

    items[0].click();
    await settle();
    fixture.detectChanges();
    expect(router.url).toBe('/account');
    expect(element.querySelector('[data-slot="breadcrumb-section"]')?.textContent?.trim()).toBe('Conta');

    await router.navigateByUrl('/notifications');
    await settle();
    fixture.detectChanges();
    expect(element.querySelector('[data-slot="breadcrumb-section"]')?.textContent?.trim()).toBe('Notificações');

    // On a phone the panel leaves no room beside it: the menu opens above the profile.
    fixture.debugElement.query(By.directive(SidebarProvider)).injector.get(SidebarProvider).isMobile.set(true);
    await settle();
    fixture.detectChanges();
    const phoneMenu = element.querySelector<HTMLElement>('[data-slot="profile"] t-dropdown-menu-content')!;
    expect(phoneMenu.getAttribute('data-side')).toBe('top');
    expect(phoneMenu.style.margin).toBe('0px 0px 4px');
  });

  it('organization-create C1 an internal Administrator ends the Organization menu with Nova organização, which creates one and opens it', async () => {
    const { fixture, element } = await open([internal, atlantic('administrator')], 'org-u');
    const router = TestBed.inject(Router);

    byLabel<HTMLButtonElement>(element, 'Selecionar organização')!.click();
    await settle();
    fixture.detectChanges();
    const switcher = element.querySelector('organization-switcher-ui')!;
    const items = [...switcher.querySelectorAll<HTMLElement>('[role="menuitem"]')];
    // The Organizations first, "Nova organização" last.
    expect(items.at(-1)?.textContent?.trim()).toBe('Nova organização');
    expect(items.at(-1)?.getAttribute('data-slot')).toBe('create-organization');

    items.at(-1)!.click();
    await settle();
    fixture.detectChanges();
    const drawer = document.querySelector<HTMLElement>('[data-slot="sheet-content"]')!;
    expect(drawer.querySelector('[data-slot="sheet-title"]')?.textContent?.trim()).toBe('Nova organização');

    for (const [selector, value] of [
      ['#organization-name', 'Estaleiro Boreal'],
      ['#organization-email', 'contato@boreal.test'],
    ]) {
      const field = drawer.querySelector<HTMLInputElement>(selector)!;
      field.value = value;
      field.dispatchEvent(new Event('input', { bubbles: true }));
    }
    await settle();
    drawer.querySelector<HTMLButtonElement>('footer[data-slot="drawer-footer"] button[type="submit"]')!.click();
    await settle();

    const post = controller.expectOne((request) => request.method === 'POST' && request.url === '/api/organizations');
    expect(post.request.body).toEqual({ name: 'Estaleiro Boreal', email: 'contato@boreal.test' });
    post.flush({ id: 'org-new', name: 'Estaleiro Boreal', email: 'contato@boreal.test', isInternal: false });
    await settle();
    fixture.detectChanges();

    expect(router.url).toBe('/organizations/org-new');
    expect(document.querySelector('[data-slot="sheet-content"]')).toBeNull();
  });

  it('organization-create C2 an operator or an Administrator of an external Organization sees no Nova organização', async () => {
    for (const role of ['operator', 'administrator'] as Role[]) {
      const { fixture, element } = await open([atlantic(role)], 'org-a');
      byLabel<HTMLButtonElement>(element, 'Selecionar organização')!.click();
      await settle();
      fixture.detectChanges();

      expect(element.querySelector('[data-slot="create-organization"]'), role).toBeNull();
      fixture.destroy();
      flushNotificationReads(controller);
    }
  });

  it('user-menu C3 the top bar avatar opens the same menu as the profile, Sair included', async () => {
    const { fixture, element } = await open([atlantic()], 'org-a');
    const router = TestBed.inject(Router);
    const header = element.querySelector<HTMLElement>('main > header')!;

    const avatar = byLabel<HTMLButtonElement>(header, 'Abrir menu da conta')!;
    expect(avatar.textContent?.trim()).toBe('AS');
    avatar.click();
    await settle();
    fixture.detectChanges();
    expect(avatar.getAttribute('aria-expanded')).toBe('true');

    expect(header.querySelector('[data-slot="user-menu-name"]')?.textContent?.trim()).toBe('Ana Souza');
    expect(header.querySelector('[data-slot="user-menu-email"]')?.textContent?.trim()).toBe('ana@atlantic.test');
    const items = [...header.querySelectorAll<HTMLElement>('[role="menuitem"]')];
    expect(items.map((item) => item.textContent?.trim())).toEqual(['Conta', 'Notificações', 'Sair']);
    expect(items[0].getAttribute('href')).toBe('/account');
    expect(items[1].getAttribute('href')).toBe('/notifications');

    items[2].click();
    await settle();
    expect(router.url).toBe('/auth');
  });

  it('customer-ui C9 on a phone Abrir menu opens the sidebar and a menu item closes it', async () => {
    const { fixture, element } = await open([atlantic()], 'org-a');
    const sidebar = fixture.debugElement
      .query(By.directive(SidebarProvider))
      .injector.get(SidebarProvider);
    sidebar.isMobile.set(true);
    await settle();
    fixture.detectChanges();

    const panel = element.querySelector<HTMLElement>('[data-mobile="true"]')!;
    expect(panel.hasAttribute('inert')).toBe(true);

    byLabel<HTMLButtonElement>(element, 'Abrir menu')!.click();
    fixture.detectChanges();
    expect(sidebar.openMobile()).toBe(true);
    expect(panel.hasAttribute('inert')).toBe(false);

    [...panel.querySelectorAll<HTMLAnchorElement>('nav a')]
      .find((link) => link.textContent?.trim() === 'Clientes')!
      .click();
    await settle();
    fixture.detectChanges();

    expect(TestBed.inject(Router).url).toBe('/customers');
    expect(sidebar.openMobile()).toBe(false);
    expect(panel.hasAttribute('inert')).toBe(true);
  });

  it('customer-ui C9 picking the open page item closes the panel too', async () => {
    const { fixture, element } = await open([atlantic()], 'org-a');
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/customers');
    await settle();
    const sidebar = fixture.debugElement
      .query(By.directive(SidebarProvider))
      .injector.get(SidebarProvider);
    sidebar.isMobile.set(true);
    await settle();
    fixture.detectChanges();

    byLabel<HTMLButtonElement>(element, 'Abrir menu')!.click();
    fixture.detectChanges();
    expect(sidebar.openMobile()).toBe(true);

    const panel = element.querySelector<HTMLElement>('[data-mobile="true"]')!;
    [...panel.querySelectorAll<HTMLAnchorElement>('nav a')]
      .find((link) => link.textContent?.trim() === 'Clientes')!
      .click();
    await settle();
    fixture.detectChanges();

    expect(router.url).toBe('/customers');
    expect(sidebar.openMobile()).toBe(false);
  });

  it('sidebar C1 the top bar button collapses the sidebar to its icons and expands it back', async () => {
    const { fixture, element } = await open([atlantic()], 'org-a');
    const sidebar = element.querySelector<HTMLElement>('t-sidebar')!;
    const trigger = () => element.querySelector<HTMLButtonElement>('header button[data-sidebar="trigger"]')!;

    // Always there on a desktop, before the breadcrumb, with a rule between them (AD-113).
    expect(trigger().getAttribute('aria-label')).toBe('Recolher menu');
    expect(trigger().getAttribute('title')).toBe('Recolher menu (Ctrl+B)');
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(sidebar.getAttribute('data-state')).toBe('expanded');
    expect(sidebar.getAttribute('data-collapsible')).toBe('');

    trigger().click();
    fixture.detectChanges();
    expect(sidebar.getAttribute('data-state')).toBe('collapsed');
    expect(sidebar.getAttribute('data-collapsible')).toBe('icon');
    expect(trigger().getAttribute('aria-label')).toBe('Expandir menu');
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    expect(localStorage.getItem('@mareos:sidebar')).toBe('false');
    // Collapsed, each item keeps its icon and names itself on hover.
    const customers = [...element.querySelectorAll<HTMLAnchorElement>('nav a')].find(
      (link) => link.textContent?.trim() === 'Clientes',
    )!;
    expect(customers.getAttribute('title')).toBe('Clientes');
    // The name hides and the icon stays whole, so no letter of the name shows beside it.
    expect(customers.querySelector('span')?.className).toContain('group-data-[collapsible=icon]:hidden');
    expect(customers.className).toContain('[&>ng-icon]:shrink-0');

    trigger().click();
    fixture.detectChanges();
    expect(sidebar.getAttribute('data-state')).toBe('expanded');
    expect(trigger().getAttribute('aria-label')).toBe('Recolher menu');
    expect(localStorage.getItem('@mareos:sidebar')).toBe('true');
  });

  it('customer-ui C57 the topbar scrolls with the page below 640 px', async () => {
    const { element } = await open([atlantic()], 'org-a');

    const topbar = element.querySelector('main[data-slot="sidebar-inset"] > header')!;
    const classes = [...topbar.classList];
    // Unprefixed, sticky or fixed would pin it on a phone too (inspection AC 32).
    expect(classes).not.toContain('sticky');
    expect(classes).not.toContain('fixed');
    expect(getComputedStyle(topbar).position).not.toBe('sticky');
  });

  it('customer-ui C10 shows no workshop status, help or "MARÉOS · Operação com rumo certo." footer', async () => {
    const { element } = await open([atlantic()], 'org-a');

    expect(element.textContent).not.toContain('Oficina em operação');
    expect(element.textContent).not.toContain('Precisa de ajuda?');
    expect(element.textContent).not.toContain('MARÉOS ·');
    expect(element.textContent).not.toContain('Operação com rumo certo.');
    expect(byLabel(element, 'Ajuda')).toBeNull();
    // The bell came back with AD-116; it is notification-menu.spec's.
  });
});
