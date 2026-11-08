import {
  Component,
  HostListener,
  computed,
  input,
  output,
} from '@angular/core';

import { ClassValue } from 'clsx';

import { Button } from './button';
import { cn } from '../lib/cn';

@Component({
  selector: 't-sheet',
  template: `
    @if (isActive()) {
      <div
        animate.enter="animate-fade-in duration-500"
        animate.leave="animate-fade-out duration-300"
        class="fixed inset-0 z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs"
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
        <header class="flex flex-col gap-1.5 p-4">
          <h2 data-slot="sheet-title" class="font-semibold text-foreground">
            {{ title() }}
          </h2>
          <p
            data-slot="sheet-description"
            class="text-sm text-muted-foreground"
          >
            {{ description() }}
          </p>
        </header>

        <div
          class="grid min-h-0 flex-1 auto-rows-min gap-6 overflow-y-auto px-4 pb-4"
        >
          <ng-content />
        </div>

        <button
          tButton
          type="button"
          variant="ghost"
          size="icon-sm"
          class="absolute top-4 end-4 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none"
          (click)="close()"
        >
          <span class="sr-only">Fechar</span>
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
            class="lucide lucide-x preview-icon size-4"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>
    }
  `,
  imports: [Button],
  host: {
    'data-slot': 'sheet',
  },
})
export class Sheet {
  readonly class = input<ClassValue>('');

  readonly title = input('Sheet');
  readonly description = input('');
  readonly isActive = input(false);

  readonly closed = output<boolean>();

  protected readonly computedClass = computed(() =>
    cn(
      'fixed inset-y-0 right-0 z-50 flex h-full w-3/4 flex-col gap-4 overflow-hidden border-l bg-background shadow-lg sm:max-w-sm',
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
