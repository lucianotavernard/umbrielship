import { Component, computed, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';

import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideMail,
  lucidePencil,
  lucidePhone,
  lucideTrash2,
  lucideUsers,
} from '@ng-icons/lucide';

import { Checkbox } from '../../../shared/components/ui/form';
import { initials } from '../../../shared/components/lib/initials';
import { Button } from '../../../shared/components/ui/button';
import { Skeleton } from '../../../shared/components/ui/skeleton';
import { StaffRow } from '../staff-filters';
import { statusTones } from '../staff-status';

// The mareos tones: blue, green, purple, in turn.
const AVATAR_TONES = [
  'bg-[#edf3fa] text-[#5889bc] dark:bg-[#18283a] dark:text-[#8db4dc]',
  'bg-[#eaf5f1] text-[#4f917b] dark:bg-[#17302f] dark:text-[#7cc7c2]',
  'bg-[#f4eff8] text-[#9275a6] dark:bg-[#271f33] dark:text-[#c3a8e6]',
];

/** The mareos "Profissionais" table, with the row actions of AD-106. The page filters; this draws. */
@Component({
  selector: 'staff-table-ui',
  imports: [NgIcon, Skeleton, Button, Checkbox],
  viewProviders: [
    provideIcons({
      lucideMail,
      lucidePencil,
      lucidePhone,
      lucideTrash2,
      lucideUsers,
    }),
  ],
  template: `
    <div class="relative mt-[14px] w-full overflow-x-auto">
      <table class="w-full min-w-[720px] border-collapse text-left whitespace-nowrap">
        <thead class="h-[35px] border-t border-border">
          <tr class="text-[8px] font-bold tracking-[0.65px] text-muted-foreground">
            <th class="w-9 pr-2 text-center">
              <input
                type="checkbox"
                tCheckbox
                aria-label="Selecionar todos os profissionais visíveis"
                [checked]="allSelected()"
                [indeterminate]="someSelected()"
                (change)="toggledAll.emit()"
              />
            </th>
            <th class="font-bold">PROFISSIONAL</th>
            <th class="font-bold">EQUIPE</th>
            <th class="font-bold">CONTATO</th>
            <th class="text-right font-bold">STATUS</th>
            <th><span class="sr-only">Ações</span></th>
          </tr>
        </thead>
        <tbody>
          @if (loading()) {
            @for (row of [1, 2, 3]; track row) {
              <tr data-slot="skeleton-row" class="h-[62px] border-t border-border">
                <td></td>
                <td>
                  <div class="grid gap-1.5">
                    <t-skeleton class="h-3 w-36 rounded" />
                    <t-skeleton class="h-2.5 w-24 rounded" />
                  </div>
                </td>
                <td><t-skeleton class="h-3 w-24 rounded" /></td>
                <td><t-skeleton class="h-3 w-40 rounded" /></td>
                <td><t-skeleton class="ml-auto h-5 w-20 rounded-full" /></td>
                <td></td>
              </tr>
            }
          } @else {
            @for (person of rows(); track person.id; let index = $index) {
              <tr
                data-slot="staff-row"
                tabindex="0"
                class="group h-[62px] cursor-pointer border-t border-border text-[10px] text-muted-foreground outline-none hover:bg-muted/40 focus-visible:bg-muted/40 data-[selected]:bg-primary/5"
                [attr.data-selected]="selected().has(person.id) ? '' : null"
                (click)="open(person)"
                (keydown.enter)="open(person)"
              >
                <!-- The checkbox and the actions keep their own clicks: neither opens the profile. -->
                <td class="w-9 pr-2 text-center" (click)="$event.stopPropagation()">
                  <input
                    type="checkbox"
                    tCheckbox
                    [attr.aria-label]="'Selecionar profissional ' + person.name"
                    [checked]="selected().has(person.id)"
                    (change)="toggled.emit(person.id)"
                  />
                </td>
                <td>
                  <div class="flex items-center gap-2.5">
                    <span
                      aria-hidden="true"
                      class="grid size-[33px] shrink-0 place-items-center rounded-[9px] text-[9px] font-bold"
                      [class]="tones[index % 3]"
                    >
                      {{ initialsOf(person.name) }}
                    </span>
                    <span class="min-w-0">
                      <span data-slot="staff-name" class="block max-w-[220px] truncate font-semibold text-foreground">{{
                        person.name
                      }}</span>
                      <!-- The specialty sits under the name, with no column of its own (AD-108). -->
                      <small data-slot="staff-specialty" class="mt-1 block max-w-[220px] truncate text-[9px] text-muted-foreground">{{
                        person.specialty
                      }}</small>
                    </span>
                  </div>
                </td>
                <td>
                  <span data-slot="staff-team" class="flex items-center gap-1.5"
                    ><ng-icon name="lucideUsers" class="!size-[13px] shrink-0" />{{ person.teamName }}</span
                  >
                </td>
                <td>
                  <div class="grid gap-[5px] text-[9px]">
                    <span class="flex items-center gap-1.5"
                      ><ng-icon name="lucideMail" class="!size-[13px] shrink-0" />{{ person.email }}</span
                    >
                    <span class="flex items-center gap-1.5"
                      ><ng-icon name="lucidePhone" class="!size-[13px] shrink-0" />{{ person.phone }}</span
                    >
                  </div>
                </td>
                <td class="text-right">
                  <span
                    data-slot="staff-status"
                    class="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[8px] font-bold"
                    [class]="statusTones[person.status]"
                  >
                    <i class="size-[5px] rounded-full bg-current" aria-hidden="true"></i>{{ person.status }}
                  </span>
                </td>
                <td data-slot="row-actions" class="pl-2" (click)="$event.stopPropagation()">
                  @if (canWrite()) {
                    <!-- Shown on the row's hover or focus, and always where there is no hover (AD-106). -->
                    <div
                      class="flex justify-end gap-1.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 focus-within:opacity-100 [@media(hover:none)]:opacity-100"
                    >
                      <button
                        tButton
                        variant="ghost"
                        size="icon-sm"
                        type="button"
                        class="size-[27px] rounded-[5px] text-muted-foreground hover:text-primary"
                        [attr.aria-label]="'Editar profissional ' + person.name"
                        (click)="edited.emit(person)"
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
                        [attr.aria-label]="'Excluir profissional ' + person.name"
                        (click)="deleted.emit(person)"
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
          {{ total() ? 'Nenhum profissional encontrado com esses filtros.' : 'Ainda não há profissionais cadastrados.' }}
        </div>
      }
    </div>
  `,
})
export class StaffTable {
  canWrite = input.required<boolean>();
  loading = input(true);
  rows = input<StaffRow[]>([]);
  /** How many Staff the Organization has, whatever the filters. */
  total = input(0);
  selected = input<ReadonlySet<string>>(new Set());

  toggled = output<string>();
  toggledAll = output<void>();
  edited = output<StaffRow>();
  deleted = output<StaffRow>();

  private readonly router = inject(Router);

  protected readonly tones = AVATAR_TONES;
  protected readonly statusTones = statusTones;
  protected readonly initialsOf = initials;

  protected readonly allSelected = computed(
    () => this.rows().length > 0 && this.rows().every((row) => this.selected().has(row.id)),
  );
  protected readonly someSelected = computed(
    () => !this.allSelected() && this.rows().some((row) => this.selected().has(row.id)),
  );

  /** A row opens the professional's profile (AD-106). */
  protected open(person: StaffRow) {
    void this.router.navigate(['/staff', person.id]);
  }
}
