import { httpResource } from '@angular/common/http';
import { Component, computed, effect, inject, signal, untracked, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';

import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideActivity,
  lucideAnchor,
  lucideDownload,
  lucidePlus,
  lucideSearch,
  lucideUsers,
} from '@ng-icons/lucide';
import { map, Observable } from 'rxjs';

import { AuthenticationService } from '../../../identity/authentication/authentication.service';
import { apiErrorMessage } from '../../../shared/components/lib/api-error-message';
import { downloadCsv } from '../../../shared/components/lib/csv';
import { clampPage, pageOf } from '../../../shared/components/lib/paging';
import { resourceValue } from '../../../shared/components/lib/resource-value';
import { Button } from '../../../shared/components/ui/button';
import { Confirmation } from '../../../shared/components/ui/confirmation';
import { ListPager } from '../../../shared/components/ui/list-pager';
import { Metric } from '../../../shared/components/ui/metric';
import { Sheet } from '../../../shared/components/ui/sheet';
import { Skeleton } from '../../../shared/components/ui/skeleton';
import { toast } from '../../../shared/components/ui/toaster';
import { GetWorkOrdersResponse } from '../../../work-order/work-order/work-order.service';
import { StaffForm } from '../components/staff-form';
import { StaffTable } from '../components/staff-table';
import { TeamForm } from '../components/team-form';
import { TeamRow, TeamTable } from '../components/team-table';
import { staffCsv } from '../staff-csv';
import {
  ALL_TEAMS,
  filterStaff,
  NO_TEAM,
  NO_TEAM_FILTER,
  sortStaff,
  specialtyChips,
  staffMetrics,
  StaffRow,
} from '../staff-filters';
import { servicesInProgress, staffStatus, teamStatus } from '../staff-status';
import {
  GetAssignmentsResponse,
  GetStaffListResponse,
  GetTeamsResponse,
  StaffRequest,
  StaffService,
  TeamRequest,
} from '../staff.service';

type Tab = 'profissionais' | 'equipes';

/** The mareos "Equipe técnica" (AD-066) with the tab "Equipes" (AD-074). */
@Component({
  selector: 'staff-list',
  imports: [NgIcon, Button, Confirmation, ListPager, Metric, Sheet, Skeleton, StaffForm, StaffTable, TeamForm, TeamTable],
  viewProviders: [
    provideIcons({
      lucideActivity,
      lucideAnchor,
      lucideDownload,
      lucidePlus,
      lucideSearch,
      lucideUsers,
    }),
  ],
  templateUrl: './staff-list.html',
})
export class StaffList {
  /** Staff and Teams are written by an administrator only (AD-061). */
  protected readonly canWrite = inject(AuthenticationService).isAdministrator;
  private readonly staffService = inject(StaffService);
  private readonly router = inject(Router);
  private readonly staffForm = viewChild(StaffForm);
  private readonly teamForm = viewChild(TeamForm);

  staffResource = httpResource<GetStaffListResponse>(() => '/api/staff');
  teamResource = httpResource<GetTeamsResponse>(() => '/api/teams');
  assignmentResource = httpResource<GetAssignmentsResponse>(() => '/api/assignments');
  workOrderResource = httpResource<GetWorkOrdersResponse>(() => '/api/work-orders');

  /** The tab survives a reload as `?tab=equipes`. */
  tab = toSignal(
    inject(ActivatedRoute).queryParamMap.pipe(
      map((params): Tab => (params.get('tab') === 'equipes' ? 'equipes' : 'profissionais')),
    ),
    { initialValue: 'profissionais' as Tab },
  );

  search = signal('');
  team = signal(ALL_TEAMS);
  specialty = signal<string | null>(null);
  selected = signal<ReadonlySet<string>>(new Set());
  submitting = signal(false);
  confirming = signal(false);
  isStaffSheetActive = signal(false);
  isTeamSheetActive = signal(false);
  editingStaffId = signal<string | null>(null);
  editingTeamId = signal<string | null>(null);
  deletingStaff = signal<StaffRow | null>(null);
  deletingTeam = signal<TeamRow | null>(null);

  protected readonly noTeam = NO_TEAM;
  protected readonly noTeamFilter = NO_TEAM_FILTER;

  loading = computed(
    () =>
      this.staffResource.isLoading() ||
      this.teamResource.isLoading() ||
      this.assignmentResource.isLoading() ||
      this.workOrderResource.isLoading(),
  );

  teams = computed(() => resourceValue(this.teamResource)?.teams ?? []);
  private readonly assignments = computed(() => resourceValue(this.assignmentResource)?.assignments ?? []);
  private readonly inProgress = computed(() =>
    servicesInProgress(resourceValue(this.workOrderResource)?.workOrders ?? []),
  );

  rows = computed<StaffRow[]>(() => {
    const teamNames = new Map(this.teams().map((team) => [team.id, team.name]));
    return sortStaff(
      (resourceValue(this.staffResource)?.staff ?? []).map((staff) => ({
        ...staff,
        teamName: (staff.teamId && teamNames.get(staff.teamId)) || NO_TEAM,
        status: staffStatus(staff, this.assignments(), this.inProgress()),
      })),
    );
  });

  teamRows = computed<TeamRow[]>(() =>
    this.sortedTeams().map((team) => ({
      ...team,
      status: teamStatus(team.id, this.assignments(), this.inProgress()),
    })),
  );

  metrics = computed(() => staffMetrics(this.rows(), this.teams().length));
  /** The specialties of "Filtrar por especialidade", in `pt-BR` order (AD-105). */
  specialties = computed(() => specialtyChips(this.rows()).map((chip) => chip.specialty));
  /** The professionals the filters keep, every page included. */
  filtered = computed(() => filterStaff(this.rows(), this.team(), this.specialty(), this.search()));
  page = signal(1);
  teamPage = signal(1);
  /** The pages shown, 10 at a time (AD-101). */
  currentPage = computed(() => clampPage(this.page(), this.filtered().length));
  shown = computed(() => pageOf(this.filtered(), this.currentPage()));
  teamCurrentPage = computed(() => clampPage(this.teamPage(), this.teamRows().length));
  teamShown = computed(() => pageOf(this.teamRows(), this.teamCurrentPage()));
  sortedTeams = computed(() => [...this.teams()].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')));

  selectedCount = computed(() => this.selected().size);
  exportLabel = computed(() => {
    const count = this.selectedCount();
    if (count === 0) return 'Selecione profissionais para exportar';
    if (count === 1) return 'Exportar 1 profissional selecionado em CSV';
    return `Exportar ${count} profissionais selecionados em CSV`;
  });

  /** "Os 3 profissionais desta equipe ficarão sem equipe." when the Team has Staff. */
  deleteTeamDescription = computed(() => {
    const base = 'Tem certeza que deseja excluir esta equipe? Esta ação não pode ser desfeita.';
    const count = this.deletingTeam()?.staffCount ?? 0;
    if (count === 0) return base;
    if (count === 1) return `${base} O 1 profissional desta equipe ficará sem equipe.`;
    return `${base} Os ${count} profissionais desta equipe ficarão sem equipe.`;
  });

  constructor() {
    // A new search or filter starts on page 1.
    effect(() => {
      this.search();
      this.team();
      this.specialty();
      untracked(() => this.page.set(1));
    });

    effect(() => {
      for (const resource of [this.staffResource, this.teamResource, this.assignmentResource, this.workOrderResource]) {
        const error = resource.error();
        if (!error) continue;
        // The toaster keeps its toasts in a signal: reading it here would re-run this effect forever.
        untracked(() =>
          toast.error('Erro ao carregar a equipe técnica', {
            description: apiErrorMessage(error as { error?: unknown }, 'Não foi possível carregar a equipe técnica.'),
          }),
        );
      }
    });
  }

  goTo(page: number) {
    this.page.set(clampPage(page, this.filtered().length));
  }

  goToTeams(page: number) {
    this.teamPage.set(clampPage(page, this.teamRows().length));
  }

  pickTab(tab: Tab) {
    void this.router.navigate([], { queryParams: { tab: tab === 'equipes' ? 'equipes' : null } });
  }

  toggle(id: string) {
    this.selected.update((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  /** Selects the rows of the page, or clears them when they are all selected already. */
  toggleShown() {
    const shown = this.shown().map((row) => row.id);
    this.selected.update((current) => {
      const next = new Set(current);
      const all = shown.length > 0 && shown.every((id) => next.has(id));
      for (const id of shown) {
        if (all) next.delete(id);
        else next.add(id);
      }
      return next;
    });
  }

  exportSelected() {
    const selected = this.selected();
    const rows = this.rows().filter((row) => selected.has(row.id));
    if (!rows.length) return;
    downloadCsv('equipe-tecnica.csv', staffCsv(rows));
  }

  openCreateStaff() {
    this.editingStaffId.set(null);
    this.staffForm()?.reset();
    this.isStaffSheetActive.set(true);
  }

  openEditStaff(row: StaffRow) {
    this.editingStaffId.set(row.id);
    this.staffForm()?.load(row);
    this.isStaffSheetActive.set(true);
  }

  saveStaff(request: StaffRequest) {
    const id = this.editingStaffId();
    this.submitting.set(true);
    const call: Observable<unknown> = id
      ? this.staffService.updateStaff(id, request)
      : this.staffService.createStaff(request);

    call.subscribe({
      next: () => {
        if (id) {
          toast.success('Profissional atualizado com sucesso');
        } else {
          toast.success(`${request.name} foi adicionado à equipe técnica.`);
          // The new professional shows whatever was filtered before, as the mareos does.
          this.search.set('');
          this.team.set(ALL_TEAMS);
          this.specialty.set(null);
        }
        this.submitting.set(false);
        this.isStaffSheetActive.set(false);
        this.editingStaffId.set(null);
        this.staffResource.reload();
        this.teamResource.reload();
      },
      error: (response) => {
        // The drawer stays open with what was typed.
        toast.error(id ? 'Erro ao atualizar profissional' : 'Erro ao cadastrar profissional', {
          description: apiErrorMessage(response, 'Não foi possível salvar o profissional.'),
        });
        this.submitting.set(false);
      },
    });
  }

  deleteStaff() {
    const row = this.deletingStaff();
    if (!row) return;
    this.confirming.set(true);
    this.staffService.deleteStaff(row.id).subscribe({
      next: () => {
        this.confirming.set(false);
        this.deletingStaff.set(null);
        this.selected.update((current) => {
          const next = new Set(current);
          next.delete(row.id);
          return next;
        });
        toast.success('Profissional excluído com sucesso');
        this.staffResource.reload();
        this.teamResource.reload();
      },
      error: (response) => {
        this.confirming.set(false);
        this.deletingStaff.set(null);
        toast.error('Erro ao excluir profissional', {
          description: apiErrorMessage(response, 'Não foi possível excluir o profissional.'),
        });
      },
    });
  }

  openCreateTeam() {
    this.editingTeamId.set(null);
    this.teamForm()?.reset();
    this.isTeamSheetActive.set(true);
  }

  openEditTeam(row: TeamRow) {
    this.editingTeamId.set(row.id);
    this.teamForm()?.load(row);
    this.isTeamSheetActive.set(true);
  }

  saveTeam(request: TeamRequest) {
    const id = this.editingTeamId();
    this.submitting.set(true);
    const call: Observable<unknown> = id
      ? this.staffService.updateTeam(id, request)
      : this.staffService.createTeam(request);

    call.subscribe({
      next: () => {
        toast.success(id ? 'Equipe atualizada com sucesso' : 'Equipe criada com sucesso');
        this.submitting.set(false);
        this.isTeamSheetActive.set(false);
        this.editingTeamId.set(null);
        this.teamResource.reload();
      },
      error: (response) => {
        toast.error(id ? 'Erro ao atualizar equipe' : 'Erro ao criar equipe', {
          description: apiErrorMessage(response, 'Não foi possível salvar a equipe.'),
        });
        this.submitting.set(false);
      },
    });
  }

  deleteTeam() {
    const row = this.deletingTeam();
    if (!row) return;
    this.confirming.set(true);
    this.staffService.deleteTeam(row.id).subscribe({
      next: () => {
        this.confirming.set(false);
        this.deletingTeam.set(null);
        toast.success('Equipe excluída com sucesso');
        this.teamResource.reload();
        this.staffResource.reload();
      },
      error: (response) => {
        this.confirming.set(false);
        this.deletingTeam.set(null);
        toast.error('Erro ao excluir equipe', {
          description: apiErrorMessage(response, 'Não foi possível excluir a equipe.'),
        });
      },
    });
  }
}
