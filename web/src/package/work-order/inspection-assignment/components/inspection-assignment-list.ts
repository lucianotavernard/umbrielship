import { Component, input, output, signal } from '@angular/core';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronDown, lucideChevronRight, lucideClipboardCheck, lucideTrash } from '@ng-icons/lucide';

import { Button } from '../../../shared/components/ui/button';
import { Skeleton } from '../../../shared/components/ui/skeleton';
import { InspectionAssignment, WHOLE_WORK_ORDER } from '../inspection-assignment.service';

@Component({
  selector: 'inspection-assignment-list-ui',
  imports: [NgIcon, Button, Skeleton],
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
                </span>
              </button>
              @if (canAdminister()) {
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
                @for (item of assignment.items; track item.id; let index = $index) {
                  <li class="flex gap-3 px-4 py-2 text-sm">
                    <span class="w-6 shrink-0 text-right tabular-nums text-muted-foreground">{{ index + 1 }}.</span>
                    <span class="min-w-0 break-words">{{ item.label }}</span>
                  </li>
                }
              </ol>
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
  loading = input(false);
  assignments = input<InspectionAssignment[]>([]);
  removed = output<InspectionAssignment>();

  protected readonly wholeWorkOrder = WHOLE_WORK_ORDER;
  private readonly open = signal<ReadonlySet<string>>(new Set());

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
