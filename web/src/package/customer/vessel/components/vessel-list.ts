import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideFlag, lucideGhost, lucideRuler, lucideShipWheel, lucideTrash } from '@ng-icons/lucide';

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
import { Vessel, vesselTypeLabels } from '../vessel.service';

@Component({
  selector: 'vessel-list-ui',
  imports: [
    NgIcon,
    RouterLink,
    Table,
    TableHeader,
    TableHead,
    TableRow,
    TableBody,
    TableCell,
    Skeleton,
    Button,
  ],
  viewProviders: [
    provideIcons({ lucideFlag, lucideShipWheel, lucideRuler, lucideTrash, lucideGhost }),
  ],
  template: `
    <div class="overflow-hidden rounded-lg border">
      <div class="relative w-full overflow-x-auto">
        <table tTable>
          <thead tTableHeader>
            <tr tTableRow>
              <th tTableHead>Embarcação</th>
              <th tTableHead>Tipo</th>
              <th tTableHead>Comprimento</th>
              <th tTableHead><span class="sr-only">Opções</span></th>
            </tr>
          </thead>
          <tbody tTableBody>
            @if (loading()) {
              @for (row of [1, 2, 3]; track row) {
                <tr tTableRow>
                  <td tTableCell>
                    <div class="flex w-fit items-center gap-3">
                      <t-skeleton class="size-10 shrink-0" />
                      <div class="grid gap-2">
                        <t-skeleton class="h-4 w-50 rounded" />
                        <t-skeleton class="h-4 w-40 rounded" />
                      </div>
                    </div>
                  </td>
                  <td tTableCell><t-skeleton class="h-4 w-52 rounded" /></td>
                  <td tTableCell><t-skeleton class="h-4 w-52 rounded" /></td>
                  <td tTableCell>
                    <div class="flex justify-center"><t-skeleton class="size-8 rounded-md" /></div>
                  </td>
                </tr>
              }
            } @else {
              @for (vessel of vessels(); track vessel.id) {
                <tr tTableRow class="group cursor-pointer">
                  <td tTableCell [routerLink]="['/vessels', vessel.id]">
                    <div class="flex items-center gap-2">
                      <div class="flex shrink-0 rounded-md bg-muted p-1.5">
                        <ng-icon name="lucideFlag" class="size-3" />
                      </div>
                      <a class="text-sm font-medium">{{ vessel.name }}</a>
                    </div>
                  </td>
                  <td tTableCell [routerLink]="['/vessels', vessel.id]">
                    <div class="flex items-center gap-2">
                      <div class="flex shrink-0 rounded-md bg-muted p-1.5">
                        <ng-icon name="lucideShipWheel" class="size-3" />
                      </div>
                      <span class="truncate text-sm">{{ vesselTypeLabels[vessel.type] }}</span>
                    </div>
                  </td>
                  <td tTableCell [routerLink]="['/vessels', vessel.id]">
                    <div class="flex items-center gap-2">
                      <div class="flex shrink-0 rounded-md bg-muted p-1.5">
                        <ng-icon name="lucideRuler" class="size-3" />
                      </div>
                      <span class="truncate text-sm">
                        {{ vessel.length }} {{ vessel.length === 1 ? 'metro' : 'metros' }}
                      </span>
                    </div>
                  </td>
                  <td tTableCell>
                    <div
                      class="flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                    >
                      @if (canWrite()) {
                      <button
                        tButton
                        type="button"
                        aria-label="Excluir"
                        title="Deletar embarcação"
                        size="icon"
                        variant="ghost"
                        class="cursor-pointer text-gray-400 hover:bg-red-50 hover:text-red-500"
                        (click)="deleted.emit(vessel)"
                      >
                        <ng-icon name="lucideTrash" class="size-3.5" />
                      </button>
                      }
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr tTableRow>
                  <td tTableCell colspan="4">
                    <div class="flex flex-col items-center justify-center px-4 py-12">
                      <div class="mb-2 flex rounded-full bg-muted p-3 text-xl">
                        <ng-icon name="lucideGhost" class="size-6 text-muted-foreground" />
                      </div>
                      <p class="mb-1 text-base font-medium text-muted-foreground">
                        Nenhuma embarcação encontrada
                      </p>
                      <p class="max-w-sm text-center text-sm">
                        Nenhuma embarcação registrada encontrada.
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
export class VesselList {
  canWrite = input.required<boolean>();
  loading = input(true);
  vessels = input<Vessel[]>([]);

  deleted = output<Vessel>();

  protected readonly vesselTypeLabels = vesselTypeLabels;
}
