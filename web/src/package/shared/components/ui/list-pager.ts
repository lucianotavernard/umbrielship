import { Component, computed, input, output } from '@angular/core';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronLeft, lucideChevronRight } from '@ng-icons/lucide';

import { PAGE_SIZE, pageCount, rangeLabel } from '../lib/paging';
import { Skeleton } from './skeleton';

/**
 * The footer of a table paged in the browser, as "Lista de ordens" draws it: "Exibindo 1–10 de 23
 * <noun>", "Página anterior", one button per page and "Próxima página" (AD-101).
 */
@Component({
  selector: 't-list-pager',
  imports: [NgIcon, Skeleton],
  viewProviders: [provideIcons({ lucideChevronLeft, lucideChevronRight })],
  template: `
    <footer
      data-slot="list-footer"
      class="flex min-h-[49px] flex-wrap items-center justify-between gap-2 border-t border-border py-2 text-[9px] text-muted-foreground"
    >
      @if (loading()) {
        <t-skeleton class="h-3 w-32 rounded" />
      } @else {
        <span data-slot="range">
          Exibindo <strong class="text-foreground/80">{{ range().first }}–{{ range().last }}</strong> de
          <strong class="text-foreground/80">{{ range().total }}</strong> {{ noun() }}
        </span>
        <nav aria-label="Paginação" class="flex items-center gap-1">
          <button
            type="button"
            aria-label="Página anterior"
            class="grid h-6 min-w-6 place-items-center rounded-[4px] text-muted-foreground transition-colors enabled:hover:bg-muted enabled:hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            [disabled]="page() <= 1"
            (click)="pageChange.emit(page() - 1)"
          >
            <ng-icon name="lucideChevronLeft" class="!size-[15px]" />
          </button>
          @for (number of pages(); track number) {
            <button
              type="button"
              data-slot="page"
              class="grid h-6 min-w-6 place-items-center rounded-[4px] border border-transparent px-[5px] text-[9px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground aria-[current=page]:border-primary/20 aria-[current=page]:bg-primary/5 aria-[current=page]:font-bold aria-[current=page]:text-primary aria-[current=page]:hover:bg-primary/10 aria-[current=page]:hover:text-primary"
              [attr.aria-current]="number === page() ? 'page' : null"
              (click)="pageChange.emit(number)"
            >
              {{ number }}
            </button>
          }
          <button
            type="button"
            aria-label="Próxima página"
            class="grid h-6 min-w-6 place-items-center rounded-[4px] text-muted-foreground transition-colors enabled:hover:bg-muted enabled:hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            [disabled]="page() >= pages().length"
            (click)="pageChange.emit(page() + 1)"
          >
            <ng-icon name="lucideChevronRight" class="!size-[15px]" />
          </button>
        </nav>
      }
    </footer>
  `,
  host: { class: 'block' },
})
export class ListPager {
  /** How many rows the search and the filters keep, every page included. */
  readonly total = input.required<number>();
  /** The page shown, 1-based and already within the pages. */
  readonly page = input(1);
  /** What the rows are: "ordens", "embarcações", "clientes". */
  readonly noun = input.required<string>();
  readonly pageSize = input(PAGE_SIZE);
  readonly loading = input(false);

  readonly pageChange = output<number>();

  protected readonly pages = computed(() =>
    Array.from({ length: pageCount(this.total(), this.pageSize()) }, (_, index) => index + 1),
  );
  protected readonly range = computed(() => rangeLabel(this.total(), this.page(), this.pageSize()));
}
