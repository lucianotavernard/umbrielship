import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideImagePlus, lucideWrench } from '@ng-icons/lucide';

import { Skeleton } from '../../../shared/components/ui/skeleton';
import { workOrderStatusTones } from '../../work-order/work-order.service';
import { WorkOrderServiceItem, workOrderServiceStatusLabels } from '../work-order-service.service';

/** The services of a WorkOrder in the mareos table look: name and description, period, status, photo. */
@Component({
  selector: 'work-order-service-list-ui',
  imports: [DatePipe, NgIcon, Skeleton],
  viewProviders: [provideIcons({ lucideImagePlus, lucideWrench })],
  template: `
    @if (!loading() && services().length === 0) {
      <div data-slot="services-empty" class="flex min-h-[140px] flex-col items-center justify-center text-center">
        <span class="grid size-[34px] place-items-center rounded-[9px] bg-accent text-accent-foreground">
          <ng-icon name="lucideWrench" class="!size-[17px]" />
        </span>
        <strong class="mt-2.5 text-[11px] font-semibold text-foreground">Nenhum serviço executado</strong>
        <p class="mt-[5px] text-[10px] text-muted-foreground">Não há serviços registrados para esta ordem.</p>
      </div>
    } @else {
      <div class="relative overflow-x-auto">
        <table class="w-full min-w-[600px] border-collapse text-left">
          <thead>
            <tr class="text-[8px] font-bold tracking-[0.65px] text-muted-foreground">
              <th class="h-[34px] border-b border-border px-2 font-bold">SERVIÇO</th>
              <th class="h-[34px] border-b border-border px-2 font-bold">INÍCIO</th>
              <th class="h-[34px] border-b border-border px-2 font-bold">FIM</th>
              <th class="h-[34px] border-b border-border px-2 font-bold">STATUS</th>
              <th class="h-[34px] border-b border-border px-2"><span class="sr-only">Foto</span></th>
            </tr>
          </thead>
          <tbody>
            @if (loading()) {
              @for (row of [1, 2, 3]; track row) {
                <tr data-slot="skeleton-row" class="border-b border-border last:border-b-0">
                  <td class="h-[51px] px-2"><t-skeleton class="h-3 w-40 rounded" /></td>
                  <td class="h-[51px] px-2"><t-skeleton class="h-3 w-24 rounded" /></td>
                  <td class="h-[51px] px-2"><t-skeleton class="h-3 w-24 rounded" /></td>
                  <td class="h-[51px] px-2"><t-skeleton class="h-5 w-20 rounded-full" /></td>
                  <td class="h-[51px] px-2"></td>
                </tr>
              }
            } @else {
              @for (service of services(); track service.id) {
                <tr data-slot="service-row" class="border-b border-border text-[10px] text-muted-foreground last:border-b-0">
                  <td class="px-2 py-2.5">
                    <span data-slot="service-name" class="block font-semibold text-foreground">{{ service.name }}</span>
                    <span data-slot="service-description" class="mt-1 block max-w-[320px] break-words text-[9px]">
                      {{ service.description }}
                    </span>
                    <span data-slot="service-assignee" class="mt-1 block text-[9px] font-semibold text-foreground/70">
                      {{ responsaveis().get(service.id) ?? 'Sem responsável' }}
                    </span>
                  </td>
                  <td data-slot="service-start" class="px-2 py-2.5 whitespace-nowrap tabular-nums">
                    {{ service.startDate | date: 'dd/MM/yyyy HH:mm' }}
                  </td>
                  <td data-slot="service-end" class="px-2 py-2.5 whitespace-nowrap tabular-nums">
                    {{ service.endDate | date: 'dd/MM/yyyy HH:mm' }}
                  </td>
                  <td class="px-2 py-2.5">
                    <span
                      data-slot="service-status"
                      class="inline-flex items-center gap-[5px] rounded-full px-2 py-[5px] text-[8px] font-semibold whitespace-nowrap"
                      [class]="tones[service.status]"
                    >
                      <i class="size-[5px] rounded-full bg-current"></i>
                      {{ labels[service.status] }}
                    </span>
                  </td>
                  <td class="px-2 py-2.5 text-right">
                    @if (canWrite()) {
                      <label
                        class="inline-grid size-[27px] cursor-pointer place-items-center rounded-[5px] border border-border bg-card text-muted-foreground focus-within:ring-[3px] focus-within:ring-ring/50 hover:border-primary/40 hover:text-primary"
                        [title]="'Enviar foto de ' + service.name"
                      >
                        <ng-icon name="lucideImagePlus" class="!size-3.5" />
                        <input
                          type="file"
                          accept="image/*"
                          class="sr-only"
                          [attr.aria-label]="'Enviar foto de ' + service.name"
                          (change)="onFile(service, $event)"
                        />
                      </label>
                    }
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>
    }
  `,
})
export class WorkOrderServiceList {
  canWrite = input.required<boolean>();
  loading = input(true);
  services = input<WorkOrderServiceItem[]>([]);
  /** "Responsável: …" or "Sem responsável" by service id (AD-083). */
  responsaveis = input<ReadonlyMap<string, string>>(new Map());
  fileSelected = output<{ serviceId: string; file: File }>();

  protected readonly labels = workOrderServiceStatusLabels;
  protected readonly tones = workOrderStatusTones;

  onFile(service: WorkOrderServiceItem, event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.fileSelected.emit({ serviceId: service.id, file });
    input.value = '';
  }
}
