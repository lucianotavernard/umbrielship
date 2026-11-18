import { httpResource } from '@angular/common/http';
import { Component, computed, effect, inject, signal, untracked, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';

import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideAnchor,
  lucideChevronDown,
  lucideChevronLeft,
  lucideChevronRight,
  lucideClipboardList,
  lucideClock3,
  lucideDownload,
  lucideEllipsis,
  lucideMoon,
  lucidePlus,
  lucideSearch,
  lucideSun,
  lucideWrench,
} from '@ng-icons/lucide';
import { Observable } from 'rxjs';

import { GetCustomersResponse } from '../../../customer/customer/customer.service';
import { GetVesselsResponse } from '../../../customer/vessel/vessel.service';
import { AuthenticationService } from '../../../identity/authentication/authentication.service';
import { apiErrorMessage } from '../../../shared/components/lib/api-error-message';
import { downloadCsv } from '../../../shared/components/lib/csv';
import { resourceValue } from '../../../shared/components/lib/resource-value';
import { Button } from '../../../shared/components/ui/button';
import { Confirmation } from '../../../shared/components/ui/confirmation';
import { Sheet } from '../../../shared/components/ui/sheet';
import { Skeleton } from '../../../shared/components/ui/skeleton';
import { toast } from '../../../shared/components/ui/toaster';
import { agendaItems, AgendaKind, agendaKindLabels } from '../../../work-order/agenda/agenda-week';
import {
  WorkOrderForm,
  WorkOrderFormSubmit,
  WorkOrderFormValue,
} from '../../../work-order/work-order/components/work-order-form';
import { workOrdersCsv } from '../../../work-order/work-order/work-order-csv';
import {
  filterWorkOrders,
  pageCount,
  pageOf,
  rangeLabel,
  StatusTab,
  WorkOrderRow,
} from '../../../work-order/work-order/work-order-filters';
import { GetWorkOrdersResponse, WorkOrderService } from '../../../work-order/work-order/work-order.service';
import { assigneeGroups, assigneeKeyOf } from '../../../workforce/staff/assignee';
import { servicesInProgress } from '../../../workforce/staff/staff-status';
import { GetAssignmentsResponse, GetStaffListResponse, GetTeamsResponse } from '../../../workforce/staff/staff.service';
import { OpenOrdersTable } from '../components/open-orders-table';
import {
  dashboardCounts,
  DASHBOARD_PAGE_SIZE,
  DASHBOARD_TABS,
  dateKicker,
  firstName,
  greeting,
  mobilizedLabel,
  mobilizedTeams,
  openOrders,
  Period,
  periodItems,
  periodLabels,
  Responsavel,
  responsavelOf,
  responsavelOfAssignment,
  teamFooter,
  teamRows,
} from '../dashboard-summary';

/** The Agenda tags and dots, in the Agenda's colours by kind. */
const KIND_TAGS: Record<AgendaKind, string> = {
  SERVICE: 'bg-[#edf4fb] text-[#5a84ae] dark:bg-[#18283a] dark:text-[#8db4dc]',
  DOCKING: 'bg-[#faf0e8] text-[#b0703f] dark:bg-[#30291f] dark:text-[#e2c18b]',
  UNDOCKING: 'bg-[#f2eff8] text-[#8a72a7] dark:bg-[#251f30] dark:text-[#c7b3dd]',
};
const KIND_DOTS: Record<AgendaKind, string> = {
  SERVICE: 'bg-[#5c92c5] outline-[#e1edf7] dark:outline-[#18283a]',
  DOCKING: 'bg-[#d9a247] outline-[#f9eedb] dark:outline-[#30291f]',
  UNDOCKING: 'bg-[#8a72a7] outline-[#ece6f4] dark:outline-[#251f30]',
};
/** The three Team symbol colours of the source, by position. */
const TEAM_TONES = [
  'bg-[#edf3fa] text-[#5487ba] dark:bg-[#18283a] dark:text-[#8db4dc]',
  'bg-[#edf4f4] text-[#568e89] dark:bg-[#17302f] dark:text-[#7cc7c2]',
  'bg-[#f5eff9] text-[#9372a4] dark:bg-[#251f30] dark:text-[#c7b3dd]',
];
const STATE_DOTS = { 'Em serviço': 'bg-[#d9a247]', Disponível: 'bg-[#49a77e]' };

/** "Visão geral", after the mareos dashboard (dashboard-redesign). */
@Component({
  selector: 'dashboard',
  imports: [NgIcon, RouterLink, Button, Confirmation, Sheet, Skeleton, WorkOrderForm, OpenOrdersTable],
  viewProviders: [
    provideIcons({
      lucideAnchor,
      lucideChevronDown,
      lucideChevronLeft,
      lucideChevronRight,
      lucideClipboardList,
      lucideClock3,
      lucideDownload,
      lucideEllipsis,
      lucideMoon,
      lucidePlus,
      lucideSearch,
      lucideSun,
      lucideWrench,
    }),
  ],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly authentication = inject(AuthenticationService);
  protected readonly canWrite = this.authentication.canWrite;
  /** Only an administrator names a Responsável (AD-079). */
  protected readonly isAdministrator = this.authentication.isAdministrator;
  private readonly workOrderService = inject(WorkOrderService);
  private readonly workOrderForm = viewChild(WorkOrderForm);

  workOrderResource = httpResource<GetWorkOrdersResponse>(() => '/api/work-orders');
  vesselResource = httpResource<GetVesselsResponse>(() => '/api/vessels');
  customerResource = httpResource<GetCustomersResponse>(() => '/api/customers');
  staffResource = httpResource<GetStaffListResponse>(() => '/api/staff');
  teamResource = httpResource<GetTeamsResponse>(() => '/api/teams');
  assignmentResource = httpResource<GetAssignmentsResponse>(() => '/api/assignments');

  /** The browser's clock when the page opened: the greeting, the date and the period follow it. */
  protected readonly now = new Date();

  protected readonly kindLabels = agendaKindLabels;
  protected readonly kindTags = KIND_TAGS;
  protected readonly kindDots = KIND_DOTS;
  protected readonly teamTones = TEAM_TONES;
  protected readonly stateDots = STATE_DOTS;
  protected readonly tabs = DASHBOARD_TABS;

  protected readonly kicker = dateKicker(this.now);
  protected readonly greeting = greeting(this.now);
  protected readonly firstName = computed(() => firstName(this.authentication.name()));

  // Each read's value, or undefined until it answers (and for good once it fails).
  private readonly workOrders = computed(() => resourceValue(this.workOrderResource)?.workOrders);
  private readonly vessels = computed(() => resourceValue(this.vesselResource)?.vessels);
  private readonly customers = computed(() => resourceValue(this.customerResource)?.customers);
  private readonly staff = computed(() => resourceValue(this.staffResource)?.staff);
  private readonly teams = computed(() => resourceValue(this.teamResource)?.teams);
  private readonly assignments = computed(() => resourceValue(this.assignmentResource)?.assignments);

  /** The Responsáveis are known: until then none is drawn as "Sem responsável", nor sent by an edit. */
  private readonly workforceReady = computed(() => !!this.staff() && !!this.teams() && !!this.assignments());
  /** Each part waits for every read it draws from, and keeps its skeleton when one fails. */
  cardsReady = computed(() => !!this.workOrders() && !!this.teams() && !!this.assignments());
  agendaReady = computed(() => !!this.workOrders() && !!this.vessels() && this.workforceReady());
  teamsReady = computed(() => !!this.workOrders() && this.workforceReady());
  tableReady = computed(() => !!this.workOrders() && !!this.vessels() && !!this.customers() && this.workforceReady());

  private readonly inProgress = computed(() => servicesInProgress(this.workOrders() ?? []));
  private readonly staffNames = computed(() => new Map((this.staff() ?? []).map((item) => [item.id, item.name])));
  private readonly teamNames = computed(() => new Map((this.teams() ?? []).map((item) => [item.id, item.name])));
  private readonly byService = computed(
    () => new Map((this.assignments() ?? []).map((item) => [item.workOrderServiceId, item])),
  );

  counts = computed(() => dashboardCounts(this.workOrders() ?? [], this.now));
  mobilized = computed(() =>
    mobilizedLabel(mobilizedTeams(this.teams() ?? [], this.assignments() ?? [], this.inProgress())),
  );

  period = signal<Period>('WEEK');
  periodLabel = computed(() => periodLabels[this.period()]);
  agendaDays = computed(() => {
    const vesselNames = new Map((this.vessels() ?? []).map((vessel) => [vessel.id, vessel.name]));
    const staffNames = this.staffNames();
    const teamNames = this.teamNames();
    const byService = this.byService();
    return periodItems(
      agendaItems(this.workOrders() ?? [], vesselNames),
      this.period(),
      this.now,
      (serviceId) => responsavelOfAssignment(byService.get(serviceId), staffNames, teamNames)?.name ?? null,
    );
  });
  agendaEmpty = computed(() =>
    this.period() === 'TODAY' ? 'Nenhum item na agenda hoje.' : 'Nenhum item na agenda nesta semana.',
  );

  teamList = computed(() => teamRows(this.teams() ?? [], this.assignments() ?? [], this.inProgress()));
  footer = computed(() => teamFooter(this.staff() ?? []));

  vesselOptions = computed(() => this.vessels() ?? []);
  customerNames = computed(() => new Map((this.customers() ?? []).map((customer) => [customer.id, customer.name])));
  assigneeOptions = computed(() =>
    this.isAdministrator() ? assigneeGroups(this.staff() ?? [], this.teams() ?? []) : null,
  );

  /** The open WorkOrders with their names joined in the browser, the nearest Desdocagem first. */
  rows = computed<WorkOrderRow[]>(() => {
    const vessels = new Map((this.vessels() ?? []).map((vessel) => [vessel.id, vessel]));
    const customers = this.customerNames();
    return openOrders(
      (this.workOrders() ?? []).map((order) => {
        const vessel = vessels.get(order.vesselId);
        return {
          ...order,
          vesselName: vessel?.name ?? '',
          customerName: vessel ? (customers.get(vessel.customerId) ?? '') : '',
        };
      }),
    );
  });
  responsaveis = computed(() => {
    const byService = this.byService();
    const staffNames = this.staffNames();
    const teamNames = this.teamNames();
    return new Map<string, Responsavel | null>(
      this.rows().map((order) => [order.id, responsavelOf(order, byService, staffNames, teamNames)]),
    );
  });

  tab = signal<StatusTab>('ALL');
  search = signal('');
  page = signal(1);
  filtered = computed(() => filterWorkOrders(this.rows(), this.tab(), this.search()));
  pages = computed(() =>
    Array.from({ length: pageCount(this.filtered().length, DASHBOARD_PAGE_SIZE) }, (_, index) => index + 1),
  );
  /** The page shown: a delete or a search that empties the last page falls back to the last one left. */
  currentPage = computed(() => Math.min(this.page(), Math.max(1, this.pages().length)));
  shown = computed(() => pageOf(this.filtered(), this.currentPage(), DASHBOARD_PAGE_SIZE));
  range = computed(() => rangeLabel(this.filtered().length, this.currentPage(), DASHBOARD_PAGE_SIZE));
  emptyMessage = computed(() =>
    this.rows().length === 0 ? 'Nenhuma ordem de serviço em aberto.' : 'Nenhuma ordem encontrada.',
  );

  submitting = signal(false);
  confirming = signal(false);
  isSheetActive = signal(false);
  /** The WorkOrder the drawer edits; null while it creates one. */
  editing = signal<WorkOrderFormValue | null>(null);
  private readonly editingId = signal<string | null>(null);
  deleting = signal<WorkOrderRow | null>(null);

  constructor() {
    effect(() => {
      for (const resource of [
        this.workOrderResource,
        this.vesselResource,
        this.customerResource,
        this.staffResource,
        this.teamResource,
        this.assignmentResource,
      ]) {
        const error = resource.error();
        if (!error) continue;
        // The toaster keeps its toasts in a signal: reading it here would re-run this effect forever.
        untracked(() =>
          toast.error('Erro ao carregar a visão geral', {
            description: apiErrorMessage(error as { error?: unknown }, 'Não foi possível carregar a visão geral.'),
          }),
        );
      }
    });
  }

  togglePeriod() {
    this.period.update((period) => (period === 'WEEK' ? 'TODAY' : 'WEEK'));
  }

  pickTab(tab: StatusTab) {
    this.tab.set(tab);
    this.page.set(1);
  }

  setSearch(value: string) {
    this.search.set(value);
    this.page.set(1);
  }

  goTo(page: number) {
    const last = Math.max(1, this.pages().length);
    this.page.set(Math.min(Math.max(1, page), last));
  }

  /** Exports the rows of the tab and the search, every page included. */
  exportRows() {
    const rows = this.filtered();
    if (!rows.length) return;
    downloadCsv('ordens-de-servico.csv', workOrdersCsv(rows));
  }

  openCreate() {
    this.editing.set(null);
    this.editingId.set(null);
    this.workOrderForm()?.reset();
    this.isSheetActive.set(true);
  }

  openEdit(order: WorkOrderRow) {
    const assignments = this.byService();
    const value: WorkOrderFormValue = {
      vesselId: order.vesselId,
      startDate: order.startDate,
      endDate: order.endDate,
      status: order.status,
    };
    // Only once the Responsáveis are known: an edit sent without them would clear them all.
    if (this.workforceReady()) {
      value.services = order.services.map((service) => ({
        id: service.id,
        name: service.name,
        status: service.status,
        assignee: assigneeKeyOf(assignments.get(service.id)),
      }));
    }
    this.editing.set(value);
    this.editingId.set(order.id);
    this.workOrderForm()?.load(value);
    this.isSheetActive.set(true);
  }

  closeSheet() {
    this.isSheetActive.set(false);
  }

  save(request: WorkOrderFormSubmit) {
    const editingId = this.editingId();
    this.submitting.set(true);

    const call: Observable<unknown> = editingId
      ? this.workOrderService.updateWorkOrder(editingId, {
          startDate: request.startDate,
          endDate: request.endDate,
          status: request.status,
          ...(request.assignees ? { services: request.assignees } : {}),
        })
      : this.workOrderService.createWorkOrder(request);

    call.subscribe({
      next: () => {
        if (editingId) {
          toast.success('Ordem atualizada com sucesso', {
            description: 'A ordem de serviço foi atualizada com sucesso.',
          });
        } else {
          toast.success('Ordem de serviço criada com sucesso', {
            description: 'A ordem de serviço foi criada com sucesso.',
          });
          this.tab.set('ALL');
          this.search.set('');
          this.page.set(1);
        }
        this.submitting.set(false);
        this.closeSheet();
        this.editing.set(null);
        this.editingId.set(null);
        this.workOrderResource.reload();
        const assigned =
          !!request.assignees || !!request.services?.some((service) => service.staffId || service.teamId);
        if (assigned) this.assignmentResource.reload();
      },
      error: (response) => {
        // The drawer stays open with what was typed.
        toast.error(editingId ? 'Erro ao atualizar ordem' : 'Erro ao criar ordem de serviço', {
          description: apiErrorMessage(
            response,
            editingId ? 'Ocorreu um erro ao atualizar a ordem de serviço.' : 'Ocorreu um erro ao criar a ordem de serviço.',
          ),
        });
        this.submitting.set(false);
      },
    });
  }

  openDelete(order: WorkOrderRow) {
    this.deleting.set(order);
  }

  closeDelete() {
    this.deleting.set(null);
  }

  delete() {
    const order = this.deleting();
    if (!order) return;
    this.confirming.set(true);

    this.workOrderService.deleteWorkOrder(order.id).subscribe({
      next: () => {
        this.confirming.set(false);
        this.closeDelete();
        // Deleting a WorkOrder deletes its Assignments (AD-064).
        this.workOrderResource.reload();
        this.assignmentResource.reload();
        toast.success('Ordem de serviço excluída com sucesso', {
          description: 'A ordem de serviço foi excluída com sucesso.',
        });
      },
      error: (response) => {
        this.confirming.set(false);
        this.closeDelete();
        toast.error('Erro ao excluir ordem de serviço', {
          description: apiErrorMessage(response, 'Ocorreu um erro ao excluir a ordem de serviço.'),
        });
      },
    });
  }
}
