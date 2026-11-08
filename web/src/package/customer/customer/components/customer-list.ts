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
import { Customer } from '../customer.service';

@Component({
  selector: 'customer-list-ui',
  imports: [RouterLink, Table, TableHeader, TableHead, TableRow, TableBody, TableCell, Skeleton],
  template: `
    <div class="overflow-hidden rounded-lg border">
      <div class="relative w-full overflow-x-auto">
        <table tTable>
          <thead tTableHeader>
            <tr tTableRow>
              <th tTableHead>Name</th>
              <th tTableHead>E-mail</th>
              <th tTableHead>Endereço</th>
            </tr>
          </thead>
          <tbody tTableBody>
            @if (loading()) {
              @for (row of [1, 2, 3]; track row) {
                <tr tTableRow>
                  <td tTableCell><t-skeleton class="h-4 w-40 rounded" /></td>
                  <td tTableCell><t-skeleton class="h-4 w-40 rounded" /></td>
                  <td tTableCell><t-skeleton class="h-4 w-40 rounded" /></td>
                </tr>
              }
            } @else {
              @for (customer of customers(); track customer.id) {
                <tr tTableRow>
                  <td tTableCell>
                    <a class="font-medium" [routerLink]="['/customers', customer.id]">{{ customer.name }}</a>
                  </td>
                  <td tTableCell>{{ customer.email }}</td>
                  <td tTableCell>
                    {{ customer.address.address }}, {{ customer.address.city }}
                    @if (customer.address.state) {
                      , {{ customer.address.state }}
                    }
                  </td>
                </tr>
              } @empty {
                <tr tTableRow>
                  <td tTableCell colspan="3">
                    <p class="py-12 text-center text-base font-medium text-muted-foreground">
                      Nenhum cliente encontrado
                    </p>
                    <p class="pb-12 text-center text-sm">Nenhum cliente registrado encontrado.</p>
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
export class CustomerList {
  loading = input(true);
  customers = input<Customer[]>([]);
}
