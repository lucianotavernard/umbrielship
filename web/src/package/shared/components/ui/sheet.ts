import {
  Component,
  HostListener,
  computed,
  input,
  output,
} from '@angular/core';

import { ClassValue } from 'clsx';

import { cn } from '../lib/cn';

@Component({
  selector: 't-sheet',
  template: `
    @if (isActive()) {
      <div
        animate.enter="animate-fade-in duration-500"
        animate.leave="animate-fade-out duration-300"
        class="fixed inset-0 z-50 bg-[#121f2a]/40 duration-100 supports-backdrop-filter:backdrop-blur-[2px]"
        (click)="close()"
      ></div>

      <div
        role="dialog"
        aria-modal="true"
        data-slot="sheet-content"
        animate.enter="animate-in duration-500"
        animate.leave="animate-out duration-300"
        [class]="computedClass()"
        (keydown.escape)="close()"
      >
        <header
          class="flex items-start justify-between gap-5 border-b border-border bg-card"
          [class]="compact() ? 'px-[22px] pt-[22px] pb-[17px]' : 'px-[27px] pt-[25px] pb-[19px]'"
        >
          <div class="min-w-0">
            @if (kicker()) {
              <div data-slot="sheet-kicker" class="mb-2 text-[9px] font-bold tracking-[1.1px] text-primary">
                {{ kicker() }}
              </div>
            }
            <h2
              data-slot="sheet-title"
              class="leading-tight font-normal tracking-[-0.4px] text-foreground"
              [class]="compact() ? 'text-[17px]' : 'text-[20px]'"
            >
              {{ title() }}
            </h2>
            <p
              data-slot="sheet-description"
              class="mt-1.5 max-w-[430px] leading-[1.55] text-muted-foreground"
              [class]="compact() ? 'text-[10px]' : 'text-[11px]'"
            >
              {{ description() }}
            </p>
          </div>

          <button
            type="button"
            class="grid size-[31px] shrink-0 place-items-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden"
            [attr.aria-label]="closeLabel()"
            (click)="close()"
          >
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
              aria-hidden="true"
              class="size-[18px]"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </header>

        <!-- flush: the content lays out its own sections, scroll and footer, as the mareos drawers do. -->
        <div
          [class]="
            flush()
              ? 'flex min-h-0 flex-1 flex-col overflow-y-auto'
              : 'grid min-h-0 flex-1 auto-rows-min grid-cols-1 gap-6 overflow-y-auto px-4 pt-4 pb-4'
          "
        >
          <ng-content />
        </div>
      </div>
    }
  `,
  host: {
    'data-slot': 'sheet',
  },
})
export class Sheet {
  readonly class = input<ClassValue>('');

  readonly title = input('Sheet');
  readonly description = input('');
  readonly isActive = input(false);
  /** The small uppercase line above the title (mareos drawers: "RELACIONAMENTO / CLIENTES"). */
  readonly kicker = input('');
  readonly closeLabel = input('Fechar');
  /** True when the content brings its own padding, scroll and footer. */
  readonly flush = input(false);
  /** The smaller header of the mareos client drawer. */
  readonly compact = input(false);

  readonly closed = output<boolean>();

  protected readonly computedClass = computed(() =>
    cn(
      // Full width on a phone, where a quarter of the screen beside the sheet is wasted.
      'fixed inset-y-0 right-0 z-50 flex h-dvh w-full flex-col overflow-hidden border-l bg-background shadow-[-16px_0_45px_rgba(21,44,59,0.16)] sm:w-3/4 sm:max-w-sm',
      this.class(),
    ),
  );

  protected close() {
    this.closed.emit(true);
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.isActive()) {
      this.close();
    }
  }
}
