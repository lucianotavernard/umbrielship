import { Component, computed, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePencil, lucideShip, lucideTrash2 } from '@ng-icons/lucide';

import { Button } from '../../../shared/components/ui/button';
import { Checkbox } from '../../../shared/components/ui/form';
import { Skeleton } from '../../../shared/components/ui/skeleton';
import { formatLength } from '../vessel-csv';
import { Vessel, vesselTypeLabels } from '../vessel.service';

/** A Vessel row of the list: the Vessel and the name of its Customer. */
export type VesselRow = Vessel & { customerName: string };

/**
 * The mareos "Lista de embarcações" table, with a selection column and no status (AD-021). A row opens
 * its Vessel; "Editar" and "Excluir" show on the row's hover (AD-103).
 */
@Component({
  selector: 'vessel-list-ui',
  imports: [NgIcon, Button, Skeleton, Checkbox],
  viewProviders: [provideIcons({ lucidePencil, lucideShip, lucideTrash2 })],
  template: `
    <div class="relative mt-[14px] overflow-x-auto">
      <table class="w-full min-w-[880px] border-collapse text-left whitespace-nowrap">
        <thead class="h-[35px]">
          <tr class="text-[8px] font-bold tracking-[0.65px] text-muted-foreground">
            <th class="w-9 pr-2 text-center">
              <input
                type="checkbox"
                tCheckbox
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
                tabindex="0"
                class="group h-[62px] cursor-pointer border-t border-border text-[10px] text-muted-foreground outline-none hover:bg-muted/40 focus-visible:bg-muted/40 data-[selected]:bg-primary/5"
                [attr.data-selected]="selected().has(vessel.id) ? '' : null"
                (click)="open(vessel)"
                (keydown.enter)="open(vessel)"
              >
                <!-- The checkbox and the actions keep their own clicks: neither opens the Vessel. -->
                <td class="w-9 pr-2 text-center" (click)="$event.stopPropagation()">
                  <input
                    type="checkbox"
                    tCheckbox
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
                      <ng-icon name="lucideShip" class="!size-4" />
                    </span>
                    <span data-slot="vessel-name" class="text-[10px] font-semibold text-foreground">{{ vessel.name }}</span>
                  </div>
                </td>
                <td data-slot="imo" class="tabular-nums">{{ vessel.imoNumber || '—' }}</td>
                <td data-slot="type">{{ labels[vessel.type] }}</td>
                <td data-slot="length" class="tabular-nums">{{ length(vessel.length) }} m</td>
                <td data-slot="customer" class="font-medium text-foreground/80">{{ vessel.customerName }}</td>
                <td data-slot="row-actions" class="pr-3" (click)="$event.stopPropagation()">
                  @if (canWrite()) {
                    <!-- Shown on the row's hover or focus, and always where there is no hover. -->
                    <div
                      class="flex justify-end gap-1.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 focus-within:opacity-100 [@media(hover:none)]:opacity-100"
                    >
                      <button
                        tButton
                        variant="ghost"
                        size="icon-sm"
                        type="button"
                        class="size-[27px] rounded-[5px] text-muted-foreground hover:text-primary"
                        [attr.aria-label]="'Editar embarcação ' + vessel.name"
                        (click)="edited.emit(vessel)"
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
                        [attr.aria-label]="'Excluir embarcação ' + vessel.name"
                        (click)="deleted.emit(vessel)"
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

  private readonly router = inject(Router);

  protected readonly labels = vesselTypeLabels;

  /** A row opens its Vessel (AD-103). */
  protected open(vessel: VesselRow) {
    void this.router.navigate(['/vessels', vessel.id]);
  }
  protected readonly length = formatLength;

  protected readonly allSelected = computed(
    () => this.rows().length > 0 && this.rows().every((row) => this.selected().has(row.id)),
  );
  protected readonly someSelected = computed(
    () => !this.allSelected() && this.rows().some((row) => this.selected().has(row.id)),
  );
}
