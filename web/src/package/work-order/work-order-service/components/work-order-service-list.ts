import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';

import { Skeleton } from '../../../shared/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../shared/components/ui/table';
import {
  WorkOrderServiceItem,
  workOrderServiceStatusLabels,
} from '../work-order-service.service';

@Component({
  selector: 'work-order-service-list-ui',
  imports: [DatePipe, Table, TableHeader, TableHead, TableRow, TableBody, TableCell, Skeleton],
  template: `
    <div class="overflow-hidden rounded-lg border">
      <table tTable>
        <thead tTableHeader>
          <tr tTableRow>
            <th tTableHead>Serviço</th>
            <th tTableHead>Início</th>
            <th tTableHead>Fim</th>
            <th tTableHead>Status</th>
            <th tTableHead>Foto</th>
          </tr>
        </thead>
        <tbody tTableBody>
          @if (loading()) {
            @for (row of [1, 2, 3]; track row) {
              <tr tTableRow>
                <td tTableCell><t-skeleton class="h-4 w-32 rounded" /></td>
                <td tTableCell><t-skeleton class="h-4 w-24 rounded" /></td>
                <td tTableCell><t-skeleton class="h-4 w-24 rounded" /></td>
                <td tTableCell><t-skeleton class="h-4 w-20 rounded" /></td>
                <td tTableCell></td>
              </tr>
            }
          } @else {
            @for (service of services(); track service.id) {
              <tr tTableRow>
                <td tTableCell>
                  <p class="font-medium">{{ service.name }}</p>
                  <p class="text-sm text-muted-foreground">{{ service.description }}</p>
                </td>
                <td tTableCell>{{ service.startDate | date: 'short' }}</td>
                <td tTableCell>{{ service.endDate | date: 'short' }}</td>
                <td tTableCell>{{ labels[service.status] }}</td>
                <td tTableCell>
                  <input
                    type="file"
                    [attr.aria-label]="'Enviar foto de ' + service.name"
                    (change)="onFile(service, $event)"
                  />
                </td>
              </tr>
            } @empty {
              <tr tTableRow>
                <td tTableCell colspan="5">
                  <p class="py-12 text-center text-base font-medium text-muted-foreground">
                    Nenhum serviço executado
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
export class WorkOrderServiceList {
  loading = input(true);
  services = input<WorkOrderServiceItem[]>([]);
  fileSelected = output<{ serviceId: string; file: File }>();

  protected readonly labels = workOrderServiceStatusLabels;

  onFile(service: WorkOrderServiceItem, event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.fileSelected.emit({ serviceId: service.id, file });
  }
}
