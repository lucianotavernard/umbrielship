import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideFlag, lucideCalendar, lucideGhost, lucideTrash } from '@ng-icons/lucide';

import { Badge } from '../../../shared/components/ui/badge';
import { Button } from '../../../shared/components/ui/button';
import { Skeleton } from '../../../shared/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../shared/components/ui/table';
import { WorkOrder, workOrderStatusLabels } from '../work-order.service';

@Component({
  selector: 'work-order-list-ui',
  imports: [
    NgIcon,
    DatePipe,
    RouterLink,
    Badge,
    Button,
    Table,
    TableHeader,
    TableHead,
    TableRow,
    TableBody,
    TableCell,
    Skeleton,
  ],
  viewProviders: [provideIcons({ lucideFlag, lucideCalendar, lucideTrash, lucideGhost })],
  template: `
    <div class="overflow-hidden rounded-lg border">
      <div class="relative w-full overflow-x-auto">
        <table tTable>
          <thead tTableHeader>
            <tr tTableRow>
              <th tTableHead>Ordem</th>
              <th tTableHead>Docagem</th>
              <th tTableHead>Desdocagem</th>
              <th tTableHead>Status</th>
              <th tTableHead><span class="sr-only">Opções</span></th>
            </tr>
          </thead>
          <tbody tTableBody>
            @if (loading()) {
              @for (row of [1, 2, 3]; track row) {
                <tr tTableRow>
                  <td tTableCell><t-skeleton class="h-4 w-32 rounded" /></td>
                  <td tTableCell><t-skeleton class="h-4 w-40 rounded" /></td>
                  <td tTableCell><t-skeleton class="h-4 w-40 rounded" /></td>
                  <td tTableCell><t-skeleton class="h-5 w-20 rounded-full" /></td>
                  <td tTableCell>
                    <div class="flex justify-center"><t-skeleton class="size-8 rounded-md" /></div>
                  </td>
                </tr>
              }
            } @else {
              @for (workOrder of workOrders(); track workOrder.id) {
                <tr tTableRow class="group cursor-pointer">
                  <td tTableCell [routerLink]="['/work-orders', workOrder.id]">
                    <div class="flex items-center gap-2">
                      <div class="flex shrink-0 rounded-md bg-muted p-1.5">
                        <ng-icon name="lucideFlag" class="size-3" />
                      </div>
                      <a class="text-sm font-medium" [routerLink]="['/work-orders', workOrder.id]">
                        #{{ workOrder.id.slice(0, 8).toUpperCase() }}
                      </a>
                    </div>
                  </td>
                  <td tTableCell [routerLink]="['/work-orders', workOrder.id]">
                    <div class="flex items-center gap-2">
                      <div class="flex shrink-0 rounded-md bg-muted p-1.5">
                        <ng-icon name="lucideCalendar" class="size-3" />
                      </div>
                      <span class="text-sm text-muted-foreground">
                        {{ workOrder.startDate | date: 'longDate' }}
                      </span>
                    </div>
                  </td>
                  <td tTableCell [routerLink]="['/work-orders', workOrder.id]">
                    <div class="flex items-center gap-2">
                      <div class="flex shrink-0 rounded-md bg-muted p-1.5">
                        <ng-icon name="lucideCalendar" class="size-3" />
                      </div>
                      <span class="text-sm text-muted-foreground">
                        {{ workOrder.endDate | date: 'longDate' }}
                      </span>
                    </div>
                  </td>
                  <td tTableCell [routerLink]="['/work-orders', workOrder.id]">
                    <t-badge variant="secondary">{{ labels[workOrder.status] }}</t-badge>
                  </td>
                  <td tTableCell>
                    <div
                      class="flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                    >
                      <button
                        tButton
                        type="button"
                        aria-label="Excluir"
                        title="Deletar ordem de serviço"
                        size="icon"
                        variant="ghost"
                        class="cursor-pointer text-gray-400 hover:bg-red-50 hover:text-red-500"
                        (click)="deleted.emit(workOrder)"
                      >
                        <ng-icon name="lucideTrash" class="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr tTableRow>
                  <td tTableCell colspan="5">
                    <div class="flex flex-col items-center justify-center px-4 py-12">
                      <div class="mb-2 flex rounded-full bg-muted p-3 text-xl">
                        <ng-icon name="lucideGhost" class="size-6 text-muted-foreground" />
                      </div>
                      <p class="mb-1 text-base font-medium text-muted-foreground">
                        Nenhuma ordem de serviço encontrada
                      </p>
                      <p class="max-w-sm text-center text-sm">
                        Nenhuma ordem de serviço registrada encontrada.
                      </p>
                    </div>
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>
    </div>
    <div class="mt-4">
      <ng-content select="t-pagination" />
    </div>
  `,
})
export class WorkOrderList {
  loading = input(true);
  workOrders = input<WorkOrder[]>([]);
  deleted = output<WorkOrder>();

  protected readonly labels = workOrderStatusLabels;
}