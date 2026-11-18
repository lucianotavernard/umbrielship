import { Component, input } from '@angular/core';

/** A repeated block inside a drawer card, as "Serviço 1": its title, its actions, then its fields. */
@Component({
  selector: 'div[tDrawerEntry]',
  template: `
    <div class="flex items-center justify-between gap-2">
      <strong class="text-[11px] font-semibold text-foreground">{{ heading() }}</strong>
      <ng-content select="[tDrawerEntryActions]" />
    </div>
    <ng-content />
  `,
  host: {
    role: 'group',
    '[attr.aria-label]': 'heading()',
    class: 'flex flex-col gap-[12px] rounded-[9px] border border-border p-[13px]',
  },
})
export class DrawerEntry {
  readonly heading = input.required<string>();
}
