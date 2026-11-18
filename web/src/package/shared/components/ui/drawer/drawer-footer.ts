import { Component, input, output } from '@angular/core';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideLoader2, lucideX } from '@ng-icons/lucide';

import { Button } from '../button';

/**
 * The pinned footer of a drawer: "* Campos obrigatórios", "Cancelar" with an X and the save button
 * with a check (AD-053). With no `submitLabel` it shows only "Cancelar".
 */
@Component({
  selector: 'footer[tDrawerFooter]',
  imports: [NgIcon, Button],
  viewProviders: [provideIcons({ lucideCheck, lucideLoader2, lucideX })],
  template: `
    @if (submitLabel()) {
      <span data-slot="required-hint" class="text-[10px] text-muted-foreground">
        <span class="text-destructive">*</span> Campos obrigatórios
      </span>
    }
    <div class="ml-auto flex items-center gap-1.5 sm:gap-2">
      <button tButton type="button" variant="outline" class="h-[35px] bg-card text-[11px]" (click)="cancelled.emit()">
        <ng-icon name="lucideX" class="!size-3.5" />
        Cancelar
      </button>
      @if (submitLabel()) {
        <button tButton type="submit" class="h-[35px] px-[13px] text-[11px] font-semibold" [disabled]="loading()">
          @if (loading()) {
            <ng-icon name="lucideLoader2" class="animate-spin" />
            Salvando...
          } @else {
            <ng-icon name="lucideCheck" class="!size-[15px]" />
            {{ submitLabel() }}
          }
        </button>
      }
    </div>
  `,
  host: {
    'data-slot': 'drawer-footer',
    class:
      'flex min-h-[70px] shrink-0 flex-wrap items-center justify-between gap-3 border-t border-border bg-card px-[14px] py-[11px] sm:px-[25px] sm:py-3',
  },
})
export class DrawerFooter {
  /** What the save button says (AD-054); empty when the drawer has nothing to save. */
  readonly submitLabel = input('');
  readonly loading = input(false);

  readonly cancelled = output<void>();
}
