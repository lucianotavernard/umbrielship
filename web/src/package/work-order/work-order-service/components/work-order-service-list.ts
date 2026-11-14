import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';

import { Badge } from '../../../shared/components/ui/badge';
import { buttonVariants } from '../../../shared/components/ui/button';
import { Icon } from '../../../shared/components/ui/icon';
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
  imports: [DatePipe, Badge, Icon, Table, TableHeader, TableHead, TableRow, TableBody, TableCell, Skeleton],
  template: `
    <div class="overflow-hidden rounded-lg border">
      <div class="relative w-full overflow-x-auto">
        <table tTable>
          <thead tTableHeader>
            <tr tTableRow>
              <th tTableHead>Serviço</th>
              <th tTableHead>Início</th>
              <th tTableHead>Fim</th>
              <th tTableHead>Status</th>
              <th tTableHead><span class="sr-only">Foto</span></th>
            </tr>
          </thead>
          <tbody tTableBody>
            @if (loading()) {
              @for (row of [1, 2, 3]; track row) {
                <tr tTableRow>
                  <td tTableCell>
                    <div class="flex items-center gap-2">
                      <t-skeleton class="size-6 rounded" />
                      <t-skeleton class="h-4 w-40 rounded" />
                    </div>
                  </td>
                  <td tTableCell>
                    <div class="flex items-center gap-2">
                      <t-skeleton class="size-6 rounded" />
                      <t-skeleton class="h-4 w-32 rounded" />
                    </div>
                  </td>
                  <td tTableCell>
                    <div class="flex items-center gap-2">
                      <t-skeleton class="size-6 rounded" />
                      <t-skeleton class="h-4 w-32 rounded" />
                    </div>
                  </td>
                  <td tTableCell><t-skeleton class="h-5 w-20 rounded-full" /></td>
                  <td tTableCell>
                    <div class="flex justify-center"><t-skeleton class="size-8 rounded-md" /></div>
                  </td>
                </tr>
              }
            } @else {
              @for (service of services(); track service.id) {
                <tr tTableRow class="group">
                  <td tTableCell>
                    <div class="flex items-center gap-2">
                      <div class="flex shrink-0 rounded-md bg-muted p-1.5">
                        <svg tIcon name="wrench" class="size-3" />
                      </div>
                      <div class="grid">
                        <span class="text-sm font-medium">{{ service.name }}</span>
                        <span class="truncate text-xs text-muted-foreground">{{ service.description }}</span>
                      </div>
                    </div>
                  </td>
                  <td tTableCell>
                    <div class="flex items-center gap-2">
                      <div class="flex shrink-0 rounded-md bg-muted p-1.5">
                        <svg tIcon name="calendar" class="size-3" />
                      </div>
                      <span class="text-sm text-muted-foreground">{{ service.startDate | date: 'short' }}</span>
                    </div>
                  </td>
                  <td tTableCell>
                    <div class="flex items-center gap-2">
                      <div class="flex shrink-0 rounded-md bg-muted p-1.5">
                        <svg tIcon name="calendar" class="size-3" />
                      </div>
                      <span class="text-sm text-muted-foreground">{{ service.endDate | date: 'short' }}</span>
                    </div>
                  </td>
                  <td tTableCell>
                    <t-badge variant="secondary">{{ labels[service.status] }}</t-badge>
                  </td>
                  <td tTableCell>
                    <div class="flex items-center justify-center">
                      @if (canWrite()) {
                      <label [class]="uploadClass" [title]="'Enviar foto de ' + service.name">
                        <svg tIcon name="image" class="size-3.5" />
                        <input
                          type="file"
                          accept="image/*"
                          class="sr-only"
                          [attr.aria-label]="'Enviar foto de ' + service.name"
                          (change)="onFile(service, $event)"
                        />
                      </label>
                      }
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr tTableRow>
                  <td tTableCell colspan="5">
                    <div class="flex flex-col items-center justify-center px-4 py-12">
                      <div class="mb-2 flex rounded-full bg-muted p-3 text-xl">
                        <svg tIcon name="ghost" class="size-6 text-muted-foreground" />
                      </div>
                      <p class="mb-1 text-base font-medium text-muted-foreground">Nenhum serviço executado</p>
                      <p class="max-w-sm text-center text-sm">Não há serviços registrados para esta ordem.</p>
                    </div>
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class WorkOrderServiceList {
  canWrite = input(true);
  loading = input(true);
  services = input<WorkOrderServiceItem[]>([]);
  fileSelected = output<{ serviceId: string; file: File }>();

  protected readonly labels = workOrderServiceStatusLabels;
  protected readonly uploadClass = buttonVariants({
    variant: 'ghost',
    size: 'icon',
    className: 'cursor-pointer text-gray-400 hover:text-foreground focus-within:ring-[3px] focus-within:ring-ring/50',
  });

  onFile(service: WorkOrderServiceItem, event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.fileSelected.emit({ serviceId: service.id, file });
  }
}
