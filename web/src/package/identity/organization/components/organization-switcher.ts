import { Component, computed, input, output } from '@angular/core';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideChevronDown, lucidePlus } from '@ng-icons/lucide';

import { initials } from '../../../shared/components/lib/initials';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../shared/components/ui/dropdown-menu';
import { MeOrganization } from '../../authentication/authentication.service';
import { roleLabels } from '../../user/user.service';

/** The sidebar's Organization block: the active one, and the menu to switch to another. */
@Component({
  selector: 'organization-switcher-ui',
  imports: [
    NgIcon,
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
  ],
  viewProviders: [provideIcons({ lucideCheck, lucideChevronDown, lucidePlus })],
  template: `
    @if (active(); as organization) {
      <t-dropdown-menu>
        <button
          tDropdownMenuTrigger
          type="button"
          aria-label="Selecionar organização"
          class="flex w-full min-w-0 items-center gap-2.5 rounded-lg border border-sidebar-border px-2.5 py-2.5 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/30 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:p-0"
          [attr.title]="organization.name"
        >
          <span
            class="grid size-[30px] shrink-0 place-items-center rounded-md bg-primary/10 text-[13px] font-bold text-primary"
          >
            {{ initialsOf(organization.name) }}
          </span>
          <!-- Collapsed to icons, the sidebar keeps only the initials (AD-113). -->
          <span class="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <strong class="block truncate text-[11px] font-bold">{{ organization.name }}</strong>
            <small class="mt-1 block text-[10px] text-muted-foreground">
              {{ roleLabels[organization.role] }}
            </small>
          </span>
          <!-- A span hides the chevron: ng-icon keeps its own display. -->
          <span class="flex shrink-0 group-data-[collapsible=icon]:hidden">
            <ng-icon name="lucideChevronDown" class="!size-3.5 text-muted-foreground" />
          </span>
        </button>

        <!-- The menu takes the button's width and opens 4px under it, as the mareos does. -->
        <t-dropdown-menu-content align="start" [sideOffset]="4" class="w-[anchor-size(width)] p-[5px] group-data-[collapsible=icon]:w-56">
          <t-dropdown-menu-label
            class="px-2 py-[7px] text-[9px] font-bold tracking-[0.08em] text-muted-foreground uppercase"
          >
            Trocar organização
          </t-dropdown-menu-label>
          @for (option of organizations(); track option.id) {
            <button
              tDropdownMenuItem
              type="button"
              class="min-h-[46px] gap-2.5 py-[7px] pr-2 pl-2 text-[11px] data-[checked]:bg-primary/10"
              [attr.data-checked]="option.id === activeId() ? '' : null"
              (click)="pick(option.id)"
            >
              <span
                aria-hidden="true"
                class="grid size-[29px] shrink-0 place-items-center rounded-md bg-primary/15 text-[10px] font-bold text-primary"
              >
                {{ initialsOf(option.name) }}
              </span>
              <span class="flex min-w-0 flex-1 flex-col gap-[3px]">
                <strong class="truncate text-[10px] font-bold">{{ option.name }}</strong>
                <small class="text-[9px] text-muted-foreground">{{ roleLabels[option.role] }}</small>
              </span>
              @if (option.id === activeId()) {
                <ng-icon name="lucideCheck" class="!size-3.5 text-primary" data-slot="active-check" />
                <span class="sr-only">(ativa)</span>
              }
            </button>
          }
          @if (canCreate()) {
            <!-- Last, for an internal Administrator only: the one Role that may create one (AD-117). -->
            <t-dropdown-menu-separator class="my-[5px]" />
            <button
              tDropdownMenuItem
              type="button"
              data-slot="create-organization"
              class="min-h-[36px] gap-2.5 py-[7px] pr-2 pl-2 text-[11px] font-semibold text-primary"
              (click)="createRequested.emit()"
            >
              <span aria-hidden="true" class="grid size-[29px] shrink-0 place-items-center rounded-md border border-dashed border-primary/40">
                <ng-icon name="lucidePlus" class="!size-3.5 text-primary" />
              </span>
              Nova organização
            </button>
          }
        </t-dropdown-menu-content>
      </t-dropdown-menu>
    }
  `,
  host: { class: 'block' },
})
export class OrganizationSwitcher {
  organizations = input<MeOrganization[]>([]);
  activeId = input<string>('');
  /** Whether the menu ends with "Nova organização": only an internal Administrator may create one. */
  canCreate = input(false);
  picked = output<string>();
  createRequested = output<void>();

  active = computed(
    () => this.organizations().find((organization) => organization.id === this.activeId()) ?? null,
  );

  protected readonly roleLabels = roleLabels;
  protected readonly initialsOf = initials;

  pick(organizationId: string) {
    if (organizationId === this.activeId()) return;
    this.picked.emit(organizationId);
  }
}
