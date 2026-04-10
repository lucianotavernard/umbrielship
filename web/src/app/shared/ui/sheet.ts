import { Component, computed, input, output } from '@angular/core';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideX } from '@ng-icons/lucide';

import { ClassValue } from 'clsx';

import { cn } from '../util/cn';

import { Button } from './button';

@Component({
  selector: 'sheet',
  template: `
    <div class="relative z-50" role="dialog" aria-modal="true">
      @if (isActive()) {
        <!-- Sheet Backdrop -->
        <div
          animate.enter="animate-fade-in duration-500"
          animate.leave="animate-fade-out duration-300"
          class="fixed inset-0 z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs"
          (click)="close()"
        ></div>
      }

      @if (isActive()) {
        <!-- Sheet Content -->
        <div
          data-slot="sheet-content"
          animate.enter="animate-in duration-500 slide-in-from-right"
          animate.leave="animate-out duration-300 slide-out-to-right"
          [class]="computedClass()"
        >
          <!-- Sheet Header -->
          <header class="flex flex-col gap-1.5 p-4">
            <h3 data-slot="sheet-title" class="text-foreground font-semibold">
              {{ title() }}
            </h3>
            <p data-slot="sheet-description" class="text-sm text-muted-foreground">
              {{ description() }}
            </p>
          </header>

          <div class="grid flex-1 auto-rows-min gap-6 px-4">
            <ng-content></ng-content>
          </div>

          <button
            type="button"
            variant="ghost"
            size="icon-sm"
            class="absolute top-4 end-4 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none"
            (click)="close()"
          >
            <span class="sr-only">Fechar</span>
            <ng-icon name="lucideX" class="!size-4" />
          </button>
        </div>
      }
    </div>
  `,
  imports: [NgIcon, Button],
  viewProviders: [provideIcons({ lucideX })],
  host: {
    'data-slot': 'sheet',
  },
})
export class Sheet {
  class = input<ClassValue>('');

  title = input('Sheet');
  description = input('Sheet description');
  isActive = input(false);

  closed = output<boolean>();

  computedClass = computed(() =>
    cn(
      'fixed z-50 flex flex-col gap-4 bg-background shadow-lg transition ease-in-out inset-y-0 right-0 h-full w-3/4 sm:max-w-sm border-l',
      this.class(),
    ),
  );

  close() {
    this.closed.emit(true);
  }
}
