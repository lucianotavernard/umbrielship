import { Component, effect, input, output, signal } from '@angular/core';
import { applyEach, form, FormField, validate } from '@angular/forms/signals';

import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowDown,
  lucideArrowUp,
  lucideCheck,
  lucideClipboardList,
  lucideLoader2,
  lucidePlus,
  lucideTrash,
  lucideX,
} from '@ng-icons/lucide';

import { Button } from '../../../shared/components/ui/button';
import { FormGroup, Input, Label } from '../../../shared/components/ui/form';
import {
  InspectionTemplate,
  InspectionTemplateRequest,
  MAX_NAME_LENGTH,
  MAX_QUESTION_LENGTH,
  MAX_QUESTIONS,
} from '../inspection-template.service';

type Model = { name: string; items: { label: string }[] };

const empty = (): Model => ({ name: '', items: [{ label: '' }] });

// The API trims every text before checking it, so the form checks the trimmed text too.
const blank = (message: string) => ({ value }: { value: () => string }) =>
  value().trim() === '' ? { kind: 'required', message } : undefined;

const longerThan = (limit: number, message: string) => ({ value }: { value: () => string }) =>
  value().trim().length > limit ? { kind: 'maxLength', message } : undefined;

@Component({
  selector: 'inspection-template-form-ui',
  imports: [NgIcon, FormField, FormGroup, Label, Input, Button],
  viewProviders: [
    provideIcons({
      lucideArrowDown,
      lucideArrowUp,
      lucideCheck,
      lucideClipboardList,
      lucideLoader2,
      lucidePlus,
      lucideTrash,
      lucideX,
    }),
  ],
  template: `
    <form class="flex flex-col gap-6" novalidate (submit)="submitForm($event)">
      <section class="overflow-hidden rounded-2xl border shadow-xs">
        <div class="flex items-center gap-3 border-b bg-muted px-4 py-4 sm:px-6">
          <div class="flex rounded-lg bg-background p-3 shadow-xs">
            <ng-icon name="lucideClipboardList" class="size-3" />
          </div>
          <div>
            <h3 class="text-sm font-semibold">Modelo</h3>
            <p class="text-xs text-muted-foreground">Nome e perguntas, na ordem em que serão feitas</p>
          </div>
        </div>
        <div class="flex flex-col gap-5 p-4 sm:p-6">
          <t-form-group>
            <label tLabel for="template-name">Nome</label>
            <input
              tInput
              id="template-name"
              type="text"
              placeholder="Pintura do casco"
              [formField]="templateForm.name"
            />
          </t-form-group>

          <ol class="flex flex-col gap-4">
            @for (item of model().items; track $index; let index = $index, first = $first, last = $last) {
              <li class="flex flex-col gap-2">
                <t-form-group>
                  <label tLabel [for]="'question-' + index">Pergunta {{ index + 1 }}</label>
                  <input
                    tInput
                    type="text"
                    [id]="'question-' + index"
                    placeholder="O casco está limpo?"
                    [formField]="templateForm.items[index].label"
                  />
                </t-form-group>
                <div class="flex items-center justify-end gap-1">
                  <button
                    tButton
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    aria-label="Subir"
                    title="Subir"
                    [disabled]="first"
                    (click)="move(index, -1)"
                  >
                    <ng-icon name="lucideArrowUp" class="size-4" />
                  </button>
                  <button
                    tButton
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    aria-label="Descer"
                    title="Descer"
                    [disabled]="last"
                    (click)="move(index, 1)"
                  >
                    <ng-icon name="lucideArrowDown" class="size-4" />
                  </button>
                  <button
                    tButton
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    aria-label="Remover"
                    title="Remover"
                    [disabled]="model().items.length === 1"
                    (click)="remove(index)"
                  >
                    <ng-icon name="lucideTrash" class="size-4" />
                  </button>
                </div>
              </li>
            }
          </ol>

          <button
            tButton
            type="button"
            variant="outline"
            [disabled]="model().items.length >= maxQuestions"
            (click)="add()"
          >
            <ng-icon name="lucidePlus" class="size-4" />
            Adicionar pergunta
          </button>
        </div>
      </section>
      <footer class="flex items-center justify-end gap-3">
        <button tButton type="button" variant="outline" (click)="closed.emit()">
          <ng-icon name="lucideX" class="size-4" />
          Cancelar
        </button>
        <button tButton type="submit" [disabled]="loading()">
          @if (loading()) {
            <ng-icon name="lucideLoader2" class="animate-spin" />
            Salvando...
          } @else {
            <ng-icon name="lucideCheck" class="size-4" />
            Salvar
          }
        </button>
      </footer>
    </form>
  `,
})
export class InspectionTemplateForm {
  inspectionTemplate = input<InspectionTemplate | null>(null);
  loading = input(false);

  submitted = output<InspectionTemplateRequest>();
  closed = output<void>();

  protected readonly maxQuestions = MAX_QUESTIONS;

  model = signal<Model>(empty());

  templateForm = form(this.model, (path) => {
    validate(path.name, blank('Nome é obrigatório'));
    validate(
      path.name,
      longerThan(MAX_NAME_LENGTH, `Nome deve ter no máximo ${MAX_NAME_LENGTH} caracteres`),
    );
    applyEach(path.items, (item) => {
      validate(item.label, blank('Pergunta é obrigatória'));
      validate(
        item.label,
        longerThan(MAX_QUESTION_LENGTH, `Pergunta deve ter no máximo ${MAX_QUESTION_LENGTH} caracteres`),
      );
    });
  });

  constructor() {
    effect(() => {
      const template = this.inspectionTemplate();

      if (template) {
        this.model.set({
          name: template.name,
          items: [...template.items]
            .sort((a, b) => a.position - b.position)
            .map((item) => ({ label: item.label })),
        });
      }
    });
  }

  add() {
    this.model.update((model) =>
      model.items.length >= MAX_QUESTIONS
        ? model
        : { ...model, items: [...model.items, { label: '' }] },
    );
  }

  move(index: number, offset: -1 | 1) {
    this.model.update((model) => {
      const target = index + offset;
      if (target < 0 || target >= model.items.length) return model;

      const items = [...model.items];
      [items[index], items[target]] = [items[target], items[index]];
      return { ...model, items };
    });
  }

  remove(index: number) {
    this.model.update((model) =>
      model.items.length === 1
        ? model
        : { ...model, items: model.items.filter((_, position) => position !== index) },
    );
  }

  reset() {
    this.templateForm().reset(empty());
  }

  submitForm(event: Event) {
    event.preventDefault();
    this.templateForm().markAsTouched();

    if (this.templateForm().invalid()) {
      return;
    }

    const { name, items } = this.templateForm().value();
    this.submitted.emit({
      name: name.trim(),
      items: items.map((item) => ({ label: item.label.trim() })),
    });
  }
}
