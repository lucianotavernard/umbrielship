import { Component, input, output } from '@angular/core';

import { Badge } from '../../../shared/components/ui/badge';
import { Button } from '../../../shared/components/ui/button';
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
import { roleLabels } from '../../user/user.service';
import { Invitation, invitationStatusLabels } from '../invitation.service';

@Component({
  selector: 'invitation-list-ui',
  imports: [Badge, Button, Icon, Table, TableHeader, TableHead, TableRow, TableBody, TableCell, Skeleton],
  template: `
    <div class="overflow-hidden rounded-lg border">
      <div class="relative w-full overflow-x-auto">
        <table tTable>
          <thead tTableHeader>
            <tr tTableRow>
              <th tTableHead>Usuário</th>
              <th tTableHead>Papel</th>
              <th tTableHead>Status</th>
              <th tTableHead><span class="sr-only">Ações</span></th>
            </tr>
          </thead>
          <tbody tTableBody>
            @if (loading()) {
              @for (row of [1, 2, 3]; track row) {
                <tr tTableRow>
                  <td tTableCell><t-skeleton class="h-4 w-52 rounded" /></td>
                  <td tTableCell><t-skeleton class="h-5 w-24 rounded-full" /></td>
                  <td tTableCell><t-skeleton class="h-5 w-20 rounded-full" /></td>
                  <td tTableCell>
                    <div class="flex justify-end"><t-skeleton class="h-8 w-24 rounded-md" /></div>
                  </td>
                </tr>
              }
            } @else {
              @for (invitation of invitations(); track invitation.id) {
                <tr tTableRow>
                  <td tTableCell>
                    <div class="flex items-center gap-2">
                      <div class="flex shrink-0 rounded-md bg-muted p-1.5">
                        <svg tIcon name="mail" class="size-3" />
                      </div>
                      <span class="text-sm">{{ invitation.email }}</span>
                    </div>
                  </td>
                  <td tTableCell>
                    <t-badge variant="outline">{{ roleLabels[invitation.role] }}</t-badge>
                  </td>
                  <td tTableCell>
                    <t-badge variant="secondary">{{ invitationStatusLabels[invitation.status] }}</t-badge>
                  </td>
                  <td tTableCell>
                    <div class="flex justify-end">
                      <button tButton type="button" variant="outline" size="sm" (click)="resent.emit(invitation)">
                        <svg tIcon name="rotate-ccw" class="size-3.5" />
                        Reenviar
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr tTableRow>
                  <td tTableCell colspan="4">
                    <div class="flex flex-col items-center justify-center px-4 py-12">
                      <div class="mb-2 flex rounded-full bg-muted p-3 text-xl">
                        <svg tIcon name="ghost" class="size-6 text-muted-foreground" />
                      </div>
                      <p class="mb-1 text-base font-medium text-muted-foreground">Nenhum convite encontrado</p>
                      <p class="max-w-sm text-center text-sm">Nenhum convite enviado até agora.</p>
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
export class InvitationList {
  loading = input(true);
  invitations = input<Invitation[]>([]);
  resent = output<Invitation>();

  protected readonly roleLabels = roleLabels;
  protected readonly invitationStatusLabels = invitationStatusLabels;
}
