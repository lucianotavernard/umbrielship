import { Component, computed, contentChildren, inject, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';

import type { ClassValue } from 'clsx';

import { cn } from '../../lib/cn';
import { DrawerForm } from '../drawer/drawer-form';
import { InputError } from './input-error';

@Component({
  selector: 't-form-group',
  imports: [InputError],
  template: `
    <ng-content />

    @if (drawer) {
      <!-- In a drawer: one message per invalid field, only once the save button was used (AD-057). -->
      @if (drawer.shown()) {
        @for (binding of fields(); track $index) {
          @if (binding.errors()[0]; as error) {
            <p data-slot="error" class="text-[10px] font-medium text-destructive">{{ error.message }}</p>
          }
        }
      }
    } @else {
      @for (binding of fields(); track $index) {
        @if (binding.state().touched()) {
          @for (error of binding.errors(); track $index) {
            <t-input-error>{{ error.message }}</t-input-error>
          }
        }
      }
    }
  `,
  host: {
    '[class]': 'computedClass()',
  },
})
export class FormGroup {
  readonly class = input<ClassValue>('');

  protected readonly drawer = inject(DrawerForm, { optional: true });

  protected readonly fields = contentChildren(FormField, { descendants: true });

  protected readonly computedClass = computed(() =>
    cn(
      'group/field flex w-full gap-3 data-[invalid=true]:text-destructive flex-col [&>*]:w-full [&>.sr-only]:w-auto',
      this.drawer && 'gap-[7px]',
      this.class(),
    ),
  );
}
