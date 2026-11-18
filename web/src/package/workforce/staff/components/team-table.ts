import { Component, input, output } from '@angular/core';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEllipsis, lucidePencil, lucideTrash2, lucideUsers, lucideWrench } from '@ng-icons/lucide';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../shared/components/ui/dropdown-menu';
import { Skeleton } from '../../../shared/components/ui/skeleton';
import { statusTones, WorkforceStatus } from '../staff-status';
import { TeamListItem } from '../staff.service';

export type TeamRow = TeamListItem & { status: WorkforceStatus };

/** The "Equipes" tab (AD-074): name, specialty, how many professionals and the status. */
@Component({
  selector: 'team-table-ui',
  imports: [NgIcon, Skeleton, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem],
  viewProviders: [provideIcons({ lucideEllipsis, lucidePencil, lucideTrash2, lucideUsers, lucideWrench })],
  template: `
    <div class="relative w-full overflow-x-auto">
      <table class="w-full min-w-[640px] border-collapse text-left whitespace-nowrap">
        <thead class="h-[35px]">
          <tr class="text-[8px] font-bold tracking-[0.65px] text-muted-foreground">
            <th class="font-bold">NOME</th>
            <th class="font-bold">ESPECIALIDADE</th>
            <th class="font-bold">PROFISSIONAIS</th>
            <th class="text-right font-bold">STATUS</th>
            <th><span class="sr-only">Ações</span></th>
          </tr>
        </thead>
        <tbody>
          @if (loading()) {
            @for (row of [1, 2, 3]; track row) {
              <tr data-slot="skeleton-row" class="h-[56px] border-t border-border">
                <td><t-skeleton class="h-3 w-32 rounded" /></td>
                <td><t-skeleton class="h-3 w-24 rounded" /></td>
                <td><t-skeleton class="h-3 w-12 rounded" /></td>
                <td><t-skeleton class="ml-auto h-5 w-20 rounded-full" /></td>
                <td></td>
              </tr>
            }
          } @else {
            @for (team of rows(); track team.id) {
              <tr data-slot="team-row" class="h-[56px] border-t border-border text-[10px] text-muted-foreground">
                <td>
                  <span class="flex items-center gap-2.5">
                    <span
                      aria-hidden="true"
                      class="grid size-[30px] shrink-0 place-items-center rounded-lg bg-[#e9f3f3] text-[#4b9295] dark:bg-[#17302f] dark:text-[#7cc7c2]"
                    >
                      <ng-icon name="lucideUsers" class="!size-[15px]" />
                    </span>
                    <strong data-slot="team-name" class="font-semibold text-foreground">{{ team.name }}</strong>
                  </span>
                </td>
                <td>
                  <span class="flex items-center gap-1.5"
                    ><ng-icon name="lucideWrench" class="!size-[13px] shrink-0" />{{ team.specialty }}</span
                  >
                </td>
                <td data-slot="team-count">{{ team.staffCount }}</td>
                <td class="text-right">
                  <span
                    data-slot="team-status"
                    class="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[8px] font-bold"
                    [class]="statusTones[team.status]"
                  >
                    <i class="size-[5px] rounded-full bg-current" aria-hidden="true"></i>{{ team.status }}
                  </span>
                </td>
                <td class="pl-2 text-right">
                  @if (canWrite()) {
                    <t-dropdown-menu>
                      <button
                        tDropdownMenuTrigger
                        type="button"
                        class="inline-grid size-[27px] place-items-center rounded-[5px] text-muted-foreground hover:bg-muted hover:text-foreground"
                        [attr.aria-label]="'Ações para ' + team.name"
                      >
                        <ng-icon name="lucideEllipsis" class="!size-[17px]" />
                      </button>
                      <t-dropdown-menu-content align="end" class="w-40">
                        <button tDropdownMenuItem type="button" (click)="edited.emit(team)">
                          <ng-icon name="lucidePencil" />
                          Editar
                        </button>
                        <button tDropdownMenuItem type="button" variant="destructive" (click)="deleted.emit(team)">
                          <ng-icon name="lucideTrash2" />
                          Excluir
                        </button>
                      </t-dropdown-menu-content>
                    </t-dropdown-menu>
                  }
                </td>
              </tr>
            }
          }
        </tbody>
      </table>
      @if (!loading() && rows().length === 0) {
        <div data-slot="empty" class="p-[25px] text-center text-[11px] text-muted-foreground">
          Ainda não há equipes cadastradas.
        </div>
      }
    </div>
  `,
})
export class TeamTable {
  canWrite = input.required<boolean>();
  loading = input(true);
  rows = input<TeamRow[]>([]);

  edited = output<TeamRow>();
  deleted = output<TeamRow>();

  protected readonly statusTones = statusTones;
}
