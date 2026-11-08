import { Component, input } from '@angular/core';

import { Skeleton } from '../../../shared/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../shared/components/ui/table';
import { roleLabels, User } from '../user.service';

@Component({
  selector: 'user-list-ui',
  imports: [Table, TableHeader, TableHead, TableRow, TableBody, TableCell, Skeleton],
  template: `
    <div class="overflow-hidden rounded-lg border">
      <table tTable>
        <thead tTableHeader>
          <tr tTableRow>
            <th tTableHead>Nome</th>
            <th tTableHead>E-mail</th>
            <th tTableHead>Papel</th>
          </tr>
        </thead>
        <tbody tTableBody>
          @if (loading()) {
            @for (row of [1, 2, 3]; track row) {
              <tr tTableRow>
                <td tTableCell><t-skeleton class="h-4 w-32 rounded" /></td>
                <td tTableCell><t-skeleton class="h-4 w-40 rounded" /></td>
                <td tTableCell><t-skeleton class="h-4 w-24 rounded" /></td>
              </tr>
            }
          } @else {
            @for (user of users(); track user.id) {
              <tr tTableRow>
                <td tTableCell>{{ user.name }}</td>
                <td tTableCell>{{ user.email }}</td>
                <td tTableCell>{{ roleLabels[user.role] }}</td>
              </tr>
            } @empty {
              <tr tTableRow>
                <td tTableCell colspan="3">
                  <p class="py-8 text-center text-muted-foreground">Nenhum usuário encontrado</p>
                </td>
              </tr>
            }
          }
        </tbody>
      </table>
    </div>
  `,
})
export class UserList {
  loading = input(true);
  users = input<User[]>([]);
  protected readonly roleLabels = roleLabels;
}
