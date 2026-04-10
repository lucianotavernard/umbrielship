import { Component, computed, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideArrowRight, lucideEllipsis } from '@ng-icons/lucide';

import { generatePagesArray, outOfBoundCorrection } from '@/shared/util/paginate';
import { Button } from './button';

@Component({
  selector: 'pagination',
  template: `
    <div class="mx-auto flex w-full justify-center">
      <nav class="flex flex-row items-center gap-1">
        <div>
          @if (previousPage()) {
            <a variant="ghost" (click)="changePage(previousPage())">
              <ng-icon name="lucideArrowLeft" class="mr-3 text-muted-foreground !size-4" />
              Previous
            </a>
          }
        </div>

        <div class="flex gap-2">
          @for (item of pages(); track $index) {
            @if (!item) {
              <span class="flex size-9 items-center justify-center">
                <ng-icon name="lucideEllipsis" class="text-muted-foreground !size-4" />
                <span class="sr-only">More pages</span>
              </span>
            } @else if (item === page()) {
              <button type="button" variant="outline" [tabIndex]="-1">
                {{ item }}
              </button>
            } @else {
              <a variant="ghost" (click)="changePage(item)">
                {{ item }}
              </a>
            }
          }
        </div>

        <div>
          @if (nextPage()) {
            <a variant="ghost" (click)="changePage(nextPage())">
              Next
              <ng-icon name="lucideArrowRight" class="ml-3 text-muted-foreground !size-4" />
            </a>
          }
        </div>
      </nav>
    </div>
  `,
  imports: [NgIcon, Button],
  viewProviders: [provideIcons({ lucideArrowLeft, lucideArrowRight, lucideEllipsis })],
})
export class Pagination {
  page = input(0);
  total = input(0);
  perPage = input(20);
  totalEdges = input(7);

  totalPages = computed(() => Math.ceil(this.total() / this.perPage()));

  pages = computed(() => {
    const totalEdges = this.totalEdges();
    const perPage = this.perPage();
    const total = this.total();
    const page = this.page();

    const correctedCurrentPage = outOfBoundCorrection(total, perPage, page);
    return generatePagesArray(correctedCurrentPage, perPage, total, totalEdges);
  });

  previousPage = computed(() => (this.page() > 1 ? this.page() - 1 : 0));
  nextPage = computed(() => (this.page() < this.totalPages() ? this.page() + 1 : 0));

  changed = output<number>();

  changePage(page: number) {
    if (page && page !== this.page()) {
      this.changed.emit(page);
    }
  }
}
