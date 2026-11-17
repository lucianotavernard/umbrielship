import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';

import { MeOrganization } from '../../../identity/authentication/authentication.service';
import { Role } from '../../../identity/user/user.service';
import { InternalLayout } from '../internal-layout';
import { PAGE_RELOAD } from '../lib/page-reload';
import { THEME_KEY } from '../lib/theme';
import { SidebarProvider } from '../ui/sidebar';

@Component({ template: 'page' })
class Page {}

const ROUTES = [
  'dashboard',
  'customers',
  'customers/:id',
  'vessels',
  'vessels/:id',
  'work-orders/:id',
  'inspection-templates',
  'inspection-templates/:id',
  'organizations',
  'organizations/:id',
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
  name: 'Umbrielship',
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

  afterEach(() => controller.verify());

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
    expect(element.querySelector('header a')).toBeNull();
  });

  it('customer-ui C2 lists four items for an operator and Organizações under GESTÃO only for the internal Administrator', async () => {
    const operator = await open([atlantic()], 'org-a');

    expect(operator.element.textContent?.replace(/\s+/g, '')).toContain('UMBRIELSHIP');
    expect(operator.element.textContent).toContain('MENU PRINCIPAL');
    expect(menuLinks(operator.element)).toEqual([
      ['Visão geral', '/dashboard'],
      ['Embarcações', '/vessels'],
      ['Clientes', '/customers'],
      ['Modelos de inspeção', '/inspection-templates'],
    ]);
    expect(operator.element.textContent).not.toContain('GESTÃO');
    operator.fixture.destroy();

    const administrator = await open([internal], 'org-u');

    expect(administrator.element.textContent).toContain('GESTÃO');
    expect(menuLinks(administrator.element)).toEqual([
      ['Visão geral', '/dashboard'],
      ['Embarcações', '/vessels'],
      ['Clientes', '/customers'],
      ['Modelos de inspeção', '/inspection-templates'],
      ['Organizações', '/organizations'],
    ]);
    administrator.fixture.destroy();

    // An administrator of a client Organization is not the internal one.
    const clientAdministrator = await open([atlantic('administrator')], 'org-a');
    expect(clientAdministrator.element.textContent).not.toContain('GESTÃO');
    expect(menuLinks(clientAdministrator.element)).toHaveLength(4);
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

  it('customer-ui C5 the breadcrumb and the active item follow the route', async () => {
    const { fixture, element } = await open([internal], 'org-u');
    const router = TestBed.inject(Router);

    const cases: [string, string][] = [
      ['/customers', 'Clientes'],
      ['/customers/c1', 'Clientes'],
      ['/vessels', 'Embarcações'],
      ['/vessels/v1', 'Embarcações'],
      ['/work-orders/w1', 'Embarcações'],
      ['/dashboard', 'Visão geral'],
      ['/inspection-templates', 'Modelos de inspeção'],
      ['/inspection-templates/t1', 'Modelos de inspeção'],
      ['/organizations', 'Organizações'],
      ['/organizations/o1', 'Organizações'],
    ];

    for (const [url, label] of cases) {
      await router.navigateByUrl(url);
      await settle();
      fixture.detectChanges();

      const crumb = element.querySelector('[data-slot="breadcrumb-section"]');
      expect(crumb?.textContent?.trim(), url).toBe(label);
      const current = [...element.querySelectorAll('nav a[aria-current="page"]')].map((link) =>
        link.textContent?.trim(),
      );
      expect(current, url).toEqual([label]);
    }
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
      { parts: ['U', 'Umbrielship', 'Administrador'], checked: false },
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
    localStorage.setItem('@umbriel:access-token', 'token');
    const { fixture, element } = await open([atlantic('inspector')], 'org-a');
    const router = TestBed.inject(Router);

    const profileBlock = element.querySelector('[data-slot="profile"]')!;
    expect(
      [...profileBlock.querySelectorAll(':scope > span, strong, small')].map((part) =>
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
    expect(localStorage.getItem('@umbriel:access-token')).toBeNull();
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

  it('customer-ui C10 shows no workshop status, help, notifications or MARÉOS footer', async () => {
    const { element } = await open([atlantic()], 'org-a');

    expect(element.textContent).not.toContain('Oficina em operação');
    expect(element.textContent).not.toContain('Precisa de ajuda?');
    expect(element.textContent).not.toContain('MARÉOS');
    expect(element.textContent).not.toContain('Operação com rumo certo.');
    expect(byLabel(element, 'Ajuda')).toBeNull();
    expect(byLabel(element, 'Notificações')).toBeNull();
  });

  it('customer-ui C56 Recolher menu collapses the sidebar and keeps the choice', async () => {
    const { fixture, element } = await open([atlantic()], 'org-a');
    const sidebar = element.querySelector('t-sidebar')!;
    expect(sidebar.getAttribute('data-state')).toBe('expanded');
    expect(byLabel(element, 'Abrir menu')).toBeNull();

    byLabel<HTMLButtonElement>(element, 'Recolher menu')!.click();
    fixture.detectChanges();

    expect(sidebar.getAttribute('data-state')).toBe('collapsed');
    expect(localStorage.getItem('@umbriel:sidebar')).toBe('false');
    // Collapsed on a desktop, the topbar gives the way back.
    expect(byLabel(element, 'Abrir menu')).not.toBeNull();
  });
});
