import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Badge } from '../../../shared/components/ui/badge';
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
import { Organization } from '../organization.service';

@Component({
  selector: 'organization-list-ui',
  imports: [RouterLink, Badge, Icon, Table, TableHeader, TableHead, TableRow, TableBody, TableCell, Skeleton],
  template: `
    <div class="overflow-hidden rounded-lg border">
      <div class="relative w-full overflow-x-auto">
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
                </tr>
              }
            } @else {
              @for (organization of organizations(); track organization.id) {
                <tr tTableRow class="cursor-pointer">
                  <td tTableCell [routerLink]="['/organizations', organization.id]">
                    <div class="flex items-center gap-2">
                      <div class="flex shrink-0 rounded-md bg-muted p-1.5">
                        <svg tIcon name="building-2" class="size-3" />
                      </div>
                      <a class="text-sm font-medium" [routerLink]="['/organizations', organization.id]">
                        {{ organization.name }}
                      </a>
                      @if (organization.isInternal) {
                        <t-badge variant="secondary">Interna</t-badge>
                      }
                    </div>
                  </td>
                  <td tTableCell [routerLink]="['/organizations', organization.id]">
                    <div class="flex items-center gap-2">
                      <div class="flex shrink-0 rounded-md bg-muted p-1.5">
                        <svg tIcon name="mail" class="size-3" />
                      </div>
                      <span class="text-sm">{{ organization.email }}</span>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr tTableRow>
                  <td tTableCell colspan="2">
                    <div class="flex flex-col items-center justify-center px-4 py-12">
                      <div class="mb-2 flex rounded-full bg-muted p-3 text-xl">
                        <svg tIcon name="ghost" class="size-6 text-muted-foreground" />
                      </div>
                      <p class="mb-1 text-base font-medium text-muted-foreground">Nenhuma organização encontrada</p>
                      <p class="max-w-sm text-center text-sm">Nenhuma organização registrada encontrada.</p>
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
export class OrganizationList {
  loading = input(true);
  organizations = input<Organization[]>([]);
}
