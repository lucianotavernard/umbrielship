import { Component, computed, input } from '@angular/core';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideShieldCheck } from '@ng-icons/lucide';

import type { InspectionAssignmentItem } from '../../inspection-assignment/inspection-assignment.service';
import { answerLabel, Inspection } from '../inspection.service';

/** A completed Inspection read on its page (AD-045): each question with its answer and note. */
@Component({
  selector: 'inspection-view-ui',
  imports: [NgIcon],
  viewProviders: [provideIcons({ lucideShieldCheck })],
  template: `
    <div class="flex items-start justify-between gap-3 border-b border-border pb-[15px]">
      <div class="flex items-start gap-2.5">
        <span class="grid size-[32px] shrink-0 place-items-center rounded-[8px] bg-[#e3f0ef] text-primary dark:bg-[#17302f]">
          <ng-icon name="lucideShieldCheck" class="!size-4" />
        </span>
        <div>
          <h2 class="text-[13px] font-normal text-foreground">Roteiro de inspeção</h2>
          <p class="mt-[3px] text-[10px] text-muted-foreground">Respostas registradas pelo inspetor.</p>
        </div>
      </div>
      <span class="text-[9px] whitespace-nowrap text-muted-foreground">
        {{ rows().length }} {{ rows().length === 1 ? 'pergunta' : 'perguntas' }}
      </span>
    </div>
    <ol class="mt-[15px] flex flex-col gap-[11px]">
      @for (row of rows(); track row.id; let index = $index) {
        <li data-slot="answer" class="flex gap-3 rounded-[9px] border border-border p-[13px]">
          <span class="grid size-[27px] shrink-0 place-items-center rounded-[6px] bg-muted text-[9px] font-bold text-muted-foreground">
            {{ number(index) }}
          </span>
          <div class="flex min-w-0 flex-col gap-1.5">
            <span data-slot="label" class="text-[11px] font-semibold break-words text-foreground">{{ row.label }}</span>
            <span data-slot="value" class="text-[11px] break-words text-foreground/80">{{ row.answer }}</span>
            @if (row.note) {
              <span data-slot="note" class="text-[10px] break-words text-muted-foreground">{{ row.note }}</span>
            }
          </div>
        </li>
      }
    </ol>
  `,
})
export class InspectionView {
  inspection = input.required<Inspection>();
  items = input.required<InspectionAssignmentItem[]>();

  protected readonly number = (index: number) => String(index + 1).padStart(2, '0');

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
