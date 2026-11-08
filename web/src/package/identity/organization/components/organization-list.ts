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
import { Organization } from '../organization.service';

@Component({
  selector: 'organization-list-ui',
  imports: [RouterLink, Table, TableHeader, TableHead, TableRow, TableBody, TableCell, Skeleton],
  template: `
    <div class="overflow-hidden rounded-lg border">
      <table tTable>
        <thead tTableHeader>
          <tr tTableRow>
            <th tTableHead>Organização</th>
            <th tTableHead>E-mail</th>
          </tr>
        </thead>
        <tbody tTableBody>
          @if (loading()) {
            @for (row of [1, 2, 3]; track row) {
              <tr tTableRow>
                <td tTableCell><t-skeleton class="h-4 w-40 rounded" /></td>
                <td tTableCell><t-skeleton class="h-4 w-40 rounded" /></td>
              </tr>
            }
          } @else {
            @for (organization of organizations(); track organization.id) {
              <tr tTableRow>
                <td tTableCell>
                  <a [routerLink]="['/organizations', organization.id]">{{ organization.name }}</a>
                </td>
                <td tTableCell>{{ organization.email }}</td>
              </tr>
            } @empty {
              <tr tTableRow>
                <td tTableCell colspan="2">
                  <p class="py-12 text-center text-base font-medium text-muted-foreground">
                    Nenhuma organização encontrada
                  </p>
                </td>
              </tr>
            }
          }
        </tbody>
      </table>
    </div>
    <div class="mt-4">
      <ng-content select="t-pagination" />
    </div>
  `,
})
export class OrganizationList {
  loading = input(true);
  organizations = input<Organization[]>([]);
}
