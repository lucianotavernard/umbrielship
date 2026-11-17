import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCalendarDays, lucideFileText, lucideTrash2 } from '@ng-icons/lucide';

import { Skeleton } from '../../../shared/components/ui/skeleton';
import { WorkOrder, WorkOrderStatus, workOrderStatusLabels } from '../work-order.service';

@Component({
  selector: 'work-order-list-ui',
  imports: [NgIcon, DatePipe, RouterLink, Skeleton],
  viewProviders: [provideIcons({ lucideCalendarDays, lucideFileText, lucideTrash2 })],
  template: `
    @if (!loading() && workOrders().length === 0) {
      <div data-slot="orders-empty" class="flex min-h-[140px] flex-col items-center justify-center text-center">
        <span class="grid size-[34px] place-items-center rounded-[9px] bg-accent text-accent-foreground">
          <ng-icon name="lucideFileText" class="size-[17px]" />
        </span>
        <strong class="mt-2.5 text-[10px] font-semibold text-foreground">Nenhuma ordem vinculada</strong>
        <p class="mt-[5px] text-[9px] text-muted-foreground">As ordens de serviço desta embarcação aparecerão aqui.</p>
      </div>
    } @else {
      <div class="relative overflow-x-auto">
        <table class="w-full min-w-[570px] border-collapse text-left whitespace-nowrap">
          <thead>
            <tr class="text-[8px] font-bold tracking-[0.65px] text-muted-foreground">
              <th class="h-[34px] border-b border-border px-2 font-bold">Ordem</th>
              <th class="h-[34px] border-b border-border px-2 font-bold">Docagem</th>
              <th class="h-[34px] border-b border-border px-2 font-bold">Desdocagem</th>
              <th class="h-[34px] border-b border-border px-2 font-bold">Status</th>
              <th class="h-[34px] border-b border-border px-2"><span class="sr-only">Opções</span></th>
            </tr>
          </thead>
          <tbody>
            @if (loading()) {
              @for (row of [1, 2, 3]; track row) {
                <tr class="border-b border-border last:border-b-0">
                  <td class="h-[47px] px-2"><t-skeleton class="h-3 w-24 rounded" /></td>
                  <td class="h-[47px] px-2"><t-skeleton class="h-3 w-32 rounded" /></td>
                  <td class="h-[47px] px-2"><t-skeleton class="h-3 w-32 rounded" /></td>
                  <td class="h-[47px] px-2"><t-skeleton class="h-5 w-20 rounded-full" /></td>
                  <td class="h-[47px] px-2"></td>
                </tr>
              }
            } @else {
              @for (workOrder of workOrders(); track workOrder.id) {
                <tr data-slot="work-order-row" class="group border-b border-border text-[10px] last:border-b-0">
                  <td class="h-[47px] px-2">
                    <a
                      class="inline-flex items-center gap-[7px] font-semibold text-foreground/85 hover:text-primary"
                      [routerLink]="['/work-orders', workOrder.id]"
                    >
                      <ng-icon name="lucideFileText" class="size-[15px] text-muted-foreground" />
                      #{{ workOrder.id.slice(0, 8).toUpperCase() }}
                    </a>
                  </td>
                  <td class="h-[47px] px-2">
                    <span data-slot="start-date" class="inline-flex items-center gap-[7px] text-muted-foreground">
                      <ng-icon name="lucideCalendarDays" class="size-3.5" />
                      {{ workOrder.startDate | date: 'longDate' : 'UTC' }}
                    </span>
                  </td>
                  <td class="h-[47px] px-2">
                    <span data-slot="end-date" class="inline-flex items-center gap-[7px] text-muted-foreground">
                      <ng-icon name="lucideCalendarDays" class="size-3.5" />
                      {{ workOrder.endDate | date: 'longDate' : 'UTC' }}
                    </span>
                  </td>
                  <td class="h-[47px] px-2">
                    <span
                      data-slot="status"
                      class="inline-flex items-center gap-[5px] rounded-full px-2 py-[5px] text-[8px] font-semibold"
                      [class]="tones[workOrder.status]"
                    >
                      <i class="size-[5px] rounded-full bg-current"></i>
                      {{ labels[workOrder.status] }}
                    </span>
                  </td>
                  <td class="h-[47px] px-2">
                    @if (canWrite()) {
                      <div class="flex justify-end">
                        <button
                          type="button"
                          aria-label="Excluir"
                          title="Excluir ordem de serviço"
                          class="inline-grid size-[27px] place-items-center rounded-[5px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 hover:text-destructive focus-visible:opacity-100"
                          (click)="deleted.emit(workOrder)"
                        >
                          <ng-icon name="lucideTrash2" class="size-3.5" />
                        </button>
                      </div>
                    }
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>
      <div class="mt-4">
        <ng-content select="t-pagination" />
      </div>
    }
  `,
})
export class WorkOrderList {
  canWrite = input.required<boolean>();
  loading = input(true);
  workOrders = input<WorkOrder[]>([]);
  deleted = output<WorkOrder>();

  protected readonly labels = workOrderStatusLabels;

  /** The mareos status pills: in progress blue, done green, cancelled rose, pending grey. */
  protected readonly tones: Record<WorkOrderStatus, string> = {
    PENDING: 'bg-[#f0f2f4] text-[#778590] dark:bg-[#1a2632] dark:text-[#9aaab8]',
    IN_PROGRESS: 'bg-[#edf4fb] text-[#4e84b7] dark:bg-[#18283a] dark:text-[#8db4dc]',
    COMPLETED: 'bg-[#eaf5ef] text-[#498b68] dark:bg-[#15291f] dark:text-[#8fcfab]',
    CANCELLED: 'bg-[#fbefed] text-[#b86b61] dark:bg-[#2e1d1b] dark:text-[#e3a49b]',
  };
}