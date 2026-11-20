import { Component, input, output } from '@angular/core';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMail, lucideRotateCcw } from '@ng-icons/lucide';

import { Skeleton } from '../../../shared/components/ui/skeleton';
import { roleTones } from '../../user/components/user-list';
import { roleLabels } from '../../user/user.service';
import { Invitation, InvitationStatus, invitationStatusLabels } from '../invitation.service';

const statusTones: Record<InvitationStatus, string> = {
  pending: 'bg-[#fff4e5] text-[#b7791f] dark:bg-[#2e2516] dark:text-[#e0b76f]',
  accepted: 'bg-[#e9f6ef] text-[#2f8a5b] dark:bg-[#15291f] dark:text-[#8fcfab]',
};

/** The Invitations of an Organization, as the other tables of the app draw them (AD-112). */
@Component({
  selector: 'invitation-list-ui',
  imports: [NgIcon, Skeleton],
  viewProviders: [provideIcons({ lucideMail, lucideRotateCcw })],
  template: `
    <div class="relative mt-[14px] overflow-x-auto">
      <table class="w-full min-w-[560px] border-collapse text-left whitespace-nowrap">
        <thead class="h-[35px]">
          <tr class="text-[8px] font-bold tracking-[0.65px] text-muted-foreground">
            <th class="font-bold">E-MAIL</th>
            <th class="font-bold">PAPEL</th>
            <th class="font-bold">STATUS</th>
            <th><span class="sr-only">Ações</span></th>
          </tr>
        </thead>
        <tbody>
          @if (loading()) {
            @for (row of [1, 2]; track row) {
              <tr data-slot="skeleton-row" class="h-[52px] border-t border-border">
                <td><t-skeleton class="h-3 w-44 rounded" /></td>
                <td><t-skeleton class="h-5 w-20 rounded-full" /></td>
                <td><t-skeleton class="h-5 w-16 rounded-full" /></td>
                <td class="pr-3"><t-skeleton class="ml-auto h-[27px] w-20 rounded-[5px]" /></td>
              </tr>
            }
          } @else {
            @for (invitation of invitations(); track invitation.id) {
              <tr data-slot="invitation-row" class="h-[52px] border-t border-border text-[10px] text-muted-foreground">
                <td>
                  <span data-slot="invitation-email" class="flex items-center gap-1.5 font-semibold text-foreground"
                    ><ng-icon name="lucideMail" class="!size-[13px] shrink-0 text-muted-foreground" />{{
                      invitation.email
                    }}</span
                  >
                </td>
                <td>
                  <span
                    data-slot="role"
                    class="inline-flex items-center rounded-full px-2.5 py-1 text-[8px] font-bold"
                    [class]="roleTones[invitation.role]"
                    >{{ roleLabels[invitation.role] }}</span
                  >
                </td>
                <td>
                  <span
                    data-slot="invitation-status"
                    class="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[8px] font-bold"
                    [class]="statusTones[invitation.status]"
                  >
                    <i class="size-[5px] rounded-full bg-current" aria-hidden="true"></i>{{
                      statusLabels[invitation.status]
                    }}
                  </span>
                </td>
                <td class="pr-3">
                  <div class="flex justify-end">
                    <button
                      type="button"
                      class="inline-flex h-[27px] items-center gap-1.5 rounded-[5px] border border-border bg-card px-2.5 text-[10px] whitespace-nowrap text-foreground/75 hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                      [disabled]="resending() === invitation.id"
                      [attr.aria-label]="'Reenviar convite para ' + invitation.email"
                      (click)="resent.emit(invitation)"
                    >
                      <ng-icon name="lucideRotateCcw" class="!size-3.5" />
                      Reenviar
                    </button>
                  </div>
                </td>
              </tr>
            }
          }
        </tbody>
      </table>
      @if (!loading() && invitations().length === 0) {
        <div data-slot="empty" class="p-[25px] text-center text-[11px] text-muted-foreground">
          Nenhum convite enviado até agora.
        </div>
      }
    </div>
  `,
})
export class InvitationList {
  loading = input(true);
  invitations = input<Invitation[]>([]);
  /** The Invitation being sent again, whose button waits. */
  resending = input<string | null>(null);

  resent = output<Invitation>();

  protected readonly roleTones = roleTones;
  protected readonly roleLabels = roleLabels;
  protected readonly statusTones = statusTones;
  protected readonly statusLabels = invitationStatusLabels;
}
