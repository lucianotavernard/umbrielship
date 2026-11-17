import { afterNextRender, Component, effect, ElementRef, inject, Injector, input, output, signal, viewChild } from '@angular/core';
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

// A new question starts at "Texto livre", as the mareos `makeQuestion`.
const blankQuestion = () => ({ label: '', type: 'TEXT' as QuestionType });

const empty = (): Model => ({ name: '', items: [blankQuestion()] });

// White fields with the mareos focus on any focus, the drawer opening included.
const field =
  'h-9 bg-card text-[11px] md:text-[11px] focus:border-ring/60 focus:ring-[3px] focus:ring-ring/15';

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
  host: { class: 'block' },
  template: `
    <!-- The mareos template drawer: a white form whose actions follow the questions, the drawer scrolling. -->
    <form class="flex flex-col gap-[15px] px-4 pt-[17px] pb-[22px] sm:px-[27px] sm:pt-5 sm:pb-[26px]" novalidate (submit)="submitForm($event)">
      <t-form-group class="gap-1.5">
        <label tLabel for="template-name" class="text-[10px] font-semibold">Nome do modelo</label>
        <input
          #nameInput
          tInput
          id="template-name"
          type="text"
          [class]="field"
          placeholder="Ex.: Inspeção do casco"
          [formField]="templateForm.name"
        />
      </t-form-group>

      <div class="mt-1 flex items-center justify-between gap-3">
        <div>
          <h3 class="text-[12px] font-semibold text-foreground">Perguntas</h3>
          <p class="mt-1 text-[9px] leading-[1.4] text-muted-foreground">
            Todas as perguntas precisam ser respondidas; “Não se aplica” vale como resposta.
          </p>
        </div>
        <button
          type="button"
          class="inline-flex h-[29px] shrink-0 items-center gap-1.5 rounded-[5px] border border-border bg-card px-[9px] text-[9px] text-foreground/75 hover:border-primary/40 hover:text-primary disabled:opacity-50"
          [disabled]="model().items.length >= maxQuestions"
          (click)="add()"
        >
          <ng-icon name="lucidePlus" class="!size-3.5" />
          Adicionar
        </button>
      </div>

      <ol class="flex flex-col gap-[9px]">
        @for (item of model().items; track $index; let index = $index, first = $first, last = $last) {
          <li
            data-slot="question-editor"
            class="flex flex-col gap-2.5 rounded-[7px] border border-border bg-muted/40 p-3"
            [attr.aria-label]="'Pergunta ' + (index + 1)"
          >
            <div class="flex min-h-[25px] items-center justify-between gap-2">
              <strong class="text-[9px] font-semibold text-muted-foreground">Pergunta {{ number(index) }}</strong>
              @if (model().items.length > 1) {
                <!-- Reordering is the umbrielship's own, shown once there is something to reorder (AD-051). -->
                <div class="flex items-center gap-1">
                  <button
                    tButton
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    class="size-[25px]"
                    aria-label="Subir"
                    title="Subir"
                    [disabled]="first"
                    (click)="move(index, -1)"
                  >
                    <ng-icon name="lucideArrowUp" class="!size-3.5" />
                  </button>
                  <button
                    tButton
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    class="size-[25px]"
                    aria-label="Descer"
                    title="Descer"
                    [disabled]="last"
                    (click)="move(index, 1)"
                  >
                    <ng-icon name="lucideArrowDown" class="!size-3.5" />
                  </button>
                  <button
                    tButton
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    class="size-[25px] text-[#a27575] hover:bg-[#fbefed] hover:text-destructive"
                    [attr.aria-label]="'Remover pergunta ' + (index + 1)"
                    [title]="'Remover pergunta ' + (index + 1)"
                    (click)="remove(index)"
                  >
                    <ng-icon name="lucideTrash" class="!size-3.5" />
                  </button>
                </div>
              }
            </div>
            <t-form-group class="gap-1.5">
              <label tLabel [for]="'question-' + index" class="text-[10px] font-semibold">Enunciado</label>
              <input
                tInput
                type="text"
                [class]="field"
                [id]="'question-' + index"
                placeholder="Digite a pergunta"
                [formField]="templateForm.items[index].label"
              />
            </t-form-group>
            <t-form-group class="gap-1.5">
              <label tLabel [for]="'question-type-' + index" class="text-[10px] font-semibold">Tipo de resposta</label>
              <select
                tSelect
                [class]="field"
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

      <footer class="mt-[5px] flex items-center justify-end gap-[9px] border-t border-border pt-[15px]">
        <button tButton type="button" variant="outline" class="h-[35px] bg-card px-[13px] text-[10px] text-muted-foreground" (click)="closed.emit()">
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

  private readonly nameInput = viewChild<ElementRef<HTMLInputElement>>('nameInput');
  private readonly injector = inject(Injector);

  protected readonly field = field;
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

  /** Focuses "Nome do modelo" once the drawer that opens is drawn, as the mareos `autoFocus`. */
  focusFirst() {
    afterNextRender(() => this.nameInput()?.nativeElement.focus(), { injector: this.injector });
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
