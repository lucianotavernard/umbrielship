import { Component, input } from '@angular/core';

/** A mareos summary card: an icon, a label, a two-digit value and a note in the corner. */
@Component({
  selector: 't-metric',
  template: `
    <span
      class="grid size-[33px] shrink-0 place-items-center rounded-lg"
      [class]="tones[tone()]"
      aria-hidden="true"
    >
      <ng-content />
    </span>
    <div class="min-w-0 flex-1">
      <span class="block text-[10px] whitespace-nowrap text-muted-foreground">{{ label() }}</span>
      <strong data-slot="metric-value" class="mt-[5px] block text-[19px] leading-none font-bold text-foreground">
        {{ value() }}
      </strong>
    </div>
    @if (note()) {
      <small class="mb-0.5 hidden self-end text-[9px] whitespace-nowrap text-muted-foreground lg:block">
        {{ note() }}
      </small>
    }
  `,
  host: {
    'data-slot': 'metric',
    class:
      'flex min-h-[78px] items-center gap-[11px] rounded-lg border border-border bg-card px-[15px] py-[14px]',
  },
})
export class Metric {
  readonly label = input.required<string>();
  /** Already formatted, two digits at least ("08"). */
  readonly value = input.required<string>();
  readonly note = input('');
  readonly tone = input<'blue' | 'teal' | 'amber' | 'green'>('blue');

  protected readonly tones = {
    blue: 'bg-[#edf3fa] text-[#5e8bb5] dark:bg-[#18283a] dark:text-[#8db4dc]',
    teal: 'bg-[#e9f3f3] text-[#4b9295] dark:bg-[#17302f] dark:text-[#7cc7c2]',
    amber: 'bg-[#fbf4e7] text-[#c78753] dark:bg-[#30291f] dark:text-[#e2c18b]',
    green: 'bg-[#eaf5ef] text-[#498b68] dark:bg-[#15291f] dark:text-[#8fcfab]',
  };
}

/** "8" -> "08": the mareos pads every count to two digits. */
export function twoDigits(count: number): string {
  return String(count).padStart(2, '0');
}
