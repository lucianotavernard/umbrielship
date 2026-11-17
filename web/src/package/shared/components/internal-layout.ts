import { httpResource } from '@angular/common/http';
import { Component, computed, DestroyRef, effect, HostListener, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';

import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideAnchor,
  lucideBuilding2,
  lucideCalendarDays,
  lucideChevronRight,
  lucideClipboardCheck,
  lucideClipboardList,
  lucideEllipsis,
  lucideLayoutDashboard,
  lucideLogOut,
  lucideMoon,
  lucideShip,
  lucideSun,
  lucideUsers,
} from '@ng-icons/lucide';
import { filter } from 'rxjs';

import { AuthenticationService, MeResponse } from '../../identity/authentication/authentication.service';
import { OrganizationSwitcher } from '../../identity/organization/components/organization-switcher';
import { roleLabels } from '../../identity/user/user.service';
import { apiErrorMessage } from './lib/api-error-message';
import { initials } from './lib/initials';
import { PAGE_RELOAD } from './lib/page-reload';
import { resourceValue } from './lib/resource-value';
import { applyTheme, saveTheme } from './lib/theme';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from './ui/sidebar';
import { Skeleton } from './ui/skeleton';
import { toast } from './ui/toaster';

type MenuItem = { key: string; label: string; link: string; icon: string };

const MAIN_MENU: MenuItem[] = [
  { key: 'overview', label: 'Visão geral', link: '/dashboard', icon: 'lucideLayoutDashboard' },
  { key: 'work-orders', label: 'Ordens de serviço', link: '/work-orders', icon: 'lucideClipboardList' },
  { key: 'inspections', label: 'Inspeções', link: '/inspections', icon: 'lucideClipboardCheck' },
  { key: 'vessels', label: 'Embarcações', link: '/vessels', icon: 'lucideShip' },
  { key: 'customers', label: 'Clientes', link: '/customers', icon: 'lucideUsers' },
  { key: 'agenda', label: 'Agenda', link: '/agenda', icon: 'lucideCalendarDays' },
];

const MANAGEMENT_MENU: MenuItem[] = [
  { key: 'organizations', label: 'Organizações', link: '/organizations', icon: 'lucideBuilding2' },
];

/** The menu item a route belongs to (AD-032); a template belongs to the Inspections hub. */
const SECTIONS: { prefix: string; key: string }[] = [
  { prefix: '/dashboard', key: 'overview' },
  { prefix: '/work-orders', key: 'work-orders' },
  { prefix: '/inspections', key: 'inspections' },
  { prefix: '/inspection-templates', key: 'inspections' },
  { prefix: '/vessels', key: 'vessels' },
  { prefix: '/customers', key: 'customers' },
  { prefix: '/agenda', key: 'agenda' },
  { prefix: '/organizations', key: 'organizations' },
];

const LABELS = Object.fromEntries(
  [...MAIN_MENU, ...MANAGEMENT_MENU].map((item) => [item.key, item.label]),
);

@Component({
  selector: 'internal-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    NgIcon,
    Skeleton,
    OrganizationSwitcher,
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    SidebarProvider,
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarSeparator,
    SidebarTrigger,
    SidebarInset,
  ],
  viewProviders: [
    provideIcons({
      lucideAnchor,
      lucideBuilding2,
      lucideCalendarDays,
      lucideChevronRight,
      lucideClipboardCheck,
      lucideClipboardList,
      lucideEllipsis,
      lucideLayoutDashboard,
      lucideLogOut,
      lucideMoon,
      lucideShip,
      lucideSun,
      lucideUsers,
    }),
  ],
  template: `
    <t-sidebar-provider>
      <t-sidebar class="border-sidebar-border">
        <t-sidebar-header class="gap-0 px-4 py-0">
          <div class="-mx-2 mb-4 flex h-[69px] shrink-0 items-center gap-2.5 border-b border-sidebar-border px-2">
            <span class="grid size-[31px] place-items-center rounded-[9px] bg-primary text-primary-foreground">
              <ng-icon name="lucideAnchor" class="!size-[19px]" />
            </span>
            <span class="text-[17px] font-extrabold tracking-[0.4px]">UMBRIEL<span class="text-primary">SHIP</span></span>
          </div>

          @if (user(); as user) {
            <organization-switcher-ui
              class="mb-2"
              [organizations]="user.organizations"
              [activeId]="user.organization.id"
              (picked)="switchOrganization($event)"
            />
          } @else {
            <t-skeleton class="mb-2 h-[52px] w-full rounded-lg" />
          }
        </t-sidebar-header>

        <t-sidebar-content>
          <nav aria-label="Menu principal" class="contents">
            <t-sidebar-group class="px-2 py-0">
              <span tSidebarGroupLabel class="mb-[9px] h-auto px-2 text-[9px] font-bold tracking-[1px] text-muted-foreground">
                MENU PRINCIPAL
              </span>
              <t-sidebar-group-content>
                <ul tSidebarMenu class="gap-[3px]">
                  @for (item of mainMenu; track item.key) {
                    <li tSidebarMenuItem>
                      <a
                        tSidebarMenuButton
                        class="h-[38px] gap-[11px] px-2.5 text-[12px] text-muted-foreground data-[active=true]:font-semibold [&>ng-icon]:!size-[17px]"
                        [routerLink]="item.link"
                        [isActive]="section() === item.key"
                        [tooltip]="item.label"
                        [attr.aria-current]="section() === item.key ? 'page' : null"
                        (click)="closeMobile()"
                      >
                        <ng-icon [name]="item.icon" />
                        <span>{{ item.label }}</span>
                      </a>
                    </li>
                  }
                </ul>
              </t-sidebar-group-content>
            </t-sidebar-group>

            @if (isInternalAdministrator()) {
              <t-sidebar-group class="mt-2 px-2 py-0">
                <span tSidebarGroupLabel class="mb-[9px] h-auto px-2 text-[9px] font-bold tracking-[1px] text-muted-foreground">
                  GESTÃO
                </span>
                <t-sidebar-group-content>
                  <ul tSidebarMenu class="gap-[3px]">
                    @for (item of managementMenu; track item.key) {
                      <li tSidebarMenuItem>
                        <a
                          tSidebarMenuButton
                          class="h-[38px] gap-[11px] px-2.5 text-[12px] text-muted-foreground data-[active=true]:font-semibold [&>ng-icon]:!size-[17px]"
                          [routerLink]="item.link"
                          [isActive]="section() === item.key"
                          [tooltip]="item.label"
                          [attr.aria-current]="section() === item.key ? 'page' : null"
                          (click)="closeMobile()"
                        >
                          <ng-icon [name]="item.icon" />
                          <span>{{ item.label }}</span>
                        </a>
                      </li>
                    }
                  </ul>
                </t-sidebar-group-content>
              </t-sidebar-group>
            }
          </nav>
        </t-sidebar-content>

        <t-sidebar-footer class="gap-0 px-4 pt-0 pb-3">
          <t-sidebar-separator class="mx-0 mb-3" />
          @if (user(); as user) {
            <div class="flex items-center gap-2.5" data-slot="profile">
              <span
                class="grid size-[30px] shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-bold text-primary"
              >
                {{ initialsOf(user.name) }}
              </span>
              <span class="min-w-0 flex-1">
                <strong class="block truncate text-[11px] font-bold">{{ user.name }}</strong>
                <small class="mt-0.5 block text-[10px] text-muted-foreground">{{ roleLabels[user.role] }}</small>
              </span>
              <t-dropdown-menu>
                <button
                  tDropdownMenuTrigger
                  type="button"
                  aria-label="Abrir menu do usuário"
                  class="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-sidebar-accent"
                >
                  <ng-icon name="lucideEllipsis" class="!size-[19px]" />
                </button>
                <t-dropdown-menu-content side="top" align="end" class="w-40">
                  <button tDropdownMenuItem type="button" (click)="handleLogout()">
                    <ng-icon name="lucideLogOut" />
                    Sair
                  </button>
                </t-dropdown-menu-content>
              </t-dropdown-menu>
            </div>
          } @else {
            <t-skeleton class="h-[30px] w-full rounded-md" />
          }
        </t-sidebar-footer>
      </t-sidebar>

      <main tSidebarInset class="min-w-0">
        <header
          class="flex h-[59px] shrink-0 items-center justify-between gap-3 border-b border-border bg-card px-4 sm:px-6 lg:px-[37px]"
        >
          <div class="flex min-w-0 items-center gap-2 text-[12px] text-muted-foreground">
            @if (showMenuTrigger()) {
              <button tSidebarTrigger type="button" aria-label="Abrir menu" class="-ml-1"></button>
            }
            <span>Operação</span>
            <ng-icon name="lucideChevronRight" class="!size-3.5 shrink-0" />
            <strong class="truncate font-bold text-foreground" data-slot="breadcrumb-section">
              {{ sectionLabel() }}
            </strong>
          </div>

          <div class="flex shrink-0 items-center gap-3">
            <button
              type="button"
              class="grid size-[30px] place-items-center rounded-[7px] text-muted-foreground transition-colors hover:bg-accent hover:text-primary aria-pressed:bg-accent aria-pressed:text-primary"
              [attr.aria-label]="isDarkMode() ? 'Ativar tema claro' : 'Ativar tema escuro'"
              [attr.title]="isDarkMode() ? 'Ativar tema claro' : 'Ativar tema escuro'"
              [attr.aria-pressed]="isDarkMode()"
              (click)="toggleDarkMode()"
            >
              <ng-icon [name]="isDarkMode() ? 'lucideSun' : 'lucideMoon'" class="!size-[17px]" />
            </button>
            <span class="h-6 border-l border-border"></span>
            @if (user(); as user) {
              <span
                class="grid size-[30px] place-items-center rounded-full bg-primary/10 text-[11px] font-bold text-primary"
                aria-hidden="true"
              >
                {{ initialsOf(user.name) }}
              </span>
            }
          </div>
        </header>

        <router-outlet />
      </main>
    </t-sidebar-provider>
  `,
})
export class InternalLayout {
  private readonly router = inject(Router);
  private readonly authenticationService = inject(AuthenticationService);
  private readonly reloadPage = inject(PAGE_RELOAD);
  private readonly sidebar = viewChild(SidebarProvider);

  private readonly userResource = httpResource<MeResponse>(() => '/api/me');

  protected readonly mainMenu = MAIN_MENU;
  protected readonly managementMenu = MANAGEMENT_MENU;
  protected readonly roleLabels = roleLabels;
  protected readonly initialsOf = initials;

  isDarkMode = signal(document.documentElement.classList.contains('dark'));
  private readonly url = signal(this.router.url);

  user = computed(() => resourceValue(this.userResource)?.user ?? null);
  isInternalAdministrator = computed(() => {
    const user = this.user();
    return user?.role === 'administrator' && user.organization.isInternal;
  });

  section = computed(() => {
    const path = this.url().split(/[?#]/)[0];
    return SECTIONS.find(({ prefix }) => path === prefix || path.startsWith(`${prefix}/`))?.key ?? null;
  });
  sectionLabel = computed(() => {
    const key = this.section();
    return key ? LABELS[key] : '';
  });

  /** On a phone the sidebar is a panel; on a desktop the trigger comes back once it is collapsed. */
  showMenuTrigger = computed(() => {
    const sidebar = this.sidebar();
    return !!sidebar && (sidebar.isMobile() || !sidebar.open());
  });

  constructor() {
    effect(() => {
      const user = this.user();
      if (user) {
        this.authenticationService.role.set(user.role);
        this.authenticationService.name.set(user.name);
      }
    });

    effect(() => {
      const user = this.user();
      if (!user || !this.authenticationService.takeOrganizationChanged()) return;
      toast.info(`A organização ativa mudou para ${user.organization.name}.`);
    });

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe((event) => {
        this.url.set(event.urlAfterRedirects);
        // Picking a menu item on a phone closes the panel.
        this.sidebar()?.openMobile.set(false);
      });
  }

  @HostListener('window:storage', ['$event'])
  onStorage(event: StorageEvent) {
    if (!this.authenticationService.isOrganizationSwitch(event)) return;
    this.authenticationService.markOrganizationChanged();
    this.reloadPage();
  }

  /** Picking a menu item on a phone closes the panel, the page already open included. */
  closeMobile() {
    this.sidebar()?.openMobile.set(false);
  }

  toggleDarkMode() {
    const theme = this.isDarkMode() ? 'light' : 'dark';
    applyTheme(theme);
    saveTheme(theme);
    this.isDarkMode.set(theme === 'dark');
  }

  switchOrganization(organizationId: string) {
    this.authenticationService.switchOrganization(organizationId).subscribe({
      next: () => this.reloadPage(),
      error: (response) => {
        toast.error('Erro ao trocar de organização', {
          description: apiErrorMessage(response, 'Ocorreu um erro ao trocar de organização.'),
        });
      },
    });
  }

  handleLogout() {
    this.authenticationService.logout();
    void this.router.navigateByUrl('/auth');
  }
}
