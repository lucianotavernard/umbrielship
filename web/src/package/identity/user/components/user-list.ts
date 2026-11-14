import { Component, input } from '@angular/core';

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
import { roleLabels, User } from '../user.service';

@Component({
  selector: 'user-list-ui',
  imports: [Badge, Icon, Table, TableHeader, TableHead, TableRow, TableBody, TableCell, Skeleton],
  template: `
    <div class="overflow-hidden rounded-lg border">
      <div class="relative w-full overflow-x-auto">
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
                  <td tTableCell><t-skeleton class="h-5 w-24 rounded-full" /></td>
                </tr>
              }
            } @else {
              @for (user of users(); track user.id) {
                <tr tTableRow>
                  <td tTableCell>
                    <div class="flex items-center gap-2">
                      <div class="flex shrink-0 rounded-md bg-muted p-1.5">
                        <svg tIcon name="user" class="size-3" />
                      </div>
                      <span class="text-sm font-medium">{{ user.name }}</span>
                    </div>
                  </td>
                  <td tTableCell>
                    <div class="flex items-center gap-2">
                      <div class="flex shrink-0 rounded-md bg-muted p-1.5">
                        <svg tIcon name="mail" class="size-3" />
                      </div>
                      <span class="text-sm">{{ user.email }}</span>
                    </div>
                  </td>
                  <td tTableCell>
                    <t-badge variant="secondary">{{ roleLabels[user.role] }}</t-badge>
                  </td>
                </tr>
              } @empty {
                <tr tTableRow>
                  <td tTableCell colspan="3">
                    <div class="flex flex-col items-center justify-center px-4 py-12">
                      <div class="mb-2 flex rounded-full bg-muted p-3 text-xl">
                        <svg tIcon name="ghost" class="size-6 text-muted-foreground" />
                      </div>
                      <p class="mb-1 text-base font-medium text-muted-foreground">Nenhum usuário encontrado</p>
                      <p class="max-w-sm text-center text-sm">Nenhum usuário registrado encontrado.</p>
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
export class UserList {
  loading = input(true);
  users = input<User[]>([]);
  protected readonly roleLabels = roleLabels;
}
