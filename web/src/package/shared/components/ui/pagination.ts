import { Component, computed, input, output } from '@angular/core';

import { Button } from './button';

type Page = number | undefined;

@Component({
  selector: 't-pagination',
  imports: [Button],
  template: `
    <div class="mx-auto flex w-full justify-center">
      <nav class="flex flex-row items-center gap-1">
        <div>
          @if (previousPage()) {
            <a tButton variant="ghost" (click)="changePage(previousPage())">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-arrow-left preview-icon mr-3 text-muted-foreground size-4"
              >
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
              </svg>
              Anterior
            </a>
          }
        </div>

        <div class="flex gap-2">
          @for (item of pages(); track $index) {
            @if (!item) {
              <span class="flex size-9 items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-ellipsis preview-icon text-muted-foreground size-4"
                >
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="19" cy="12" r="1" />
                  <circle cx="5" cy="12" r="1" />
                </svg>
                <span class="sr-only">Mais páginas</span>
              </span>
            } @else if (item === page()) {
              <button
                tButton
                type="button"
                variant="outline"
                [tabIndex]="-1"
              >
                {{ item }}
              </button>
            } @else {
              <a tButton variant="ghost" (click)="changePage(item)">
                {{ item }}
              </a>
            }
          }
        </div>

        <div>
          @if (nextPage()) {
            <a tButton variant="ghost" (click)="changePage(nextPage())">
              Próxima

              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-arrow-right preview-icon ml-3 text-muted-foreground size-4"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </a>
          }
        </div>
      </nav>
    </div>
  `,
})
export class Pagination {
  page = input(0);
  total = input(0);
  perPage = input(10);
  totalEdges = input(7);

  totalPages = computed(() => Math.ceil(this.total() / this.perPage()));

  pages = computed(() => {
    const totalEdges = this.totalEdges();
    const perPage = this.perPage();
    const total = this.total();
    const page = this.page();

    const correctedCurrentPage = this.outOfBoundCorrection(total, perPage, page);
    return this.generatePagesArray(correctedCurrentPage, perPage, total, totalEdges);
  });

  previousPage = computed(() => (this.page() > 1 ? this.page() - 1 : 0));
  nextPage = computed(() =>
    this.page() < this.totalPages() ? this.page() + 1 : 0,
  );

  changed = output<number>();

  changePage(page: number) {
    if (page && page !== this.page()) {
      this.changed.emit(page);
    }
  }

  private calculatePageNumber(index: number, currentPage: number, paginationRange: number, totalPages: number) {
    const halfWay = Math.ceil(paginationRange / 2);
  
    if (index === paginationRange) {
      return totalPages;
    }
  
    if (index === 1) {
      return index;
    }
  
    if (paginationRange < totalPages) {
      if (totalPages - halfWay < currentPage) {
        return totalPages - paginationRange + index;
      }
  
      if (halfWay < currentPage) {
        return currentPage - halfWay + index;
      }
  
      return index;
    }
  
    return index;
  }
  
  private generatePagesArray(currentPage: number, itemsPerPage: number, totalItems: number, paginationRange = 7) {
    paginationRange = +paginationRange;
    const pages: Page[] = [];
  
    const totalPages = Math.max(Math.ceil(totalItems / itemsPerPage), 1);
    const halfWay = Math.ceil(paginationRange / 2);
  
    const isStart = currentPage <= halfWay;
    const isEnd = totalPages - halfWay < currentPage;
    const isMiddle = !isStart && !isEnd;
  
    const ellipsesNeeded = paginationRange < totalPages;
    let index = 1;
  
    while (index <= totalPages && index <= paginationRange) {
      let label: number | undefined = undefined;
  
      const pageNumber = this.calculatePageNumber(index, currentPage, paginationRange, totalPages);
      const openingEllipsesNeeded = index === 2 && (isMiddle || isEnd);
      const closingEllipsesNeeded = index === paginationRange - 1 && (isMiddle || isStart);
  
      if (!(ellipsesNeeded && (openingEllipsesNeeded || closingEllipsesNeeded))) {
        label = pageNumber;
      }
  
      pages.push(label);
      index++;
    }
  
    return pages;
  }
  
  private outOfBoundCorrection(totalItems: number, itemsPerPage: number, currentPage: number) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
  
    if (totalPages < currentPage && 0 < totalPages) {
      return totalPages;
    }
  
    if (currentPage < 1) {
      return 1;
    }
  
    return currentPage;
  }
}
