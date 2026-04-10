import { Component, computed, input, output } from '@angular/core';

import { ClassValue } from 'clsx';

import { cn } from '../util/cn';

import { Button } from './button';

@Component({
  selector: 'confirmation',
  template: `
    <div class="relative z-50" role="dialog" aria-modal="true">
      @if (isActive()) {
        <!-- Dialog Backdrop -->
        <div
          animate.enter="animate-fade-in duration-500"
          animate.leave="animate-fade-out duration-300"
          class="fixed inset-0 z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs"
          (click)="close()"
        ></div>
      }

      @if (isActive()) {
        <!-- Dialog Content -->
        <div
          data-slot="dialog-content"
          animate.enter="animate-slide-in duration-500"
          animate.leave="animate-slide-out duration-300"
          [class]="computedClass()"
        >
          <!-- Dialog Header -->
          <header class="flex flex-col gap-1.5">
            <h3 data-slot="dialog-title" class="text-foreground text-base font-medium">
              {{ title() }}
            </h3>
            <p
              data-slot="dialog-description"
              class="text-sm text-balance text-muted-foreground md:text-pretty"
            >
              {{ description() }}
            </p>
          </header>

          <footer
            class="-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end"
          >
            <button type="button" variant="outline" (click)="close()">Cancelar</button>
            <button type="button" (click)="confirm()">Confirmar</button>
          </footer>
        </div>
      }
    </div>
  `,
  imports: [Button],
  host: {
    'data-slot': 'dialog',
  },
})
export class Confirmation {
  class = input<ClassValue>('');

  title = input('Sheet');
  description = input('Sheet description');
  isActive = input(false);

  closed = output<boolean>();
  confirmed = output<boolean>();

  computedClass = computed(() =>
    cn(
      'fixed top-1/2 left-1/2 z-50 grid w-full max-w-xs sm:max-w-sm -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-popover p-4 text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none',
      this.class(),
    ),
  );

  close() {
    this.closed.emit(true);
  }

  confirm() {
    this.confirmed.emit(true);
  }
}
