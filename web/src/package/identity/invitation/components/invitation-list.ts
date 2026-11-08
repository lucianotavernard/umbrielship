import { Component, input, output } from '@angular/core';

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
import { roleLabels } from '../../user/user.service';
import { Invitation, invitationStatusLabels } from '../invitation.service';

@Component({
  selector: 'invitation-list-ui',
  imports: [Table, TableHeader, TableHead, TableRow, TableBody, TableCell, Skeleton, Button],
  template: `
    <div class="overflow-hidden rounded-lg border">
      <table tTable>
        <thead tTableHeader>
          <tr tTableRow>
            <th tTableHead>Usuário</th>
            <th tTableHead>Status</th>
            <th tTableHead>Ações</th>
          </tr>
        </thead>
        <tbody tTableBody>
          @if (loading()) {
            @for (row of [1, 2, 3]; track row) {
              <tr tTableRow>
                <td tTableCell><t-skeleton class="h-4 w-40 rounded" /></td>
                <td tTableCell><t-skeleton class="h-4 w-24 rounded" /></td>
                <td tTableCell></td>
              </tr>
            }
          } @else {
            @for (invitation of invitations(); track invitation.id) {
              <tr tTableRow>
                <td tTableCell>{{ invitation.email }}</td>
                <td tTableCell>{{ invitationStatusLabels[invitation.status] }} · {{ roleLabels[invitation.role] }}</td>
                <td tTableCell>
                  <button tButton type="button" variant="outline" (click)="resent.emit(invitation)">
                    Reenviar
                  </button>
                </td>
              </tr>
            } @empty {
              <tr tTableRow>
                <td tTableCell colspan="3">
                  <p class="py-8 text-center text-muted-foreground">Nenhum convite encontrado</p>
                </td>
              </tr>
            }
          }
        </tbody>
      </table>
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
