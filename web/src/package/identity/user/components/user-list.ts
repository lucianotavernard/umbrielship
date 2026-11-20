import { Component, input } from '@angular/core';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMail } from '@ng-icons/lucide';

import { initials } from '../../../shared/components/lib/initials';
import { Skeleton } from '../../../shared/components/ui/skeleton';
import { Role, roleLabels, User } from '../user.service';

// The avatar tones of the other tables: blue, green, purple, in turn.
const TONES = [
  'bg-[#edf3fa] text-[#5889bc] dark:bg-[#18283a] dark:text-[#8db4dc]',
  'bg-[#eaf5f1] text-[#4f917b] dark:bg-[#17302f] dark:text-[#7cc7c2]',
  'bg-[#f4eff8] text-[#9275a6] dark:bg-[#271f33] dark:text-[#c3a8e6]',
];

/** Each Role in its own tone, shared by the members and the invitations (AD-112). */
export const roleTones: Record<Role, string> = {
  administrator: 'bg-primary/10 text-primary',
  operator: 'bg-[#e8eff7] text-[#3f6b96] dark:bg-[#18283a] dark:text-[#8db4dc]',
  inspector: 'bg-[#f4eff8] text-[#8a6aa0] dark:bg-[#271f33] dark:text-[#c3a8e6]',
};

/** The members of an Organization, as the other tables of the app draw them (AD-112). */
@Component({
  selector: 'user-list-ui',
  imports: [NgIcon, Skeleton],
  viewProviders: [provideIcons({ lucideMail })],
  template: `
    <div class="relative mt-[14px] overflow-x-auto">
      <table class="w-full min-w-[560px] border-collapse text-left whitespace-nowrap">
        <thead class="h-[35px]">
          <tr class="text-[8px] font-bold tracking-[0.65px] text-muted-foreground">
            <th class="font-bold">USUÁRIO</th>
            <th class="font-bold">E-MAIL</th>
            <th class="pr-3 text-right font-bold">PAPEL</th>
          </tr>
        </thead>
        <tbody>
          @if (loading()) {
            @for (row of [1, 2, 3]; track row) {
              <tr data-slot="skeleton-row" class="h-[56px] border-t border-border">
                <td>
                  <div class="flex items-center gap-2.5">
                    <t-skeleton class="size-[33px] rounded-[9px]" />
                    <t-skeleton class="h-3 w-32 rounded" />
                  </div>
                </td>
                <td><t-skeleton class="h-3 w-44 rounded" /></td>
                <td class="pr-3"><t-skeleton class="ml-auto h-5 w-20 rounded-full" /></td>
              </tr>
            }
          } @else {
            @for (user of users(); track user.id; let index = $index) {
              <tr data-slot="member-row" class="h-[56px] border-t border-border text-[10px] text-muted-foreground">
                <td>
                  <div class="flex items-center gap-2.5">
                    <span
                      aria-hidden="true"
                      class="grid size-[33px] shrink-0 place-items-center rounded-[9px] text-[9px] font-bold"
                      [class]="tones[index % tones.length]"
                    >
                      {{ initialsOf(user.name) }}
                    </span>
                    <span data-slot="member-name" class="max-w-[240px] truncate font-semibold text-foreground">{{
                      user.name
                    }}</span>
                  </div>
                </td>
                <td>
                  <span data-slot="member-email" class="flex items-center gap-1.5"
                    ><ng-icon name="lucideMail" class="!size-[13px] shrink-0" />{{ user.email }}</span
                  >
                </td>
                <td class="pr-3 text-right">
                  <span
                    data-slot="role"
                    class="inline-flex items-center rounded-full px-2.5 py-1 text-[8px] font-bold"
                    [class]="roleTones[user.role]"
                    >{{ roleLabels[user.role] }}</span
                  >
                </td>
              </tr>
            }
          }
        </tbody>
      </table>
      @if (!loading() && users().length === 0) {
        <div data-slot="empty" class="p-[25px] text-center text-[11px] text-muted-foreground">
          Nenhum membro nesta organização.
        </div>
      }
    </div>
  `,
})
export class UserList {
  loading = input(true);
  users = input<User[]>([]);

  protected readonly tones = TONES;
  protected readonly roleTones = roleTones;
  protected readonly roleLabels = roleLabels;
  protected readonly initialsOf = initials;
}
