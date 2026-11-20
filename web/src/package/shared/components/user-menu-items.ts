import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBell, lucideCircleUser, lucideLogOut } from '@ng-icons/lucide';

import { initials } from './lib/initials';
import { DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from './ui/dropdown-menu';

/**
 * The user menu's items (AD-114), shared by the sidebar's profile and the top bar's avatar (AD-118):
 * who is signed in, "Conta", "Notificações" and "Sair". It sits inside a `t-dropdown-menu-content`,
 * whose menu its items close.
 */
@Component({
  selector: 'user-menu-items-ui',
  imports: [RouterLink, NgIcon, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator],
  viewProviders: [provideIcons({ lucideBell, lucideCircleUser, lucideLogOut })],
  host: { class: 'contents' },
  template: `
    <!-- text-left: a menu aligned to the end aligns its text to the end too. -->
    <t-dropdown-menu-label data-slot="user-menu-header" class="flex items-center gap-2.5 px-2 py-2 text-left font-normal">
      <span
        aria-hidden="true"
        class="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-bold text-primary"
      >
        {{ initialsOf(name()) }}
      </span>
      <span class="grid min-w-0 flex-1 gap-0.5 leading-tight">
        <strong data-slot="user-menu-name" class="truncate text-[12px] font-semibold text-foreground">{{ name() }}</strong>
        <small data-slot="user-menu-email" class="truncate text-[10px] text-muted-foreground">{{ email() }}</small>
      </span>
    </t-dropdown-menu-label>
    <t-dropdown-menu-separator />
    <a tDropdownMenuItem routerLink="/account" (click)="picked.emit()">
      <ng-icon name="lucideCircleUser" />
      Conta
    </a>
    <a tDropdownMenuItem routerLink="/notifications" (click)="picked.emit()">
      <ng-icon name="lucideBell" />
      Notificações
    </a>
    <t-dropdown-menu-separator />
    <button tDropdownMenuItem type="button" (click)="signedOut.emit()">
      <ng-icon name="lucideLogOut" />
      Sair
    </button>
  `,
})
export class UserMenuItems {
  readonly name = input.required<string>();
  readonly email = input.required<string>();

  /** "Conta" or "Notificações" was picked: a phone closes its panel. */
  readonly picked = output<void>();
  readonly signedOut = output<void>();

  protected readonly initialsOf = initials;
}
