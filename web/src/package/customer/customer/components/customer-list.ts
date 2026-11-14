import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBuilding2,
  lucideMail,
  lucideMapPin,
  lucideTrash,
  lucideGhost,
} from '@ng-icons/lucide';

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
import { Customer } from '../customer.service';

@Component({
  selector: 'customer-list-ui',
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
    provideIcons({ lucideBuilding2, lucideMail, lucideMapPin, lucideTrash, lucideGhost }),
  ],
  template: `
    <div class="overflow-hidden rounded-lg border">
      <div class="relative w-full overflow-x-auto">
        <table tTable>
          <thead tTableHeader>
            <tr tTableRow>
              <th tTableHead>Nome</th>
              <th tTableHead>E-mail</th>
              <th tTableHead>Endereço</th>
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
              @for (customer of customers(); track customer.id) {
                <tr tTableRow class="group cursor-pointer">
                  <td tTableCell [routerLink]="['/customers', customer.id]">
                    <div class="flex items-center gap-2">
                      <div class="flex shrink-0 rounded-md bg-muted p-1.5">
                        <ng-icon name="lucideBuilding2" class="size-3" />
                      </div>
                      <a class="text-sm font-medium">{{ customer.name }}</a>
                    </div>
                  </td>
                  <td tTableCell [routerLink]="['/customers', customer.id]">
                    <div class="flex items-center gap-2">
                      <div class="flex shrink-0 rounded-md bg-muted p-1.5">
                        <ng-icon name="lucideMail" class="size-3" />
                      </div>
                      <span class="text-sm">{{ customer.email }}</span>
                    </div>
                  </td>
                  <td tTableCell [routerLink]="['/customers', customer.id]">
                    <div class="flex items-center gap-2">
                      <div class="flex shrink-0 rounded-md bg-muted p-1.5">
                        <ng-icon name="lucideMapPin" class="size-3" />
                      </div>
                      <span class="truncate text-sm">
                        {{ customer.address.address }}, {{ customer.address.city }},
                        {{ customer.address.state }}
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
                        title="Deletar cliente"
                        size="icon"
                        variant="ghost"
                        class="cursor-pointer text-gray-400 hover:bg-red-50 hover:text-red-500"
                        (click)="deleted.emit(customer)"
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
                        Nenhum cliente encontrado
                      </p>
                      <p class="max-w-sm text-center text-sm">
                        Nenhum cliente registrado encontrado.
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
export class CustomerList {
  canWrite = input(true);
  loading = input(true);
  customers = input<Customer[]>([]);

  deleted = output<Customer>();
}
