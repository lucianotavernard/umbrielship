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
  lucideMoon,
  lucideShip,
  lucideSun,
  lucideUsers,
} from '@ng-icons/lucide';
import { filter } from 'rxjs';

import { AuthenticationService, MeResponse } from '../../identity/authentication/authentication.service';
import { UserMenuItems } from './user-menu-items';
import { OrganizationCreateSheet } from '../../identity/organization/components/organization-create-sheet';
import { OrganizationSwitcher } from '../../identity/organization/components/organization-switcher';
import type { Organization } from '../../identity/organization/organization.service';
import { NotificationMenu } from '../../work-order/notification/components/notification-menu';
import { roleLabels } from '../../identity/user/user.service';
import { apiErrorMessage } from './lib/api-error-message';
import { initials } from './lib/initials';
import { PAGE_RELOAD } from './lib/page-reload';
import { resourceValue } from './lib/resource-value';
import { applyTheme, saveTheme } from './lib/theme';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './ui/dropdown-menu';
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
  { key: 'staff', label: 'Equipe técnica', link: '/staff', icon: 'lucideUsers' },
];

const MANAGEMENT_MENU: MenuItem[] = [
  { key: 'organizations', label: 'Organizações', link: '/organizations', icon: 'lucideBuilding2' },
];

/**
 * The menu item a route belongs to, the first match winning (AD-032): a template belongs to the
 * Inspections hub, and so do the inspection pages under a WorkOrder (AD-048).
 */
const SECTIONS: { pattern: RegExp; key: string }[] = [
  { pattern: /^\/dashboard(\/|$)/, key: 'overview' },
  { pattern: /^\/work-orders\/[^/]+\/assignments(\/|$)/, key: 'inspections' },
  { pattern: /^\/work-orders(\/|$)/, key: 'work-orders' },
  { pattern: /^\/inspections(\/|$)/, key: 'inspections' },
  { pattern: /^\/inspection-templates(\/|$)/, key: 'inspections' },
  { pattern: /^\/vessels(\/|$)/, key: 'vessels' },
  { pattern: /^\/customers(\/|$)/, key: 'customers' },
  { pattern: /^\/agenda(\/|$)/, key: 'agenda' },
  { pattern: /^\/staff(\/|$)/, key: 'staff' },
  { pattern: /^\/organizations(\/|$)/, key: 'organizations' },
  { pattern: /^\/account(\/|$)/, key: 'account' },
  { pattern: /^\/notifications(\/|$)/, key: 'notifications' },
];

const LABELS: Record<string, string> = {
  ...Object.fromEntries([...MAIN_MENU, ...MANAGEMENT_MENU].map((item) => [item.key, item.label])),
  // The user menu's pages, named in the top bar though no menu item is theirs.
  account: 'Conta',
  notifications: 'Notificações',
};

@Component({
  selector: 'internal-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    NgIcon,
    Skeleton,
    OrganizationSwitcher,
    OrganizationCreateSheet,
    NotificationMenu,
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    UserMenuItems,
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
      lucideMoon,
      lucideShip,
      lucideSun,
      lucideUsers,
    }),
  ],
  template: `
    <t-sidebar-provider>
      <!-- Collapses to its icons on a desktop (AD-113); the button in the top bar and Ctrl+B toggle it. -->
      <t-sidebar collapsible="icon" class="border-sidebar-border">
        <t-sidebar-header class="gap-0 px-4 py-0 group-data-[collapsible=icon]:px-2">
          <div
            class="-mx-2 mb-4 flex h-[69px] shrink-0 items-center gap-2.5 border-b border-sidebar-border px-2 group-data-[collapsible=icon]:mx-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
          >
            <span class="grid size-[31px] shrink-0 place-items-center rounded-[9px] bg-primary text-primary-foreground">
              <ng-icon name="lucideAnchor" class="!size-[19px]" />
            </span>
            <span class="text-[17px] font-extrabold tracking-[0.4px] whitespace-nowrap group-data-[collapsible=icon]:hidden"
              >MARÉ<span class="text-primary">OS</span></span
            >
          </div>

          @if (user(); as user) {
            <organization-switcher-ui
              class="mb-2"
              [organizations]="user.organizations"
              [activeId]="user.organization.id"
              [canCreate]="isInternalAdministrator()"
              (picked)="switchOrganization($event)"
              (createRequested)="isCreatingOrganization.set(true)"
            />
          } @else {
            <t-skeleton class="mb-2 h-[52px] w-full rounded-lg" />
          }
        </t-sidebar-header>

        <t-sidebar-content>
          <nav aria-label="Menu principal" class="contents">
            <t-sidebar-group class="px-2 py-0">
              <span
                tSidebarGroupLabel
                class="mb-[9px] h-auto px-2 text-[9px] font-bold tracking-[1px] text-muted-foreground group-data-[collapsible=icon]:hidden"
              >
                MENU PRINCIPAL
              </span>
              <t-sidebar-group-content>
                <ul tSidebarMenu class="gap-[3px]">
                  @for (item of mainMenu; track item.key) {
                    <li tSidebarMenuItem>
                      <a
                        tSidebarMenuButton
                        class="h-[38px] gap-[11px] px-2.5 text-[12px] text-muted-foreground data-[active=true]:font-semibold group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0! [&>ng-icon]:!size-[17px] [&>ng-icon]:shrink-0"
                        [routerLink]="item.link"
                        [isActive]="section() === item.key"
                        [tooltip]="item.label"
                        [attr.aria-current]="section() === item.key ? 'page' : null"
                        (click)="closeMobile()"
                      >
                        <ng-icon [name]="item.icon" />
                        <!-- Collapsed to icons, the name shows only on hover (AD-113). -->
                        <span class="group-data-[collapsible=icon]:hidden">{{ item.label }}</span>
                      </a>
                    </li>
                  }
                </ul>
              </t-sidebar-group-content>
            </t-sidebar-group>

            @if (isInternalAdministrator()) {
              <t-sidebar-group class="mt-2 px-2 py-0">
                <span
                  tSidebarGroupLabel
                  class="mb-[9px] h-auto px-2 text-[9px] font-bold tracking-[1px] text-muted-foreground group-data-[collapsible=icon]:hidden"
                >
                  GESTÃO
                </span>
                <t-sidebar-group-content>
                  <ul tSidebarMenu class="gap-[3px]">
                    @for (item of managementMenu; track item.key) {
                      <li tSidebarMenuItem>
                        <a
                          tSidebarMenuButton
                          class="h-[38px] gap-[11px] px-2.5 text-[12px] text-muted-foreground data-[active=true]:font-semibold group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0! [&>ng-icon]:!size-[17px] [&>ng-icon]:shrink-0"
                          [routerLink]="item.link"
                          [isActive]="section() === item.key"
                          [tooltip]="item.label"
                          [attr.aria-current]="section() === item.key ? 'page' : null"
                          (click)="closeMobile()"
                        >
                          <ng-icon [name]="item.icon" />
                          <span class="group-data-[collapsible=icon]:hidden">{{ item.label }}</span>
                        </a>
                      </li>
                    }
                  </ul>
                </t-sidebar-group-content>
              </t-sidebar-group>
            }
          </nav>
        </t-sidebar-content>

        <t-sidebar-footer class="gap-0 px-4 pt-0 pb-3 group-data-[collapsible=icon]:px-2">
          <t-sidebar-separator class="mx-0 mb-3" />
          @if (user(); as user) {
            <div class="flex items-center gap-2.5 group-data-[collapsible=icon]:justify-center" data-slot="profile">
              <span
                class="grid size-[30px] shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-bold text-primary"
                [attr.title]="user.name"
              >
                {{ initialsOf(user.name) }}
              </span>
              <span class="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                <strong class="block truncate text-[11px] font-bold">{{ user.name }}</strong>
                <small class="mt-0.5 block text-[10px] text-muted-foreground">{{ roleLabels[user.role] }}</small>
              </span>
              <t-dropdown-menu>
                <button
                  tDropdownMenuTrigger
                  type="button"
                  aria-label="Abrir menu do usuário"
                  class="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-sidebar-accent group-data-[collapsible=icon]:hidden"
                >
                  <ng-icon name="lucideEllipsis" class="!size-[19px]" />
                </button>
                <!-- Who is signed in, the account pages and Sair (AD-114). -->
                <t-dropdown-menu-content
                  align="end"
                  class="w-56 p-[5px]"
                  [side]="userMenuSide()"
                  [sideOffset]="userMenuOffset()"
                >
                  <user-menu-items-ui
                    [name]="user.name"
                    [email]="user.email"
                    (picked)="closeMobile()"
                    (signedOut)="handleLogout()"
                  />
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
          <div class="flex min-w-0 items-center gap-2">
            <button
              tSidebarTrigger
              type="button"
              class="-ml-1.5 size-[30px] shrink-0 rounded-[7px] text-muted-foreground hover:bg-accent hover:text-primary"
              [attr.aria-label]="menuTriggerLabel()"
              [attr.title]="menuTriggerLabel() + ' (Ctrl+B)'"
              [attr.aria-expanded]="menuExpanded()"
            ></button>
            <span class="mr-1 h-4 shrink-0 border-l border-border" aria-hidden="true"></span>
            <div class="flex min-w-0 items-center gap-2 text-[12px] text-muted-foreground">
              <span>Operação</span>
              <ng-icon name="lucideChevronRight" class="!size-3.5 shrink-0" />
              <strong class="truncate font-bold text-foreground" data-slot="breadcrumb-section">
                {{ sectionLabel() }}
              </strong>
            </div>
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
            @if (user(); as user) {
              <!-- The notices of the Role in the active Organization (AD-116). -->
              <notification-menu-ui [userId]="user.id" [role]="user.role" />
            }
            <span class="h-6 border-l border-border"></span>
            @if (user(); as user) {
              <!-- The avatar opens the same menu as the sidebar's profile (AD-118). -->
              <t-dropdown-menu>
                <button
                  tDropdownMenuTrigger
                  type="button"
                  aria-label="Abrir menu da conta"
                  data-slot="topbar-avatar"
                  class="grid size-[30px] place-items-center rounded-full bg-primary/10 text-[11px] font-bold text-primary transition-shadow outline-none hover:ring-2 hover:ring-primary/25 focus-visible:ring-2 focus-visible:ring-ring aria-expanded:ring-2 aria-expanded:ring-primary/25"
                  [attr.title]="user.name"
                >
                  {{ initialsOf(user.name) }}
                </button>
                <t-dropdown-menu-content align="end" [sideOffset]="10" class="w-56 p-[5px]">
                  <user-menu-items-ui [name]="user.name" [email]="user.email" (signedOut)="handleLogout()" />
                </t-dropdown-menu-content>
              </t-dropdown-menu>
            }
          </div>
        </header>

        <router-outlet />
      </main>
    </t-sidebar-provider>

    @if (isInternalAdministrator()) {
      <organization-create-sheet-ui
        [isActive]="isCreatingOrganization()"
        (closed)="isCreatingOrganization.set(false)"
        (created)="onOrganizationCreated($event)"
      />
    }
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
  /** The "Nova organização" drawer of the sidebar's Organization menu (AD-117). */
  isCreatingOrganization = signal(false);
  private readonly url = signal(this.router.url);

  user = computed(() => resourceValue(this.userResource)?.user ?? null);
  isInternalAdministrator = computed(() => {
    const user = this.user();
    return user?.role === 'administrator' && user.organization.isInternal;
  });

  section = computed(() => {
    const path = this.url().split(/[?#]/)[0];
    return SECTIONS.find(({ pattern }) => pattern.test(path))?.key ?? null;
  });
  sectionLabel = computed(() => {
    const key = this.section();
    return key ? LABELS[key] : '';
  });

  /**
   * The top bar's menu button (AD-113): on a phone it opens the panel; on a desktop it collapses the
   * sidebar to its icons and expands it back.
   */
  menuTriggerLabel = computed(() => {
    const sidebar = this.sidebar();
    if (!sidebar || sidebar.isMobile()) return 'Abrir menu';
    return sidebar.open() ? 'Recolher menu' : 'Expandir menu';
  });
  /**
   * The user menu opens beside the sidebar on a desktop, its bottom on the profile's (AD-115): 24px
   * from the menu button clear the footer's 16px padding and leave 8px past the sidebar's edge. On a
   * phone the panel leaves no room beside it, so the menu opens above the profile.
   */
  userMenuSide = computed(() => (this.sidebar()?.isMobile() ? 'top' : 'right'));
  userMenuOffset = computed(() => (this.sidebar()?.isMobile() ? 4 : 24));

  menuExpanded = computed(() => {
    const sidebar = this.sidebar();
    if (!sidebar) return false;
    return sidebar.isMobile() ? sidebar.openMobile() : sidebar.open();
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

  /** The new Organization opens, so the list or the page behind the drawer shows it. */
  onOrganizationCreated(organization: Organization) {
    this.isCreatingOrganization.set(false);
    void this.router.navigate(['/organizations', organization.id]);
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
