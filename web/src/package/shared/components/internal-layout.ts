import { httpResource } from '@angular/common/http';
import {
  Component,
  computed,
  effect,
  ElementRef,
  HostListener,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthenticationService, MeResponse } from '../../identity/authentication/authentication.service';
import { OrganizationSwitcher } from '../../identity/organization/components/organization-switcher';
import { apiErrorMessage } from './lib/api-error-message';
import { PAGE_RELOAD } from './lib/page-reload';
import { resourceValue } from './lib/resource-value';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { toast } from './ui/toaster';

@Component({
  selector: 'internal-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Button, Skeleton, OrganizationSwitcher],
  template: `
    <main class="min-h-screen bg-background">
      <header class="sticky top-0 z-50 border-b border-border bg-background/95">
        <div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <nav class="flex flex-wrap items-center gap-1">
            <a tButton routerLink="/dashboard" routerLinkActive="bg-accent text-accent-foreground" variant="ghost">
              Dashboard
            </a>
            <a tButton routerLink="/customers" routerLinkActive="bg-accent text-accent-foreground" variant="ghost">
              Clientes
            </a>
            <a tButton routerLink="/vessels" routerLinkActive="bg-accent text-accent-foreground" variant="ghost">
              Embarcações
            </a>
            <a
              tButton
              routerLink="/inspection-templates"
              routerLinkActive="bg-accent text-accent-foreground"
              variant="ghost"
            >
              Modelos de inspeção
            </a>
            @if (isInternalAdministrator()) {
              <a
                tButton
                routerLink="/organizations"
                routerLinkActive="bg-accent text-accent-foreground"
                variant="ghost"
              >
                Administração
              </a>
            }
          </nav>

          <div class="flex items-center gap-2">
            <button tButton variant="ghost" size="icon-sm" type="button" (click)="toggleDarkMode()">
              {{ isDarkMode() ? 'Claro' : 'Escuro' }}
            </button>

            @if (loading()) {
              <t-skeleton class="h-4 w-32 rounded" />
            } @else if (user(); as user) {
              <organization-switcher-ui
                [organizations]="user.organizations"
                [activeId]="user.organization.id"
                (picked)="switchOrganization($event)"
              />
              <div #userMenu class="relative">
                <button tButton type="button" variant="ghost" (click)="toggleMenu()">
                  {{ user.name }}
                </button>
                @if (isMenuOpen()) {
                  <div class="absolute right-0 z-20 mt-2 w-40 rounded-md bg-popover p-1 shadow-lg" role="menu">
                    <button tButton class="w-full justify-start" type="button" variant="ghost" (click)="handleLogout()">
                      Sair
                    </button>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </header>
      <router-outlet />
    </main>
  `,
})
export class InternalLayout {
  private readonly router = inject(Router);
  private readonly authenticationService = inject(AuthenticationService);
  private readonly reloadPage = inject(PAGE_RELOAD);
  private readonly userMenu = viewChild<ElementRef<HTMLElement>>('userMenu');

  private readonly userResource = httpResource<MeResponse>(() => '/api/me');

  isDarkMode = signal(document.documentElement.classList.contains('dark'));
  isMenuOpen = signal(false);

  user = computed(() => resourceValue(this.userResource)?.user ?? null);
  loading = computed(() => this.userResource.isLoading());
  isInternalAdministrator = computed(() => {
    const user = this.user();
    return user?.role === 'administrator' && user.organization.isInternal;
  });

  constructor() {
    effect(() => {
      const user = this.user();
      if (user) this.authenticationService.role.set(user.role);
    });

    effect(() => {
      const user = this.user();
      if (!user || !this.authenticationService.takeOrganizationChanged()) return;
      toast.info(`A organização ativa mudou para ${user.organization.name}.`);
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const menu = this.userMenu()?.nativeElement;
    if (menu && event.target instanceof Node && !menu.contains(event.target)) {
      this.isMenuOpen.set(false);
    }
  }

  @HostListener('window:storage', ['$event'])
  onStorage(event: StorageEvent) {
    if (!this.authenticationService.isOrganizationSwitch(event)) return;
    this.authenticationService.markOrganizationChanged();
    this.reloadPage();
  }

  toggleMenu() {
    this.isMenuOpen.update((open) => !open);
  }

  toggleDarkMode() {
    const html = document.documentElement;
    const dark = html.classList.toggle('dark');
    this.isDarkMode.set(dark);
    localStorage.setItem('@umbriel:theme', dark ? 'dark' : 'light');
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
