import { Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePencil, lucideShip, lucideTrash2 } from '@ng-icons/lucide';

import { Skeleton } from '../../../shared/components/ui/skeleton';
import { formatLength } from '../vessel-csv';
import { Vessel, vesselTypeLabels } from '../vessel.service';

/** A Vessel row of the list: the Vessel and the name of its Customer. */
export type VesselRow = Vessel & { customerName: string };

/** The mareos "Lista de embarcações" table, with a selection column and no status (AD-021). */
@Component({
  selector: 'vessel-list-ui',
  imports: [NgIcon, RouterLink, Skeleton],
  viewProviders: [provideIcons({ lucidePencil, lucideShip, lucideTrash2 })],
  template: `
    <div class="mt-[14px] overflow-x-auto">
      <table class="w-full min-w-[880px] border-collapse text-left whitespace-nowrap">
        <thead class="h-[35px]">
          <tr class="text-[8px] font-bold tracking-[0.65px] text-muted-foreground">
            <th class="w-9 pr-2 text-center">
              <input
                type="checkbox"
                class="size-[15px] cursor-pointer align-middle accent-primary"
                aria-label="Selecionar todas as embarcações visíveis"
                [checked]="allSelected()"
                [indeterminate]="someSelected()"
                [disabled]="loading() || rows().length === 0"
                (change)="toggledAll.emit()"
              />
            </th>
            <th class="font-bold">EMBARCAÇÃO</th>
            <th class="font-bold">NÚMERO IMO</th>
            <th class="font-bold">TIPO</th>
            <th class="font-bold">COMPRIMENTO</th>
            <th class="font-bold">CLIENTE</th>
            <th><span class="sr-only">Ações</span></th>
          </tr>
        </thead>
        <tbody>
          @if (loading()) {
            @for (row of [1, 2, 3]; track row) {
              <tr data-slot="skeleton-row" class="h-[62px] border-t border-border">
                <td></td>
                <td>
                  <div class="flex items-center gap-[9px]">
                    <t-skeleton class="size-[30px] rounded-[7px]" />
                    <t-skeleton class="h-3 w-28 rounded" />
                  </div>
                </td>
                <td><t-skeleton class="h-3 w-16 rounded" /></td>
                <td><t-skeleton class="h-3 w-16 rounded" /></td>
                <td><t-skeleton class="h-3 w-12 rounded" /></td>
                <td><t-skeleton class="h-3 w-28 rounded" /></td>
                <td><t-skeleton class="ml-auto h-[27px] w-16 rounded-[5px]" /></td>
              </tr>
            }
          } @else {
            @for (vessel of rows(); track vessel.id) {
              <tr
                data-slot="vessel-row"
                class="h-[62px] border-t border-border text-[10px] text-muted-foreground data-[selected]:bg-primary/5"
                [attr.data-selected]="selected().has(vessel.id) ? '' : null"
              >
                <td class="w-9 pr-2 text-center">
                  <input
                    type="checkbox"
                    class="size-[15px] cursor-pointer align-middle accent-primary"
                    [attr.aria-label]="'Selecionar embarcação ' + vessel.name"
                    [checked]="selected().has(vessel.id)"
                    (change)="toggled.emit(vessel.id)"
                  />
                </td>
                <td>
                  <div class="flex min-w-[160px] items-center gap-[9px]">
                    <span
                      aria-hidden="true"
                      class="grid size-[30px] shrink-0 place-items-center rounded-[7px] bg-[#e9f3f3] text-[#4b9295] dark:bg-[#17302f] dark:text-[#7cc7c2]"
                    >
                      <ng-icon name="lucideShip" class="size-4" />
                    </span>
                    <a
                      class="text-[10px] font-semibold text-foreground hover:text-primary hover:underline"
                      [routerLink]="['/vessels', vessel.id]"
                    >
                      {{ vessel.name }}
                    </a>
                  </div>
                </td>
                <td data-slot="imo" class="tabular-nums">{{ vessel.imoNumber || '—' }}</td>
                <td data-slot="type">{{ labels[vessel.type] }}</td>
                <td data-slot="length" class="tabular-nums">{{ length(vessel.length) }} m</td>
                <td data-slot="customer" class="font-medium text-foreground/80">{{ vessel.customerName }}</td>
                <td>
                  @if (canWrite()) {
                    <div class="flex justify-end gap-1.5">
                      <button
                        type="button"
                        class="inline-flex items-center gap-1.5 rounded-[5px] border border-border bg-card px-2 py-1.5 text-[9px] text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                        [attr.aria-label]="'Editar embarcação ' + vessel.name"
                        (click)="edited.emit(vessel)"
                      >
                        <ng-icon name="lucidePencil" class="size-3.5" />
                        <span>Editar</span>
                      </button>
                      <button
                        type="button"
                        class="inline-grid size-[27px] place-items-center rounded-[5px] border border-border bg-card text-muted-foreground hover:border-destructive/40 hover:text-destructive"
                        [attr.aria-label]="'Excluir embarcação ' + vessel.name"
                        (click)="deleted.emit(vessel)"
                      >
                        <ng-icon name="lucideTrash2" class="size-3.5" />
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
          Nenhuma embarcação corresponde à sua busca.
        </div>
      }
    </div>
  `,
})
export class VesselList {
  canWrite = input.required<boolean>();
  loading = input(true);
  /** The rows to draw: already sorted and searched. */
  rows = input<VesselRow[]>([]);
  selected = input<ReadonlySet<string>>(new Set());

  toggled = output<string>();
  toggledAll = output<void>();
  edited = output<VesselRow>();
  deleted = output<VesselRow>();

  protected readonly labels = vesselTypeLabels;
  protected readonly length = formatLength;

  protected readonly allSelected = computed(
    () => this.rows().length > 0 && this.rows().every((row) => this.selected().has(row.id)),
  );
  protected readonly someSelected = computed(
    () => !this.allSelected() && this.rows().some((row) => this.selected().has(row.id)),
  );
}
