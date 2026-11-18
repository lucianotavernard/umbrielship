import { Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideEllipsis,
  lucideEye,
  lucideMail,
  lucidePencil,
  lucidePhone,
  lucideTrash2,
  lucideUsers,
  lucideWrench,
} from '@ng-icons/lucide';

import { initials } from '../../../shared/components/lib/initials';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../shared/components/ui/dropdown-menu';
import { Skeleton } from '../../../shared/components/ui/skeleton';
import { StaffRow } from '../staff-filters';
import { statusTones } from '../staff-status';

// The mareos tones: blue, green, purple, in turn.
const AVATAR_TONES = [
  'bg-[#edf3fa] text-[#5889bc] dark:bg-[#18283a] dark:text-[#8db4dc]',
  'bg-[#eaf5f1] text-[#4f917b] dark:bg-[#17302f] dark:text-[#7cc7c2]',
  'bg-[#f4eff8] text-[#9275a6] dark:bg-[#271f33] dark:text-[#c3a8e6]',
];

/** The mareos "Profissionais" table, with the row menu of AD-069. The page filters; this draws. */
@Component({
  selector: 'staff-table-ui',
  imports: [NgIcon, RouterLink, Skeleton, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem],
  viewProviders: [
    provideIcons({
      lucideEllipsis,
      lucideEye,
      lucideMail,
      lucidePencil,
      lucidePhone,
      lucideTrash2,
      lucideUsers,
      lucideWrench,
    }),
  ],
  template: `
    <div class="relative w-full overflow-x-auto">
      <table class="w-full min-w-[820px] border-collapse text-left whitespace-nowrap">
        <thead class="h-[35px] border-t border-border">
          <tr class="text-[8px] font-bold tracking-[0.65px] text-muted-foreground">
            <th class="w-9 pr-2 text-center">
              <input
                type="checkbox"
                class="size-[15px] cursor-pointer align-middle accent-primary"
                aria-label="Selecionar todos os profissionais visíveis"
                [checked]="allSelected()"
                [indeterminate]="someSelected()"
                (change)="toggledAll.emit()"
              />
            </th>
            <th class="font-bold">PROFISSIONAL</th>
            <th class="font-bold">ESPECIALIDADE</th>
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
                <td><t-skeleton class="h-3 w-36 rounded" /></td>
                <td><t-skeleton class="h-3 w-28 rounded" /></td>
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
                class="h-[62px] border-t border-border text-[10px] text-muted-foreground"
                [class.bg-primary/5]="selected().has(person.id)"
              >
                <td class="w-9 pr-2 text-center">
                  <input
                    type="checkbox"
                    class="size-[15px] cursor-pointer align-middle accent-primary"
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
                    <a
                      data-slot="staff-name"
                      class="font-semibold text-foreground hover:text-primary hover:underline"
                      [routerLink]="['/staff', person.id]"
                    >
                      {{ person.name }}
                    </a>
                  </div>
                </td>
                <td>
                  <span class="flex items-center gap-1.5"
                    ><ng-icon name="lucideWrench" class="!size-[13px] shrink-0" />{{ person.specialty }}</span
                  >
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
                <td class="pl-2 text-right">
                  <t-dropdown-menu>
                    <button
                      tDropdownMenuTrigger
                      type="button"
                      class="inline-grid size-[27px] place-items-center rounded-[5px] text-muted-foreground hover:bg-muted hover:text-foreground"
                      [attr.aria-label]="'Ações para ' + person.name"
                    >
                      <ng-icon name="lucideEllipsis" class="!size-[17px]" />
                    </button>
                    <t-dropdown-menu-content align="end" class="w-40">
                      <a tDropdownMenuItem [routerLink]="['/staff', person.id]">
                        <ng-icon name="lucideEye" />
                        Ver perfil
                      </a>
                      @if (canWrite()) {
                        <button tDropdownMenuItem type="button" (click)="edited.emit(person)">
                          <ng-icon name="lucidePencil" />
                          Editar
                        </button>
                        <button tDropdownMenuItem type="button" variant="destructive" (click)="deleted.emit(person)">
                          <ng-icon name="lucideTrash2" />
                          Excluir
                        </button>
                      }
                    </t-dropdown-menu-content>
                  </t-dropdown-menu>
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

  protected readonly tones = AVATAR_TONES;
  protected readonly statusTones = statusTones;
  protected readonly initialsOf = initials;

  protected readonly allSelected = computed(
    () => this.rows().length > 0 && this.rows().every((row) => this.selected().has(row.id)),
  );
  protected readonly someSelected = computed(
    () => !this.allSelected() && this.rows().some((row) => this.selected().has(row.id)),
  );
}
