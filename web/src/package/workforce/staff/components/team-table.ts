import { Component, input, output } from '@angular/core';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePencil, lucideTrash2, lucideUsers, lucideWrench } from '@ng-icons/lucide';

import { Button } from '../../../shared/components/ui/button';
import { Skeleton } from '../../../shared/components/ui/skeleton';
import { statusTones, WorkforceStatus } from '../staff-status';
import { TeamListItem } from '../staff.service';

export type TeamRow = TeamListItem & { status: WorkforceStatus };

/** The "Equipes" tab (AD-074): name, specialty, how many professionals, the status and the row actions of AD-107. */
@Component({
  selector: 'team-table-ui',
  imports: [NgIcon, Skeleton, Button],
  viewProviders: [provideIcons({ lucidePencil, lucideTrash2, lucideUsers, lucideWrench })],
  template: `
    <div class="relative w-full overflow-x-auto">
      <table class="w-full min-w-[640px] border-collapse text-left whitespace-nowrap">
        <thead class="h-[35px] border-t border-border">
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
              <tr data-slot="team-row" class="group h-[56px] border-t border-border text-[10px] text-muted-foreground">
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
                  <span data-slot="team-specialty" class="flex items-center gap-1.5"
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
                <td data-slot="row-actions" class="pl-2">
                  @if (canWrite()) {
                    <!-- Shown on the row's hover or focus, and always where there is no hover (AD-107). -->
                    <div
                      class="flex justify-end gap-1.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100 [@media(hover:none)]:opacity-100"
                    >
                      <button
                        tButton
                        variant="ghost"
                        size="icon-sm"
                        type="button"
                        class="size-[27px] rounded-[5px] text-muted-foreground hover:text-primary"
                        [attr.aria-label]="'Editar equipe ' + team.name"
                        (click)="edited.emit(team)"
                      >
                        <ng-icon name="lucidePencil" class="!size-3.5" />
                        <span class="sr-only">Editar</span>
                      </button>
                      <button
                        tButton
                        variant="ghost"
                        size="icon-sm"
                        type="button"
                        class="size-[27px] rounded-[5px] text-destructive hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/20"
                        [attr.aria-label]="'Excluir equipe ' + team.name"
                        (click)="deleted.emit(team)"
                      >
                        <ng-icon name="lucideTrash2" class="!size-3.5" />
                        <span class="sr-only">Excluir</span>
                      </button>
                    </div>
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
