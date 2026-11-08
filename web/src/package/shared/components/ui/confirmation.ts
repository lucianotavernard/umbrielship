import { Component, HostListener, computed, input, output } from '@angular/core';

import { ClassValue } from 'clsx';

import { Button } from './button';
import { cn } from '../lib/cn';

@Component({
  selector: 't-confirmation',
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
        data-slot="dialog-content"
        animate.enter="animate-slide-in duration-500"
        animate.leave="animate-slide-out duration-300"
        [class]="computedClass()"
        (keydown.escape)="close()"
      >
          <header class="flex flex-col gap-1.5">
            <h2 data-slot="dialog-title" class="text-base font-medium text-foreground">
              {{ title() }}
            </h2>
            <p
              data-slot="dialog-description"
              class="text-sm text-balance text-muted-foreground md:text-pretty"
            >
              {{ description() }}
            </p>
          </header>

          <ng-content />

          <footer
            class="-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end"
          >
            <button tButton type="button" variant="outline" (click)="close()">
              {{ cancelLabel() }}
            </button>
            <button tButton type="button" [disabled]="loading()" (click)="confirm()">
              {{ confirmLabel() }}
            </button>
          </footer>
        </div>
    }
  `,
  imports: [Button],
  host: {
    'data-slot': 'dialog',
    class: 'contents',
  },
})
export class Confirmation {
  readonly class = input<ClassValue>('');

  readonly title = input('Confirmar');
  readonly description = input('');
  readonly isActive = input(false);
  // True while the confirmed action runs: Confirm stays disabled so it is not sent twice.
  readonly loading = input(false);
  readonly confirmLabel = input('Confirmar');
  readonly cancelLabel = input('Cancelar');

  readonly closed = output<boolean>();
  readonly confirmed = output<boolean>();

  protected readonly computedClass = computed(() =>
    cn(
      'fixed top-1/2 left-1/2 z-50 grid w-full max-w-xs -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-popover p-4 text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none sm:max-w-sm',
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

  protected confirm() {
    if (this.loading()) return;
    this.confirmed.emit(true);
  }
}
