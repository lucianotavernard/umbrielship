import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

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
  imports: [RouterLink, Table, TableHeader, TableHead, TableRow, TableBody, TableCell, Skeleton, Button],
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
                  <td tTableCell><t-skeleton class="h-4 w-40 rounded" /></td>
                  <td tTableCell><t-skeleton class="h-4 w-24 rounded" /></td>
                  <td tTableCell><t-skeleton class="h-4 w-20 rounded" /></td>
                  <td tTableCell></td>
                </tr>
              }
            } @else {
              @for (vessel of vessels(); track vessel.id) {
                <tr tTableRow>
                  <td tTableCell>
                    <a [routerLink]="['/vessels', vessel.id]">{{ vessel.name }}</a>
                  </td>
                  <td tTableCell>{{ vesselTypeLabels[vessel.type] }}</td>
                  <td tTableCell>
                    {{ vessel.length }} {{ vessel.length === 1 ? 'metro' : 'metros' }}
                  </td>
                  <td tTableCell>
                    <button
                      tButton
                      type="button"
                      size="icon"
                      variant="ghost"
                      title="Deletar embarcação"
                      (click)="deleted.emit(vessel)"
                    >
                      Deletar embarcação
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr tTableRow>
                  <td tTableCell colspan="4">
                    <p class="py-12 text-center text-base font-medium text-muted-foreground">
                      Nenhuma embarcação encontrada
                    </p>
                    <p class="pb-12 text-center text-sm">Nenhuma embarcação registrada encontrada.</p>
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
  loading = input(true);
  vessels = input<Vessel[]>([]);
  deleted = output<Vessel>();

  protected readonly vesselTypeLabels = vesselTypeLabels;
}
