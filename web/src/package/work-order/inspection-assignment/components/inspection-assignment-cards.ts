import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideClipboardCheck, lucideShieldCheck } from '@ng-icons/lucide';

import { inspectionResultLabels } from '../../inspection/inspection.service';
import { workOrderCode } from '../../work-order/work-order.service';
import { OrganizationInspectionAssignment, WHOLE_WORK_ORDER } from '../inspection-assignment.service';

/** An assignment card of the hub, with its Vessel name and, for an inspector, why it is blocked. */
export type AssignmentCardRow = OrganizationInspectionAssignment & {
  vesselName: string;
  blockedReason: string | null;
};

/** The mareos assignment cards (AD-046): code and Vessel, template, target and count, the pill. */
@Component({
  selector: 'inspection-assignment-cards-ui',
  imports: [NgIcon, RouterLink],
  viewProviders: [provideIcons({ lucideClipboardCheck, lucideShieldCheck })],
  template: `
    @if (rows().length === 0) {
      <div data-slot="assignments-empty" class="flex flex-col items-center gap-1.5 py-[30px] text-center text-muted-foreground">
        <ng-icon name="lucideShieldCheck" class="!size-[22px]" />
        <strong class="text-[11px] font-semibold text-foreground">Nenhuma inspeção atribuída</strong>
        <span class="text-[10px]">Quando um modelo for atribuído a uma ordem de serviço, ele aparecerá aqui.</span>
      </div>
    } @else {
      <ul class="flex flex-col gap-2.5">
        @for (row of rows(); track row.id) {
          <li
            data-slot="assignment-card"
            class="flex flex-wrap items-center gap-x-[13px] gap-y-2.5 rounded-[9px] border border-border bg-card p-[13px]"
          >
            <span
              class="grid size-[36px] shrink-0 place-items-center rounded-[8px]"
              [class]="row.inspections.length ? 'bg-[#eaf5ef] text-[#498b68] dark:bg-[#15291f] dark:text-[#8fcfab]' : 'bg-[#fbf4e7] text-[#c78753] dark:bg-[#30291f] dark:text-[#e2c18b]'"
            >
              <ng-icon [name]="row.inspections.length ? 'lucideClipboardCheck' : 'lucideShieldCheck'" class="!size-[17px]" />
            </span>
            <div class="min-w-0 flex-1">
              <span data-slot="eyebrow" class="block text-[9px] font-semibold text-muted-foreground">
                {{ code(row.workOrder.id) }} · {{ row.vesselName }}
              </span>
              <h3 data-slot="template" class="mt-1 text-[11px] break-words text-foreground">{{ row.templateName }}</h3>
              <p data-slot="target" class="mt-1 text-[9px] text-muted-foreground">
                {{ row.service?.name ?? wholeWorkOrder }} · {{ row.items.length }}
                {{ row.items.length === 1 ? 'pergunta' : 'perguntas' }}
              </p>
            </div>
            <span
              data-slot="pill"
              class="inline-flex shrink-0 items-center rounded-full px-2 py-[5px] text-[9px] leading-none font-semibold whitespace-nowrap"
              [class]="pillTone(row)"
            >
              {{ pill(row) }}
            </span>
            <div class="flex shrink-0 flex-col items-end gap-1">
              <div class="flex items-center gap-1.5">
                @if (canInspect()) {
                  <button
                    type="button"
                    [class]="action + ' disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border disabled:hover:text-foreground/75'"
                    [disabled]="row.blockedReason !== null"
                    (click)="inspected.emit(row)"
                  >
                    Inspecionar
                  </button>
                }
                <a
                  [class]="action"
                  [routerLink]="['/work-orders', row.workOrder.id]"
                >
                  Abrir ordem
                </a>
              </div>
              @if (canInspect() && row.blockedReason; as reason) {
                <p data-slot="blocked" class="text-[9px] text-muted-foreground">{{ reason }}</p>
              }
            </div>
          </li>
        }
      </ul>
    }
  `,
})
export class InspectionAssignmentCards {
  rows = input<AssignmentCardRow[]>([]);
  canInspect = input(false);
  inspected = output<AssignmentCardRow>();

  /** The mareos `.openAssignment`: a small outlined white button. */
  protected readonly action =
    'inline-flex h-[30px] shrink-0 items-center rounded-[5px] border border-border bg-card px-2.5 text-[9px] font-semibold text-foreground/75 hover:border-primary/40 hover:text-primary';
  protected readonly code = workOrderCode;
  protected readonly wholeWorkOrder = WHOLE_WORK_ORDER;

  /** "Sem inspeção" with no visible Inspection, otherwise the latest result. */
  protected pill(row: AssignmentCardRow): string {
    const latest = row.inspections[0];
    return latest ? inspectionResultLabels[latest.result] : 'Sem inspeção';
  }

  protected pillTone(row: AssignmentCardRow): string {
    const latest = row.inspections[0];
    if (!latest) return 'bg-[#fbf4e7] text-[#a77b32] dark:bg-[#30291f] dark:text-[#e2c18b]';
    return latest.result === 'APPROVED'
      ? 'bg-[#eaf5ef] text-[#498b68] dark:bg-[#15291f] dark:text-[#8fcfab]'
      : 'bg-[#fbefed] text-[#b86b61] dark:bg-[#2e1d1b] dark:text-[#e3a49b]';
  }
}
