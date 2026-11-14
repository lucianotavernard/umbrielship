import { DatePipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideTrash } from '@ng-icons/lucide';

import { Button } from '../../../shared/components/ui/button';
import type { InspectionAssignmentItem } from '../../inspection-assignment/inspection-assignment.service';
import { answerLabel, Inspection, inspectionResultLabels } from '../inspection.service';

@Component({
  selector: 'inspection-view-ui',
  imports: [DatePipe, NgIcon, Button],
  viewProviders: [provideIcons({ lucideTrash })],
  template: `
    <div class="flex flex-col gap-4">
      <dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
        <dt class="text-muted-foreground">Resultado</dt>
        <dd class="font-medium" data-slot="result">{{ resultLabels[inspection().result] }}</dd>
        <dt class="text-muted-foreground">Inspetor</dt>
        <dd class="break-words" data-slot="inspector">{{ inspection().inspectorName }}</dd>
        <dt class="text-muted-foreground">Data</dt>
        <dd data-slot="date">{{ inspection().completedAt | date: 'dd/MM/yyyy HH:mm' }}</dd>
      </dl>

      <ol class="flex flex-col divide-y rounded-lg border">
        @for (row of rows(); track row.id; let index = $index) {
          <li class="flex flex-col gap-1 px-3 py-2 text-sm" data-slot="answer">
            <span class="break-words">
              <span class="tabular-nums text-muted-foreground">{{ index + 1 }}.</span> {{ row.label }}
            </span>
            <span class="font-medium break-words" data-slot="value">{{ row.answer }}</span>
            @if (row.note) {
              <span class="text-muted-foreground break-words" data-slot="note">{{ row.note }}</span>
            }
          </li>
        }
      </ol>

      @if (canDiscard()) {
        <div class="flex justify-end">
          <button tButton type="button" variant="outline" class="h-10" (click)="discarded.emit()">
            <ng-icon name="lucideTrash" class="size-4" />
            Descartar
          </button>
        </div>
      }
    </div>
  `,
})
export class InspectionView {
  inspection = input.required<Inspection>();
  items = input.required<InspectionAssignmentItem[]>();
  canDiscard = input.required<boolean>();
  discarded = output<void>();

  protected readonly resultLabels = inspectionResultLabels;

  // Each question in `position` order with how its answer reads.
  protected readonly rows = computed(() => {
    const answers = new Map(this.inspection().answers.map((answer) => [answer.itemId, answer]));
    return [...this.items()]
      .sort((a, b) => a.position - b.position)
      .map((item) => {
        const answer = answers.get(item.id);
        return {
          id: item.id,
          label: item.label,
          answer: answer ? answerLabel(item.type, answer) : '',
          note: answer?.note ?? null,
        };
      });
  });
}
