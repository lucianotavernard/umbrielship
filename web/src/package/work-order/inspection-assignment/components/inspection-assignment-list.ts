import { DatePipe } from '@angular/common';
import { Component, input, output, signal } from '@angular/core';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronDown, lucideChevronRight, lucideClipboardCheck, lucideTrash } from '@ng-icons/lucide';

import { Button } from '../../../shared/components/ui/button';
import { Skeleton } from '../../../shared/components/ui/skeleton';
import { questionTypeLabels } from '../../inspection-template/inspection-template.service';
import { Inspection, inspectionResultLabels } from '../../inspection/inspection.service';
import { InspectionAssignment, WHOLE_WORK_ORDER } from '../inspection-assignment.service';

@Component({
  selector: 'inspection-assignment-list-ui',
  imports: [DatePipe, NgIcon, Button, Skeleton],
  viewProviders: [provideIcons({ lucideChevronDown, lucideChevronRight, lucideClipboardCheck, lucideTrash })],
  template: `
    @if (loading()) {
      <div class="flex flex-col gap-3">
        <t-skeleton class="h-14 w-full rounded-lg" />
        <t-skeleton class="h-14 w-full rounded-lg" />
      </div>
    } @else {
      <ul class="flex flex-col gap-3">
        @for (assignment of assignments(); track assignment.id) {
          <li class="overflow-hidden rounded-lg border" data-slot="assignment">
            <div class="flex items-start gap-2 p-3">
              <button
                type="button"
                class="flex min-w-0 flex-1 items-start gap-3 text-left"
                [attr.aria-expanded]="isOpen(assignment.id)"
                (click)="toggle(assignment.id)"
              >
                <ng-icon
                  [name]="isOpen(assignment.id) ? 'lucideChevronDown' : 'lucideChevronRight'"
                  class="mt-0.5 size-4 shrink-0 text-muted-foreground"
                />
                <span class="flex min-w-0 flex-col gap-0.5">
                  <span class="text-sm font-medium break-words" data-slot="template">{{ assignment.templateName }}</span>
                  <span class="text-xs text-muted-foreground break-words" data-slot="target">
                    {{ assignment.service?.name ?? wholeWorkOrder }}
                  </span>
                  <span class="text-xs text-muted-foreground" data-slot="count">
                    {{ assignment.items.length }} {{ assignment.items.length === 1 ? 'pergunta' : 'perguntas' }}
                  </span>
                  <span class="text-xs text-muted-foreground" data-slot="history">
                    @if (assignment.inspections.length === 0) {
                      Nenhuma inspeção
                    } @else {
                      {{ assignment.inspections.length }}
                      {{ assignment.inspections.length === 1 ? 'inspeção' : 'inspeções' }} · última:
                      {{ resultLabels[assignment.inspections[0].result] }}
                    }
                  </span>
                </span>
              </button>
              @if (canAdminister() && assignment.removable) {
                <button
                  tButton
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Remover"
                  title="Remover atribuição"
                  class="shrink-0 text-muted-foreground hover:text-destructive"
                  (click)="removed.emit(assignment)"
                >
                  <ng-icon name="lucideTrash" class="size-4" />
                </button>
              }
            </div>
            @if (isOpen(assignment.id)) {
              <ol class="flex flex-col divide-y border-t bg-muted/30" data-slot="questions">
                @for (item of ordered(assignment); track item.id; let index = $index) {
                  <li class="flex gap-3 px-4 py-2 text-sm">
                    <span class="w-6 shrink-0 text-right tabular-nums text-muted-foreground">{{ index + 1 }}.</span>
                    <span class="flex min-w-0 flex-col gap-0.5">
                      <span class="break-words">{{ item.label }}</span>
                      <span class="text-xs text-muted-foreground" data-slot="type">{{ typeLabels[item.type] }}</span>
                    </span>
                  </li>
                }
              </ol>
              <div class="flex flex-col gap-3 border-t p-3" data-slot="inspections">
                @if (canInspect()) {
                  <div class="flex flex-col items-start gap-1">
                    <button
                      tButton
                      type="button"
                      size="lg"
                      [disabled]="blockedReason(assignment) !== null"
                      (click)="inspected.emit(assignment)"
                    >
                      Inspecionar
                    </button>
                    @if (blockedReason(assignment); as reason) {
                      <p class="text-xs text-muted-foreground" data-slot="blocked">{{ reason }}</p>
                    }
                  </div>
                }
                @if (assignment.inspections.length > 0) {
                  <ul class="flex flex-col gap-2">
                    @for (inspection of assignment.inspections; track inspection.id) {
                      <li>
                        <button
                          type="button"
                          class="flex min-h-10 w-full flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-md border px-3 py-2 text-left text-sm hover:bg-accent"
                          data-slot="inspection"
                          (click)="opened.emit({ assignment, inspection })"
                        >
                          <span class="font-medium">{{ resultLabels[inspection.result] }}</span>
                          <span class="min-w-0 break-words text-muted-foreground">{{ inspection.inspectorName }}</span>
                          <span class="tabular-nums text-muted-foreground">{{ inspection.completedAt | date: 'dd/MM/yyyy HH:mm' }}</span>
                        </button>
                      </li>
                    }
                  </ul>
                }
              </div>
            }
          </li>
        } @empty {
          <li class="flex flex-col items-center py-8 text-center">
            <div class="mb-2 flex rounded-lg bg-muted p-3">
              <ng-icon name="lucideClipboardCheck" class="size-6 text-muted-foreground" />
            </div>
            <p class="text-sm font-medium">Nenhum modelo atribuído</p>
          </li>
        }
      </ul>
    }
  `,
})
export class InspectionAssignmentList {
  canAdminister = input.required<boolean>();
  canInspect = input(false);
  // The statuses that decide whether an assignment can be inspected now (D6, AD-018).
  workOrderStatus = input<string | null>(null);
  serviceStatuses = input<Record<string, string>>({});
  loading = input(false);
  assignments = input<InspectionAssignment[]>([]);
  removed = output<InspectionAssignment>();
  inspected = output<InspectionAssignment>();
  opened = output<{ assignment: InspectionAssignment; inspection: Inspection }>();

  protected readonly wholeWorkOrder = WHOLE_WORK_ORDER;
  protected readonly typeLabels = questionTypeLabels;
  protected readonly resultLabels = inspectionResultLabels;
  private readonly open = signal<ReadonlySet<string>>(new Set());

  // Questions are asked in `position` order, whatever order the response lists them in.
  protected ordered(assignment: InspectionAssignment) {
    return [...assignment.items].sort((a, b) => a.position - b.position);
  }

  // Why "Inspecionar" is off, or null when the work is in progress.
  protected blockedReason(assignment: InspectionAssignment): string | null {
    if (this.workOrderStatus() !== 'IN_PROGRESS') return 'Disponível com a ordem em andamento';
    if (assignment.service && this.serviceStatuses()[assignment.service.id] !== 'IN_PROGRESS') {
      return 'Disponível com o serviço em andamento';
    }
    return null;
  }

  protected isOpen(id: string) {
    return this.open().has(id);
  }

  protected toggle(id: string) {
    this.open.update((open) => {
      const next = new Set(open);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }
}
