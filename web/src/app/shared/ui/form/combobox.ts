import { Component, computed, effect, input, model, viewChild } from '@angular/core';
import { FormValueControl, ValidationError } from '@angular/forms/signals';

import {
  NgLabelTemplateDirective,
  NgOptionTemplateDirective,
  NgSelectComponent,
} from '@ng-select/ng-select';

import { type VariantProps, cva } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

import { cn } from '../../util/cn';

export const comboboxVariants = cva(
  'flex items-center w-full rounded-md border border-input bg-transparent py-1 px-3 h-9 cursor-pointer placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30',
  {
    variants: {
      error: {
        auto: '[&.ng-invalid.ng-touched]:text-destructive [&.ng-invalid.ng-touched]:border-destructive [&.ng-invalid.ng-touched]:focus-visible:ring-destructive',
        true: 'text-destructive border-destructive focus-visible:ring-destructive',
      },
    },
    defaultVariants: {
      error: 'auto',
    },
  },
);

type ComboboxVariants = VariantProps<typeof comboboxVariants>;

export type ComboboxOption = {
  value: number | string;
  label: string;
  disabled?: boolean;
};

@Component({
  selector: 'combobox',
  imports: [NgSelectComponent, NgLabelTemplateDirective, NgOptionTemplateDirective],
  template: `
    <ng-select
      #select
      appendTo="body"
      bindLabel="label"
      bindValue="value"
      [items]="options()"
      [class]="computedClass()"
      [placeholder]="placeholder()"
      [fixedPlaceholder]="fixedPlaceholder()"
      [virtualScroll]="true"
      [searchable]="true"
      [clearable]="false"
      (change)="change($event)"
      (blur)="touched.set(true)"
    >
      <ng-template ng-option-tmp let-item="item">
        <div
          class="relative flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none hover:bg-accent hover:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
        >
          {{ item.label }}
        </div>
      </ng-template>

      <ng-template ng-label-tmp let-item="item">
        <div class="inline-flex items-center w-full space-x-2 h-6 font-normal">
          {{ item.label }}
        </div>
      </ng-template>
    </ng-select>

    <div class="absolute right-0 flex items-center pr-2.5 cursor-pointer" (click)="select?.toggle()">
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
        class="!size-3.5 opacity-50"
      >
        <path d="m7 15 5 5 5-5"></path>
        <path d="m7 9 5-5 5 5"></path>
      </svg>
    </div>
  `,
  host: {
    class: 'relative flex items-center',
  },
})
export class Combobox implements FormValueControl<string> {
  private readonly select = viewChild(NgSelectComponent);

  class = input<ClassValue>('');
  error = input<ComboboxVariants['error']>('auto');

  placeholder = input('');

  options = input<ComboboxOption[]>([]);

  value = model('');

  disabled = input(false);
  touched = model(false);
  invalid = input(false);
  name = input('');
  required = input(false);
  readonly = input(false);

  fixedPlaceholder = computed(() => !this.value());
  computedClass = computed(() => cn(comboboxVariants({ error: this.error() }), this.class()));

  constructor() {
    effect(() => {
      const value = this.value();
      const select = this.select();

      console.log(value);

      if (select) {
        select.writeValue(value);
      }
    });
  }

  blur() {
    this.touched.set(true);
  }

  change(event: any) {
    this.value.set(event.value);
    this.select()?.blur();
  }
}
