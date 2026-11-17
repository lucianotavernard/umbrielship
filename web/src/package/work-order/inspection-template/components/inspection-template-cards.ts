import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideClipboardCheck, lucideFilePlus2, lucidePlus } from '@ng-icons/lucide';

import { Skeleton } from '../../../shared/components/ui/skeleton';
import { shortDateWithYear } from '../../work-order/work-order-filters';
import { InspectionTemplateSummary } from '../inspection-template.service';

/** The mareos template cards, "modelo" for "template" (AD-046), without description or photos (AD-034). */
@Component({
  selector: 'inspection-template-cards-ui',
  imports: [NgIcon, RouterLink, Skeleton],
  viewProviders: [provideIcons({ lucideClipboardCheck, lucideFilePlus2, lucidePlus })],
  template: `
    @if (loading()) {
      <div class="grid grid-cols-1 gap-[13px] sm:grid-cols-2 lg:grid-cols-3">
        @for (slot of [1, 2, 3]; track slot) {
          <t-skeleton data-slot="card-skeleton" class="h-[204px] rounded-[9px]" />
        }
      </div>
    } @else {
      @if (templates().length === 0) {
        <p data-slot="templates-empty" class="mb-[13px] text-[11px] text-muted-foreground">
          Nenhum modelo de inspeção cadastrado
        </p>
      }
      <div class="grid grid-cols-1 gap-[13px] sm:grid-cols-2 lg:grid-cols-3">
        @for (template of templates(); track template.id) {
          <article data-slot="template-card" class="flex flex-col rounded-[9px] border border-border bg-card p-[15px]">
            <div class="flex items-start justify-between">
              <span class="grid size-[33px] place-items-center rounded-[8px] bg-[#e3f0ef] text-primary dark:bg-[#17302f]">
                <ng-icon name="lucideFilePlus2" class="!size-[17px]" />
              </span>
              <span class="text-[8px] font-bold tracking-[0.8px] text-muted-foreground">MODELO</span>
            </div>
            <a
              data-slot="template-name"
              class="mt-[13px] text-[12px] break-words text-foreground hover:text-primary hover:underline"
              [routerLink]="['/inspection-templates', template.id]"
            >
              {{ template.name }}
            </a>
            <span data-slot="template-count" class="mt-[13px] inline-flex items-center gap-1.5 border-b border-border pb-[13px] text-[9px] text-muted-foreground">
              <ng-icon name="lucideClipboardCheck" class="!size-[13px]" />
              {{ template.itemCount }} {{ template.itemCount === 1 ? 'pergunta' : 'perguntas' }}
            </span>
            <footer class="mt-auto flex items-center justify-between gap-2 pt-[13px]">
              <span data-slot="template-date" class="text-[9px] text-muted-foreground">Criado em {{ date(template.createdAt) }}</span>
              @if (canAdminister()) {
                <button
                  type="button"
                  class="h-[29px] rounded-[5px] border border-primary/30 bg-primary/5 px-2.5 text-[9px] font-semibold text-primary hover:bg-primary/10"
                  (click)="assigned.emit(template)"
                >
                  Atribuir à OS
                </button>
              }
            </footer>
          </article>
        }
        @if (canAdminister()) {
          <button
            type="button"
            data-slot="create-card"
            class="flex min-h-[204px] flex-col items-center justify-center gap-2 rounded-[9px] border border-dashed border-primary/40 bg-primary/[0.03] p-[15px] text-center hover:bg-primary/5"
            (click)="created.emit()"
          >
            <span class="grid size-[33px] place-items-center rounded-full bg-[#e3f0ef] text-primary dark:bg-[#17302f]">
              <ng-icon name="lucidePlus" class="!size-[19px]" />
            </span>
            <strong class="text-[11px] font-semibold text-foreground">Criar outro modelo</strong>
            <small class="max-w-[190px] text-[9px] text-muted-foreground">Monte um roteiro para uma nova rotina de inspeção</small>
          </button>
        }
      </div>
    }
  `,
})
export class InspectionTemplateCards {
  loading = input(false);
  canAdminister = input(false);
  templates = input<InspectionTemplateSummary[]>([]);
  assigned = output<InspectionTemplateSummary>();
  created = output<void>();

  protected readonly date = shortDateWithYear;
}
