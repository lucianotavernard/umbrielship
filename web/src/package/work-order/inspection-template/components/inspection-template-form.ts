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
import { FormGroup, Input, Label, Select } from '../../../shared/components/ui/form';
import {
  InspectionTemplate,
  InspectionTemplateRequest,
  MAX_NAME_LENGTH,
  MAX_QUESTION_LENGTH,
  MAX_QUESTIONS,
  QUESTION_TYPES,
  QuestionType,
} from '../inspection-template.service';

type Model = { name: string; items: { label: string; type: QuestionType }[] };

const blankQuestion = () => ({ label: '', type: 'CONFORMITY' as QuestionType });

const empty = (): Model => ({ name: '', items: [blankQuestion()] });

// The API trims every text before checking it, so the form checks the trimmed text too.
const blank = (message: string) => ({ value }: { value: () => string }) =>
  value().trim() === '' ? { kind: 'required', message } : undefined;

const longerThan = (limit: number, message: string) => ({ value }: { value: () => string }) =>
  value().trim().length > limit ? { kind: 'maxLength', message } : undefined;

@Component({
  selector: 'inspection-template-form-ui',
  imports: [NgIcon, FormField, FormGroup, Label, Input, Select, Button],
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
  host: { class: 'flex min-h-0 flex-1 flex-col' },
  template: `
    <form class="flex min-h-0 flex-1 flex-col" novalidate (submit)="submitForm($event)">
      <div class="flex min-h-0 flex-1 flex-col gap-[15px] overflow-y-auto overscroll-y-contain px-[18px] py-[18px] sm:px-[25px]">
        <t-form-group class="gap-[7px]">
          <label tLabel for="template-name" class="text-[10px] font-semibold">Nome do modelo</label>
          <input
            tInput
            id="template-name"
            type="text"
            class="text-[11px] md:text-[11px]"
            placeholder="Ex.: Inspeção do casco"
            [formField]="templateForm.name"
          />
        </t-form-group>

        <div class="flex items-end justify-between gap-3">
          <div>
            <h3 class="text-[12px] font-semibold text-foreground">Perguntas</h3>
            <p class="mt-1 text-[10px] text-muted-foreground">
              Todas as perguntas precisam ser respondidas; “Não se aplica” vale como resposta.
            </p>
          </div>
          <button
            type="button"
            class="inline-flex h-[29px] shrink-0 items-center gap-1.5 rounded-[5px] border border-border bg-card px-2.5 text-[10px] font-semibold text-primary hover:bg-primary/5 disabled:opacity-50"
            [disabled]="model().items.length >= maxQuestions"
            (click)="add()"
          >
            <ng-icon name="lucidePlus" class="!size-3.5" />
            Adicionar
          </button>
        </div>

        <ol class="flex flex-col gap-[11px]">
          @for (item of model().items; track $index; let index = $index, first = $first, last = $last) {
            <li
              data-slot="question-editor"
              class="flex flex-col gap-[11px] rounded-[9px] border border-border bg-muted/40 p-[13px]"
              [attr.aria-label]="'Pergunta ' + (index + 1)"
            >
              <div class="flex items-center justify-between gap-2">
                <strong class="text-[11px] font-semibold text-foreground">Pergunta {{ number(index) }}</strong>
                <div class="flex items-center gap-1">
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
                  @if (model().items.length > 1) {
                    <button
                      tButton
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      class="hover:text-destructive"
                      [attr.aria-label]="'Remover pergunta ' + (index + 1)"
                      [title]="'Remover pergunta ' + (index + 1)"
                      (click)="remove(index)"
                    >
                      <ng-icon name="lucideTrash" class="size-4" />
                    </button>
                  }
                </div>
              </div>
              <t-form-group class="gap-[7px]">
                <label tLabel [for]="'question-' + index" class="text-[10px] font-semibold">Enunciado</label>
                <input
                  tInput
                  type="text"
                  class="bg-card text-[11px] md:text-[11px]"
                  [id]="'question-' + index"
                  placeholder="Digite a pergunta"
                  [formField]="templateForm.items[index].label"
                />
              </t-form-group>
              <t-form-group class="gap-[7px]">
                <label tLabel [for]="'question-type-' + index" class="text-[10px] font-semibold">Tipo de resposta</label>
                <select
                  tSelect
                  class="bg-card text-[11px]"
                  [id]="'question-type-' + index"
                  [formField]="templateForm.items[index].type"
                >
                  @for (type of questionTypes; track type) {
                    <option [value]="type">{{ optionLabels[type] }}</option>
                  }
                </select>
              </t-form-group>
            </li>
          }
        </ol>
      </div>

      <footer class="flex min-h-[70px] shrink-0 items-center justify-end gap-2 border-t border-border bg-card px-[14px] py-[11px] sm:px-[25px]">
        <button tButton type="button" variant="outline" class="h-[35px] text-[11px]" (click)="closed.emit()">
          <ng-icon name="lucideX" class="!size-3.5" />
          Cancelar
        </button>
        <button tButton type="submit" class="h-[35px] px-[13px] text-[11px] font-semibold" [disabled]="loading()">
          @if (loading()) {
            <ng-icon name="lucideLoader2" class="animate-spin" />
            Salvando...
          } @else {
            <ng-icon name="lucidePlus" class="!size-[15px]" />
            {{ inspectionTemplate() ? 'Salvar alterações' : 'Criar modelo' }}
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
  protected readonly questionTypes = QUESTION_TYPES;
  /** The mareos "Tipo de resposta" options, plus the score the umbrielship also asks (AD-019). */
  protected readonly optionLabels: Record<QuestionType, string> = {
    TEXT: 'Texto livre',
    YES_NO: 'Sim ou não',
    CONFORMITY: 'Conforme / não conforme',
    SCORE: 'Nota de 0 a 10',
  };
  protected readonly number = (index: number) => String(index + 1).padStart(2, '0');

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
            .map((item) => ({ label: item.label, type: item.type })),
        });
      }
    });
  }

  add() {
    this.model.update((model) =>
      model.items.length >= MAX_QUESTIONS
        ? model
        : { ...model, items: [...model.items, blankQuestion()] },
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
      items: items.map((item) => ({ label: item.label.trim(), type: item.type })),
    });
  }
}
