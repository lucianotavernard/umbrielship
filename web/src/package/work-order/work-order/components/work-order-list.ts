import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

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
  imports: [DatePipe, RouterLink, Table, TableHeader, TableHead, TableRow, TableBody, TableCell, Skeleton],
  template: `
    <div class="overflow-hidden rounded-lg border">
      <table tTable>
        <thead tTableHeader>
          <tr tTableRow>
            <th tTableHead>Ordem</th>
            <th tTableHead>Docagem</th>
            <th tTableHead>Desdocagem</th>
            <th tTableHead>Status</th>
          </tr>
        </thead>
        <tbody tTableBody>
          @if (loading()) {
            @for (row of [1, 2, 3]; track row) {
              <tr tTableRow>
                <td tTableCell><t-skeleton class="h-4 w-24 rounded" /></td>
                <td tTableCell><t-skeleton class="h-4 w-32 rounded" /></td>
                <td tTableCell><t-skeleton class="h-4 w-32 rounded" /></td>
                <td tTableCell><t-skeleton class="h-4 w-20 rounded" /></td>
              </tr>
            }
          } @else {
            @for (workOrder of workOrders(); track workOrder.id) {
              <tr tTableRow>
                <td tTableCell>
                  <a [routerLink]="['/work-orders', workOrder.id]">#{{ workOrder.id.slice(0, 8).toUpperCase() }}</a>
                </td>
                <td tTableCell>{{ workOrder.startDate | date: 'longDate' }}</td>
                <td tTableCell>{{ workOrder.endDate | date: 'longDate' }}</td>
                <td tTableCell>{{ labels[workOrder.status] }}</td>
              </tr>
            } @empty {
              <tr tTableRow>
                <td tTableCell colspan="4">
                  <p class="py-12 text-center text-base font-medium text-muted-foreground">
                    Nenhuma ordem de serviço
                  </p>
                </td>
              </tr>
            }
          }
        </tbody>
      </table>
    </div>
  `,
})
export class WorkOrderList {
  loading = input(true);
  workOrders = input<WorkOrder[]>([]);
  protected readonly labels = workOrderStatusLabels;
}
