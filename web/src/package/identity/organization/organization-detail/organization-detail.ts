import { httpResource } from '@angular/common/http';
import { Component, computed, inject, input, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';

import { apiErrorMessage } from '../../../shared/components/lib/api-error-message';
import { resourceValue } from '../../../shared/components/lib/resource-value';
import { Button } from '../../../shared/components/ui/button';
import { Pagination } from '../../../shared/components/ui/pagination';
import { Sheet } from '../../../shared/components/ui/sheet';
import { toast } from '../../../shared/components/ui/toaster';
import { InvitationForm, InvitationFormValue } from '../../invitation/components/invitation-form';
import { InvitationList as InvitationListUI } from '../../invitation/components/invitation-list';
import {
  GetInvitationsResponse,
  Invitation,
  InvitationService,
} from '../../invitation/invitation.service';
import { UserForm, UserFormValue } from '../../user/components/user-form';
import { UserList as UserListUI } from '../../user/components/user-list';
import {
  GetOrganizationRolesResponse,
  GetUserCandidatesResponse,
  GetUsersResponse,
  UserService,
} from '../../user/user.service';
import { GetOrganizationResponse } from '../organization.service';

@Component({
  selector: 'organization-detail',
  imports: [
    RouterLink,
    Button,
    Pagination,
    Sheet,
    UserForm,
    UserListUI,
    InvitationForm,
    InvitationListUI,
  ],
  templateUrl: './organization-detail.html',
})
export class OrganizationDetail {
  private readonly userService = inject(UserService);
  private readonly invitationService = inject(InvitationService);
  private readonly userForm = viewChild(UserForm);
  private readonly invitationForm = viewChild(InvitationForm);

  id = input.required<string>();

  private readonly organizationResource = httpResource<GetOrganizationResponse>(
    () => `/api/organizations/${this.id()}`,
  );
  private readonly userResource = httpResource<GetUsersResponse>(
    () => `/api/organizations/${this.id()}/users?page=${this.usersPage()}&per_page=${this.perPage}`,
  );
  private readonly roleResource = httpResource<GetOrganizationRolesResponse>(
    () => `/api/organizations/${this.id()}/roles`,
  );
  private readonly invitationResource = httpResource<GetInvitationsResponse>(
    () => `/api/organizations/${this.id()}/invitations?page=${this.invitationsPage()}&per_page=${this.perPage}`,
  );
  private readonly candidateResource = httpResource<GetUserCandidatesResponse>(
    () => `/api/users?not_in_organization=${this.id()}&per_page=100`,
  );

  readonly perPage = 20;

  usersPage = signal(1);
  invitationsPage = signal(1);
  isUserSheetActive = signal(false);
  isInvitationSheetActive = signal(false);
  resending = signal<string | null>(null);

  organization = computed(() => resourceValue(this.organizationResource)?.organization ?? null);
  acceptsInvitations = computed(() => this.organization()?.isInternal === false);
  users = computed(() => resourceValue(this.userResource)?.users ?? []);
  usersTotal = computed(() => resourceValue(this.userResource)?.total ?? 0);
  loadingUsers = computed(() => this.userResource.isLoading());
  invitations = computed(() => resourceValue(this.invitationResource)?.invitations ?? []);
  invitationsTotal = computed(() => resourceValue(this.invitationResource)?.total ?? 0);
  loadingInvitations = computed(() => this.invitationResource.isLoading());
  candidates = computed(() => resourceValue(this.candidateResource)?.users ?? []);
  roles = computed(() => resourceValue(this.roleResource)?.roles ?? []);

  openUserSheet() {
    this.userForm()?.reset();
    this.isUserSheetActive.set(true);
  }

  closeUserSheet() {
    this.isUserSheetActive.set(false);
    this.userResource.reload();
    this.roleResource.reload();
  }

  createUser(user: UserFormValue) {
    this.userService.createUser({ ...user, organizationId: this.id() }).subscribe({
      next: () => {
        toast.success('Usuário criado com sucesso');
        this.closeUserSheet();
      },
      error: (response) => {
        toast.error('Erro ao criar usuário', {
          description: apiErrorMessage(response, 'Ocorreu um erro ao criar o usuário.'),
        });
      },
    });
  }

  openInvitationSheet() {
    this.invitationForm()?.reset();
    this.isInvitationSheetActive.set(true);
  }

  closeInvitationSheet() {
    this.isInvitationSheetActive.set(false);
    this.invitationResource.reload();
    this.candidateResource.reload();
  }

  sendInvitation(invitation: InvitationFormValue) {
    this.invitationService
      .sendInvitation({ ...invitation, organizationId: this.id() })
      .subscribe({
        next: () => {
          toast.success('Convite enviado');
          this.closeInvitationSheet();
        },
        error: (response) => {
          toast.error('Erro ao enviar convite', {
            description: apiErrorMessage(response, 'Ocorreu um erro ao enviar o convite.'),
          });
        },
      });
  }

  resendInvitation(invitation: Invitation) {
    this.resending.set(invitation.id);
    this.invitationService.resendInvitation(invitation.id).subscribe({
      next: () => {
        this.resending.set(null);
        toast.success('Convite reenviado');
        this.invitationResource.reload();
      },
      error: (response) => {
        this.resending.set(null);
        toast.error('Erro ao reenviar convite', {
          description: apiErrorMessage(response, 'Ocorreu um erro ao reenviar o convite.'),
        });
      },
    });
  }
}
