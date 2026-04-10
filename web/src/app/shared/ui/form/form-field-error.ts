import { KeyValuePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { ValidationErrors } from '@angular/forms';

import { InputError } from './input-error';

@Component({
  selector: 'form-field-error',
  imports: [KeyValuePipe, InputError],
  template: `
    @if (errors(); as errors) {
      @for (error of errors | keyvalue; track $index) {
        @switch (error.key) {
          @case ('required') {
            <input-error>Este campo é obrigatório</input-error>
          }

          @case ('minlength') {
            <input-error>Este valor é muito curto</input-error>
          }

          @case ('maxlength') {
            <input-error>Este valor é muito longo</input-error>
          }

          @case ('email') {
            <input-error>O e-mail não é válido</input-error>
          }

          @case ('min') {
            <input-error>O valor mínimo é {{ error.value.min }}</input-error>
          }

          @case ('max') {
            <input-error>O valor máximo é {{ error.value.max }}</input-error>
          }

          @case ('pattern') {
            <input-error>Este campo é inválido</input-error>
          }

          @default {
            <input-error>{{ error.value }}</input-error>
          }
        }
      }
    }
  `,
})
export class FormFieldError {
  errors = input<ValidationErrors | undefined | null>(null);
}
