import { Component, computed, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideClock3, lucidePencil, lucideShip, lucideTrash2 } from '@ng-icons/lucide';

import { Checkbox } from '../../../shared/components/ui/form';
import { Button } from '../../../shared/components/ui/button';
import { Skeleton } from '../../../shared/components/ui/skeleton';
import { moreServicesLabel, prazoLabel, shortDateTime, WorkOrderRow } from '../work-order-filters';
import { workOrderCode, workOrderStatusLabels, workOrderStatusTones } from '../work-order.service';

/**
 * The mareos "Lista de ordens" table without "EQUIPE RESPONSÁVEL" and "PRIORIDADE" (AD-034). A row opens
 * its WorkOrder; "Editar" and "Excluir" show on the row's hover (AD-102).
 */
@Component({
  selector: 'work-order-table-ui',
  imports: [NgIcon, Button, Skeleton, Checkbox],
  viewProviders: [provideIcons({ lucideClock3, lucidePencil, lucideShip, lucideTrash2 })],
  template: `
    <div class="relative mt-[9px] w-full overflow-x-auto">
      <table class="w-full min-w-[760px] border-collapse text-left whitespace-nowrap">
        <thead class="h-[35px]">
          <tr class="text-[8px] font-bold tracking-[0.65px] text-muted-foreground">
            <th class="w-9 pr-2 text-center">
              <input
                type="checkbox"
                tCheckbox
                aria-label="Selecionar todas as ordens visíveis"
                [checked]="allSelected()"
                [indeterminate]="someSelected()"
                [disabled]="loading() || rows().length === 0"
                (change)="toggledAll.emit()"
              />
            </th>
            <th class="font-bold">ORDEM / EMBARCAÇÃO</th>
            <th class="font-bold">SERVIÇO</th>
            <th class="font-bold">PRAZO</th>
            <th class="font-bold">STATUS</th>
            <th><span class="sr-only">Ações</span></th>
          </tr>
        </thead>
        <tbody>
          @if (loading()) {
            @for (row of [1, 2, 3, 4]; track row) {
              <tr data-slot="skeleton-row" class="h-[59px] border-t border-border">
                <td></td>
                <td>
                  <div class="flex items-center gap-[9px]">
                    <t-skeleton class="size-[30px] rounded-[7px]" />
                    <t-skeleton class="h-3 w-28 rounded" />
                  </div>
                </td>
                <td><t-skeleton class="h-3 w-32 rounded" /></td>
                <td><t-skeleton class="h-3 w-24 rounded" /></td>
                <td><t-skeleton class="h-5 w-20 rounded-full" /></td>
                <td></td>
              </tr>
            }
          } @else {
            @for (order of rows(); track order.id) {
              <tr
                data-slot="work-order-row"
                tabindex="0"
                class="group h-[59px] cursor-pointer border-t border-border text-[10px] text-muted-foreground outline-none hover:bg-muted/40 focus-visible:bg-muted/40 data-[selected]:bg-primary/5"
                [attr.data-selected]="selected().has(order.id) ? '' : null"
                (click)="open(order)"
                (keydown.enter)="open(order)"
              >
                <!-- The checkbox and the actions keep their own clicks: neither opens the WorkOrder. -->
                <td class="w-9 pr-2 text-center" (click)="$event.stopPropagation()">
                  <input
                    type="checkbox"
                    tCheckbox
                    [attr.aria-label]="'Selecionar ordem ' + code(order.id)"
                    [checked]="selected().has(order.id)"
                    (change)="toggled.emit(order.id)"
                  />
                </td>
                <td>
                  <div class="flex min-w-[190px] items-center gap-[9px]">
                    <span
                      aria-hidden="true"
                      class="grid size-[30px] shrink-0 place-items-center rounded-[7px] bg-[#e9f3f3] text-[#4b9295] dark:bg-[#17302f] dark:text-[#7cc7c2]"
                    >
                      <ng-icon name="lucideShip" class="!size-4" />
                    </span>
                    <div>
                      <span data-slot="vessel" class="block text-[10px] font-semibold text-foreground">
                        {{ order.vesselName }}
                      </span>
                      <span data-slot="code" class="mt-1 block text-[9px] text-muted-foreground">
                        {{ code(order.id) }} · {{ order.customerName }}
                      </span>
                    </div>
                  </div>
                </td>
                <td>
                  @if (order.services.length) {
                    <span data-slot="service" class="block text-[10px] text-foreground/80">{{ order.services[0].name }}</span>
                    @if (more(order.services.length)) {
                      <span data-slot="more-services" class="mt-1 block text-[9px] text-muted-foreground">
                        {{ more(order.services.length) }}
                      </span>
                    }
                  } @else {
                    <span data-slot="service" class="block text-[10px] text-muted-foreground">Nenhum serviço</span>
                  }
                </td>
                <td>
                  <span data-slot="prazo" class="inline-flex items-center gap-[5px]">
                    <ng-icon name="lucideClock3" class="!size-[13px] text-muted-foreground/80" />
                    {{ prazo(order.endDate) }}
                  </span>
                  <span data-slot="docagem" class="mt-[5px] block text-[9px] text-muted-foreground/80">
                    Docagem em {{ short(order.startDate) }}
                  </span>
                </td>
                <td>
                  <span
                    data-slot="status"
                    class="inline-flex items-center gap-[5px] rounded-full px-2 py-[5px] text-[8px] font-semibold"
                    [class]="tones[order.status]"
                  >
                    <i class="size-[5px] rounded-full bg-current"></i>
                    {{ labels[order.status] }}
                  </span>
                </td>
                <td data-slot="row-actions" class="pr-3 text-right" (click)="$event.stopPropagation()">
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
                        [attr.aria-label]="'Editar ordem ' + code(order.id)"
                        (click)="edited.emit(order)"
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
                        [attr.aria-label]="'Excluir ordem ' + code(order.id)"
                        (click)="deleted.emit(order)"
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
        <div data-slot="empty" class="p-[25px] text-center text-[11px] text-muted-foreground">{{ emptyMessage() }}</div>
      }
    </div>
  `,
})
export class WorkOrderTable {
  canWrite = input.required<boolean>();
  loading = input(true);
  /** The rows of the current page, already sorted and filtered. */
  rows = input<WorkOrderRow[]>([]);
  selected = input<ReadonlySet<string>>(new Set());
  emptyMessage = input('');
  toggled = output<string>();
  toggledAll = output<void>();
  edited = output<WorkOrderRow>();
  deleted = output<WorkOrderRow>();

  private readonly router = inject(Router);

  protected readonly labels = workOrderStatusLabels;
  protected readonly tones = workOrderStatusTones;
  protected readonly code = workOrderCode;
  protected readonly prazo = (iso: string) => prazoLabel(iso);
  protected readonly short = shortDateTime;
  protected readonly more = moreServicesLabel;

  /** A row opens its WorkOrder (AD-102). */
  protected open(order: WorkOrderRow) {
    void this.router.navigate(['/work-orders', order.id]);
  }

  protected readonly allSelected = computed(
    () => this.rows().length > 0 && this.rows().every((row) => this.selected().has(row.id)),
  );
  protected readonly someSelected = computed(
    () => !this.allSelected() && this.rows().some((row) => this.selected().has(row.id)),
  );
}
