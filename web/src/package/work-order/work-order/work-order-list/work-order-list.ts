import { httpResource } from '@angular/common/http';
import { Component, computed, effect, inject, signal, untracked, viewChild } from '@angular/core';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { Observable } from 'rxjs';
import {
  lucideCheck,
  lucideChevronLeft,
  lucideChevronRight,
  lucideClipboardList,
  lucideClock3,
  lucideDownload,
  lucidePlus,
  lucideSearch,
  lucideWrench,
  lucideX,
} from '@ng-icons/lucide';

import { GetCustomersResponse } from '../../../customer/customer/customer.service';
import { GetVesselsResponse } from '../../../customer/vessel/vessel.service';
import { AuthenticationService } from '../../../identity/authentication/authentication.service';
import { apiErrorMessage } from '../../../shared/components/lib/api-error-message';
import { downloadCsv } from '../../../shared/components/lib/csv';
import { resourceValue } from '../../../shared/components/lib/resource-value';
import { Button } from '../../../shared/components/ui/button';
import { Confirmation } from '../../../shared/components/ui/confirmation';
import { Metric } from '../../../shared/components/ui/metric';
import { Sheet } from '../../../shared/components/ui/sheet';
import { Skeleton } from '../../../shared/components/ui/skeleton';
import { toast } from '../../../shared/components/ui/toaster';
import { WorkOrderForm, WorkOrderFormValue } from '../components/work-order-form';
import { WorkOrderTable } from '../components/work-order-table';
import { workOrdersCsv } from '../work-order-csv';
import {
  filterWorkOrders,
  pageCount,
  pageOf,
  rangeLabel,
  sortWorkOrders,
  STATUS_TABS,
  StatusTab,
  tabCounts,
  workOrderMetrics,
  WorkOrderRow,
} from '../work-order-filters';
import { CreateWorkOrderRequest, GetWorkOrdersResponse, WorkOrderService } from '../work-order.service';

/** The mareos "Ordens de serviço": every WorkOrder of the Organization on one page (AD-040). */
@Component({
  selector: 'work-order-list',
  imports: [NgIcon, Button, Confirmation, Metric, Sheet, Skeleton, WorkOrderForm, WorkOrderTable],
  viewProviders: [
    provideIcons({
      lucideCheck,
      lucideChevronLeft,
      lucideChevronRight,
      lucideClipboardList,
      lucideClock3,
      lucideDownload,
      lucidePlus,
      lucideSearch,
      lucideWrench,
      lucideX,
    }),
  ],
  templateUrl: './work-order-list.html',
})
export class WorkOrderList {
  protected readonly canWrite = inject(AuthenticationService).canWrite;
  private readonly workOrderService = inject(WorkOrderService);
  private readonly workOrderForm = viewChild(WorkOrderForm);

  workOrderResource = httpResource<GetWorkOrdersResponse>(() => '/api/work-orders');
  vesselResource = httpResource<GetVesselsResponse>(() => '/api/vessels');
  customerResource = httpResource<GetCustomersResponse>(() => '/api/customers');

  protected readonly tabs = STATUS_TABS;
  tab = signal<StatusTab>('ALL');
  search = signal('');
  page = signal(1);
  selected = signal<ReadonlySet<string>>(new Set());
  submitting = signal(false);
  confirming = signal(false);
  isSheetActive = signal(false);
  /** The WorkOrder the drawer edits; null while it creates one. */
  editing = signal<WorkOrderFormValue | null>(null);
  private readonly editingId = signal<string | null>(null);
  deleting = signal<WorkOrderRow | null>(null);

  loading = computed(
    () => this.workOrderResource.isLoading() || this.vesselResource.isLoading() || this.customerResource.isLoading(),
  );
  vessels = computed(() => resourceValue(this.vesselResource)?.vessels ?? []);
  customerNames = computed(
    () => new Map((resourceValue(this.customerResource)?.customers ?? []).map((customer) => [customer.id, customer.name])),
  );

  rows = computed<WorkOrderRow[]>(() => {
    const vessels = new Map(this.vessels().map((vessel) => [vessel.id, vessel]));
    const customers = this.customerNames();
    return sortWorkOrders(
      (resourceValue(this.workOrderResource)?.workOrders ?? []).map((order) => {
        const vessel = vessels.get(order.vesselId);
        return {
          ...order,
          vesselName: vessel?.name ?? '',
          customerName: vessel ? (customers.get(vessel.customerId) ?? '') : '',
        };
      }),
    );
  });

  metrics = computed(() => workOrderMetrics(this.rows()));
  counts = computed(() => tabCounts(this.rows()));
  filtered = computed(() => filterWorkOrders(this.rows(), this.tab(), this.search()));
  pages = computed(() => Array.from({ length: pageCount(this.filtered().length) }, (_, index) => index + 1));
  /** The page shown: a delete or a filter that empties the last page falls back to the last one left. */
  currentPage = computed(() => Math.min(this.page(), Math.max(1, this.pages().length)));
  shown = computed(() => pageOf(this.filtered(), this.currentPage()));
  range = computed(() => rangeLabel(this.filtered().length, this.currentPage()));
  emptyMessage = computed(() =>
    this.rows().length === 0
      ? 'Ainda não há ordens de serviço cadastradas.'
      : 'Nenhuma ordem corresponde aos filtros aplicados.',
  );

  selectedCount = computed(() => this.selected().size);
  exportLabel = computed(() => {
    const count = this.selectedCount();
    if (count === 0) return 'Selecione ordens para exportar';
    if (count === 1) return 'Exportar 1 ordem selecionada em CSV';
    return `Exportar ${count} ordens selecionadas em CSV`;
  });

  constructor() {
    effect(() => {
      for (const resource of [this.workOrderResource, this.vesselResource, this.customerResource]) {
        const error = resource.error();
        if (!error) continue;
        // The toaster keeps its toasts in a signal: reading it here would re-run this effect forever.
        untracked(() =>
          toast.error('Erro ao carregar ordens de serviço', {
            description: apiErrorMessage(error as { error?: unknown }, 'Não foi possível carregar as ordens de serviço.'),
          }),
        );
      }
    });
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

  toggle(id: string) {
    this.selected.update((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  /** Selects every row of the current page, or clears them when they are all selected already. */
  toggleShown() {
    const shown = this.shown().map((order) => order.id);
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

  /** Exports every selected WorkOrder, the ones a tab, a search or a page hides included. */
  exportSelected() {
    const selected = this.selected();
    const rows = this.rows().filter((order) => selected.has(order.id));
    if (!rows.length) return;
    downloadCsv('ordens-de-servico.csv', workOrdersCsv(rows));
  }

  openCreate() {
    this.editing.set(null);
    this.editingId.set(null);
    this.workOrderForm()?.reset();
    this.isSheetActive.set(true);
    this.workOrderForm()?.focusFirst();
  }

  openEdit(order: WorkOrderRow) {
    const value: WorkOrderFormValue = {
      vesselId: order.vesselId,
      startDate: order.startDate,
      endDate: order.endDate,
      status: order.status,
    };
    this.editing.set(value);
    this.editingId.set(order.id);
    this.workOrderForm()?.load(value);
    this.isSheetActive.set(true);
  }

  closeSheet() {
    this.isSheetActive.set(false);
  }

  save(request: CreateWorkOrderRequest) {
    const editingId = this.editingId();
    this.submitting.set(true);

    const call: Observable<unknown> = editingId
      ? this.workOrderService.updateWorkOrder(editingId, {
          startDate: request.startDate,
          endDate: request.endDate,
          status: request.status,
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
        this.selected.update((current) => {
          const next = new Set(current);
          next.delete(order.id);
          return next;
        });
        this.workOrderResource.reload();
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
