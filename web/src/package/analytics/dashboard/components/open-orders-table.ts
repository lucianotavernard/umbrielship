import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideClock3, lucideEllipsis, lucideEye, lucidePencil, lucideShip, lucideTrash2 } from '@ng-icons/lucide';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../shared/components/ui/dropdown-menu';
import { Skeleton } from '../../../shared/components/ui/skeleton';
import { moreServicesLabel, prazoLabel, WorkOrderRow } from '../../../work-order/work-order/work-order-filters';
import {
  workOrderCode,
  workOrderStatusLabels,
  workOrderStatusTones,
} from '../../../work-order/work-order/work-order.service';
import { Responsavel } from '../dashboard-summary';

/** The mareos "Ordens de serviço" table of "Visão geral", "EQUIPE" read as "RESPONSÁVEL" (AD-086). */
@Component({
  selector: 'open-orders-table-ui',
  imports: [NgIcon, RouterLink, Skeleton, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem],
  viewProviders: [provideIcons({ lucideClock3, lucideEllipsis, lucideEye, lucidePencil, lucideShip, lucideTrash2 })],
  template: `
    <div class="relative w-full overflow-x-auto">
      <table class="w-full min-w-[720px] border-collapse text-left whitespace-nowrap">
        <thead class="h-[35px]">
          <tr class="text-[8px] font-bold tracking-[0.65px] text-muted-foreground">
            <th class="pl-px font-bold">EMBARCAÇÃO</th>
            <th class="font-bold">SERVIÇO</th>
            <th class="font-bold">RESPONSÁVEL</th>
            <th class="font-bold">PRAZO</th>
            <th class="font-bold">STATUS</th>
            <th><span class="sr-only">Ações</span></th>
          </tr>
        </thead>
        <tbody>
          @if (loading()) {
            @for (row of [1, 2, 3, 4, 5]; track row) {
              <tr data-slot="skeleton-row" class="h-[51px] border-t border-border">
                <td class="pl-px">
                  <div class="flex items-center gap-[9px]">
                    <t-skeleton class="size-[30px] rounded-[7px]" />
                    <t-skeleton class="h-3 w-28 rounded" />
                  </div>
                </td>
                <td><t-skeleton class="h-3 w-32 rounded" /></td>
                <td><t-skeleton class="h-3 w-24 rounded" /></td>
                <td><t-skeleton class="h-3 w-20 rounded" /></td>
                <td><t-skeleton class="h-5 w-20 rounded-full" /></td>
                <td></td>
              </tr>
            }
          } @else {
            @for (order of rows(); track order.id) {
              <tr data-slot="work-order-row" class="h-[51px] border-t border-border text-[10px] text-muted-foreground">
                <td class="pl-px">
                  <div class="flex min-w-[170px] items-center gap-[9px]">
                    <span
                      aria-hidden="true"
                      class="grid size-[30px] shrink-0 place-items-center rounded-[7px] bg-[#e9f3f3] text-[#4b9295] dark:bg-[#17302f] dark:text-[#7cc7c2]"
                    >
                      <ng-icon name="lucideShip" class="!size-4" />
                    </span>
                    <div>
                      <a
                        data-slot="vessel"
                        class="block text-[10px] font-semibold text-foreground hover:text-primary hover:underline"
                        [routerLink]="['/work-orders', order.id]"
                      >
                        {{ order.vesselName }}
                      </a>
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
                  @if (responsaveis().get(order.id); as responsavel) {
                    <span data-slot="responsavel" class="inline-flex items-center gap-1.5 text-foreground/80">
                      <span
                        data-slot="responsavel-initials"
                        aria-hidden="true"
                        class="grid size-5 place-items-center rounded-full bg-[#edf3f4] text-[7px] font-bold text-[#57827f] dark:bg-[#1b343a] dark:text-[#78d1c8]"
                      >
                        {{ responsavel.initials }}
                      </span>
                      <span data-slot="responsavel-name">{{ responsavel.name }}</span>
                    </span>
                  } @else {
                    <span data-slot="responsavel" class="text-muted-foreground">Sem responsável</span>
                  }
                </td>
                <td>
                  <span data-slot="prazo" class="inline-flex items-center gap-[5px]">
                    <ng-icon name="lucideClock3" class="!size-[13px] text-muted-foreground/80" />
                    {{ prazo(order.endDate) }}
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
                <td class="pr-[3px] text-right">
                  <t-dropdown-menu>
                    <button
                      tDropdownMenuTrigger
                      type="button"
                      class="inline-grid size-[27px] place-items-center rounded-[5px] text-muted-foreground hover:bg-muted hover:text-foreground"
                      [attr.aria-label]="'Ações para ' + code(order.id)"
                    >
                      <ng-icon name="lucideEllipsis" class="!size-[17px]" />
                    </button>
                    <t-dropdown-menu-content align="end" class="w-40">
                      <a tDropdownMenuItem [routerLink]="['/work-orders', order.id]">
                        <ng-icon name="lucideEye" />
                        Ver detalhes
                      </a>
                      @if (canWrite()) {
                        <button tDropdownMenuItem type="button" (click)="edited.emit(order)">
                          <ng-icon name="lucidePencil" />
                          Editar
                        </button>
                        <button tDropdownMenuItem type="button" variant="destructive" (click)="deleted.emit(order)">
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
        <div data-slot="empty" class="border-t border-border p-[25px] text-center text-[11px] text-muted-foreground">
          {{ emptyMessage() }}
        </div>
      }
    </div>
  `,
})
export class OpenOrdersTable {
  canWrite = input.required<boolean>();
  loading = input(true);
  /** The rows of the current page, already sorted and filtered. */
  rows = input<WorkOrderRow[]>([]);
  /** The Responsável of each WorkOrder's first service, by WorkOrder id. */
  responsaveis = input<ReadonlyMap<string, Responsavel | null>>(new Map());
  emptyMessage = input('');
  edited = output<WorkOrderRow>();
  deleted = output<WorkOrderRow>();

  protected readonly labels = workOrderStatusLabels;
  protected readonly tones = workOrderStatusTones;
  protected readonly code = workOrderCode;
  protected readonly prazo = (iso: string) => prazoLabel(iso);
  protected readonly more = moreServicesLabel;
}
