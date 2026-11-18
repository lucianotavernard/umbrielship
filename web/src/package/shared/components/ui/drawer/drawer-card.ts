import { Component, computed, input } from '@angular/core';

import { NgIcon } from '@ng-icons/core';

import { cn } from '../../lib/cn';

/**
 * A card of a drawer: a header with the icon tile, the title and the subtitle, then its fields.
 * The icon is a lucide name the form provides (`provideIcons`).
 */
@Component({
  selector: 'section[tDrawerCard]',
  imports: [NgIcon],
  template: `
    <header
      class="flex min-h-[62px] items-center gap-[11px] border-b border-border bg-[#f3f7f8] px-[15px] py-[11px] dark:bg-muted"
    >
      <span
        data-slot="drawer-card-icon"
        [attr.data-icon]="icon()"
        class="grid size-[34px] shrink-0 place-items-center rounded-lg bg-[#e3f0ef] text-primary dark:bg-[#17302f]"
      >
        <ng-icon [name]="icon()" class="!size-[17px]" />
      </span>
      <span>
        <strong data-slot="drawer-card-title" class="block text-[12px] font-semibold text-foreground">{{ heading() }}</strong>
        <small data-slot="drawer-card-subtitle" class="mt-0.5 block text-[10px] text-muted-foreground">{{ subheading() }}</small>
      </span>
    </header>
    <div data-slot="drawer-card-body" [class]="bodyClass()">
      <ng-content />
    </div>
  `,
  host: {
    'data-slot': 'drawer-card',
    class: 'block shrink-0 overflow-hidden rounded-[11px] border border-border bg-card',
  },
})
export class DrawerCard {
  readonly heading = input.required<string>();
  readonly subheading = input('');
  readonly icon = input.required<string>();
  /** Two columns from `sm`, as the reference's "Planejamento". */
  readonly columns = input<1 | 2>(1);

  protected readonly bodyClass = computed(() =>
    cn('grid grid-cols-1 gap-[14px] px-[18px] pt-4 pb-[18px]', this.columns() === 2 && 'sm:grid-cols-2'),
  );
}
