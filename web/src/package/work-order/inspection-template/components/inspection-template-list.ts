import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideClipboardList, lucideGhost } from '@ng-icons/lucide';

import { Skeleton } from '../../../shared/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../shared/components/ui/table';
import { InspectionTemplateSummary } from '../inspection-template.service';

@Component({
  selector: 'inspection-template-list-ui',
  imports: [NgIcon, RouterLink, Table, TableHeader, TableHead, TableRow, TableBody, TableCell, Skeleton],
  viewProviders: [provideIcons({ lucideClipboardList, lucideGhost })],
  template: `
    <div class="overflow-hidden rounded-lg border">
      <div class="relative w-full overflow-x-auto">
        <table tTable>
          <thead tTableHeader>
            <tr tTableRow>
              <th tTableHead>Nome</th>
              <th tTableHead class="w-28 text-right">Perguntas</th>
            </tr>
          </thead>
          <tbody tTableBody>
            @if (loading()) {
              @for (row of [1, 2, 3]; track row) {
                <tr tTableRow>
                  <td tTableCell><t-skeleton class="h-4 w-48 rounded" /></td>
                  <td tTableCell><t-skeleton class="ml-auto h-4 w-8 rounded" /></td>
                </tr>
              }
            } @else {
              @for (template of inspectionTemplates(); track template.id) {
                <tr tTableRow class="cursor-pointer" [routerLink]="['/inspection-templates', template.id]">
                  <td tTableCell>
                    <div class="flex min-w-0 items-center gap-2">
                      <div class="flex shrink-0 rounded-md bg-muted p-1.5">
                        <ng-icon name="lucideClipboardList" class="size-3" />
                      </div>
                      <a
                        class="min-w-0 text-sm font-medium break-words whitespace-normal"
                        [routerLink]="['/inspection-templates', template.id]"
                      >
                        {{ template.name }}
                      </a>
                    </div>
                  </td>
                  <td tTableCell class="text-right text-sm tabular-nums">{{ template.itemCount }}</td>
                </tr>
              } @empty {
                <tr tTableRow>
                  <td tTableCell colspan="2">
                    <div class="flex flex-col items-center justify-center px-4 py-12">
                      <div class="mb-2 flex rounded-full bg-muted p-3 text-xl">
                        <ng-icon name="lucideGhost" class="size-6 text-muted-foreground" />
                      </div>
                      <p class="mb-1 text-base font-medium text-muted-foreground">
                        Nenhum modelo de inspeção encontrado
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
export class InspectionTemplateList {
  loading = input(true);
  inspectionTemplates = input<InspectionTemplateSummary[]>([]);
}
