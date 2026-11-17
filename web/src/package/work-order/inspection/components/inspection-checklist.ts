import { Component, computed, effect, ElementRef, input, output, signal, viewChildren } from '@angular/core';
import { applyEach, form, FormField, validate } from '@angular/forms/signals';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideLoader2, lucideShieldCheck } from '@ng-icons/lucide';

import { cn } from '../../../shared/components/lib/cn';
import { Button } from '../../../shared/components/ui/button';
import { Confirmation } from '../../../shared/components/ui/confirmation';
import type { QuestionType } from '../../inspection-template/inspection-template.service';
import type { InspectionAssignmentItem } from '../../inspection-assignment/inspection-assignment.service';
import {
  CompleteInspectionRequest,
  InspectionResult,
  NOTE_MAX_LENGTH,
  TEXT_MAX_LENGTH,
} from '../inspection.service';

type Answer = {
  type: QuestionType;
  // Sim/Não and Conforme/Não conforme: true is "Sim" or "Conforme".
  choice: boolean | null;
  score: number | null;
  text: string;
  notApplicable: boolean;
  note: string;
};

const blank = (type: QuestionType): Answer => ({
  type,
  choice: null,
  score: null,
  text: '',
  notApplicable: false,
  note: '',
});

const unanswered = (answer: Answer) => {
  if (answer.notApplicable) return false;
  if (answer.type === 'TEXT') return answer.text.trim() === '';
  if (answer.type === 'SCORE') return answer.score === null;
  return answer.choice === null;
};

const textarea =
  'min-h-[74px] w-full resize-y rounded-[5px] border border-input bg-card px-2.5 py-[9px] text-[10px] leading-[1.5] outline-none placeholder:text-muted-foreground focus:border-ring/60 focus:ring-[3px] focus:ring-ring/15 dark:bg-input/30';

const note =
  'h-9 min-h-9 min-w-[180px] flex-1 resize-y rounded-[5px] border border-input bg-card px-2.5 py-[9px] text-[10px] leading-[1.5] outline-none focus:border-ring/60 focus:ring-[3px] focus:ring-ring/15 dark:bg-input/30';

// Answer controls are at least 40 px tall, for a finger on a phone.
const option = (selected: boolean) =>
  cn(
    'inline-flex h-10 min-w-10 items-center gap-2 rounded-[6px] border px-3 text-[11px] transition-colors',
    selected
      ? 'border-primary bg-primary/10 font-semibold text-primary'
      : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
  );

const resultOption = (selected: boolean) =>
  cn(
    'h-10 min-w-10 rounded-md border px-3 text-sm font-medium transition-colors',
    selected ? 'border-primary bg-primary text-primary-foreground' : 'border-input bg-transparent hover:bg-accent',
  );

/** "01", "02"…: the mareos number of a question. */
const number = (index: number) => String(index + 1).padStart(2, '0');

/**
 * The mareos "Roteiro de inspeção" (AD-045): one numbered card per question with the controls of its
 * type, "Não se aplica" on every question, "Observação (opcional)" on the non-text ones (AD-019).
 */
@Component({
  selector: 'inspection-checklist-ui',
  imports: [NgIcon, FormField, Button, Confirmation],
  viewProviders: [provideIcons({ lucideCheck, lucideLoader2, lucideShieldCheck })],
  template: `
    <form class="flex flex-col" novalidate (submit)="conclude($event)">
      <div class="flex items-center justify-between gap-3 border-b border-border pb-[15px]">
        <div class="flex items-center gap-2.5">
          <span class="grid size-[32px] shrink-0 place-items-center rounded-[8px] bg-[#e3f0ef] text-primary dark:bg-[#17302f]">
            <ng-icon name="lucideShieldCheck" class="!size-4" />
          </span>
          <div>
            <h2 class="text-[13px] font-normal text-foreground">Roteiro de inspeção</h2>
            <p class="mt-[3px] text-[10px] text-muted-foreground">Preencha cada item antes de concluir.</p>
          </div>
        </div>
        <span data-slot="question-total" class="text-[9px] whitespace-nowrap text-muted-foreground">
          {{ items().length }} {{ items().length === 1 ? 'pergunta' : 'perguntas' }}
        </span>
      </div>

      <ol class="mt-3.5 flex flex-col gap-2.5">
        @for (item of items(); track item.id; let index = $index) {
          <li
            #question
            tabindex="-1"
            data-slot="question"
            class="flex gap-3 rounded-[7px] border border-border p-3 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:p-3.5"
          >
            <span
              data-slot="question-number"
              class="grid size-[27px] shrink-0 place-items-center rounded-[6px] bg-muted text-[9px] font-bold text-muted-foreground"
            >
              {{ numberOf(index) }}
            </span>
            <div class="flex min-w-0 flex-1 flex-col gap-2">
              <!-- Every question is required (AD-019): each label carries the mareos required mark. -->
              <p class="text-[11px] leading-[1.45] font-semibold break-words text-foreground">
                <span data-slot="question-label">{{ item.label }}</span>
                <span class="text-[#c47b59]" aria-hidden="true"> *</span>
              </p>

              @switch (item.type) {
                @case ('TEXT') {
                  <textarea
                    [class]="textareaClass"
                    [id]="'answer-' + index"
                    aria-label="Resposta"
                    placeholder="Registre sua observação"
                    [formField]="checklistForm.answers[index].text"
                  ></textarea>
                  <div class="flex flex-wrap gap-2" role="group" aria-label="Resposta">
                    <button
                      type="button"
                      [class]="optionClass(model().answers[index].notApplicable)"
                      [attr.aria-pressed]="model().answers[index].notApplicable"
                      (click)="toggleNotApplicable(index)"
                    >
                      Não se aplica
                    </button>
                  </div>
                }
                @case ('SCORE') {
                  <div class="flex flex-wrap gap-2" role="group" aria-label="Nota">
                    @for (score of scores; track score) {
                      <button
                        type="button"
                        [class]="optionClass(model().answers[index].score === score && !model().answers[index].notApplicable)"
                        [attr.aria-pressed]="model().answers[index].score === score && !model().answers[index].notApplicable"
                        (click)="setScore(index, score)"
                      >
                        {{ score }}
                      </button>
                    }
                    <button
                      type="button"
                      [class]="optionClass(model().answers[index].notApplicable)"
                      [attr.aria-pressed]="model().answers[index].notApplicable"
                      (click)="toggleNotApplicable(index)"
                    >
                      Não se aplica
                    </button>
                  </div>
                }
                @default {
                  <div class="flex flex-wrap gap-2" role="group" aria-label="Resposta">
                    @for (choice of choicesOf(item.type); track choice.label) {
                      <button
                        type="button"
                        [class]="optionClass(model().answers[index].choice === choice.value && !model().answers[index].notApplicable)"
                        [attr.aria-pressed]="model().answers[index].choice === choice.value && !model().answers[index].notApplicable"
                        (click)="setChoice(index, choice.value)"
                      >
                        <i class="size-3 rounded-full border border-current" aria-hidden="true"></i>
                        {{ choice.label }}
                      </button>
                    }
                    <button
                      type="button"
                      [class]="optionClass(model().answers[index].notApplicable)"
                      [attr.aria-pressed]="model().answers[index].notApplicable"
                      (click)="toggleNotApplicable(index)"
                    >
                      <i class="size-3 rounded-full border border-current" aria-hidden="true"></i>
                      Não se aplica
                    </button>
                  </div>
                }
              }

              @if (item.type !== 'TEXT') {
                <!-- A one-row note keeps the whole checklist and "Concluir inspeção" in a laptop window. -->
                <label class="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px]">
                  <span class="shrink-0 text-muted-foreground">Observação (opcional)</span>
                  <textarea
                    rows="1"
                    [class]="noteClass"
                    [id]="'note-' + index"
                    [formField]="checklistForm.answers[index].note"
                  ></textarea>
                </label>
              }

              @for (error of lengthErrors(index); track $index) {
                <p class="text-[10px] font-medium text-destructive" data-slot="error">{{ error }}</p>
              }
            </div>
          </li>
        }
      </ol>

      @if (missing(); as label) {
        <p role="alert" data-slot="missing" class="mt-[13px] text-[11px] font-medium text-destructive">
          Responda à pergunta obrigatória: “{{ label }}”.
        </p>
      }

      <footer class="mt-3.5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3.5">
        <span data-slot="saved-note" class="text-[9px] text-muted-foreground">
          As respostas só são gravadas ao concluir a inspeção.
        </span>
        <button tButton type="submit" class="h-[35px] gap-2 px-[13px] text-[11px] font-semibold" [disabled]="loading()">
          @if (loading()) {
            <ng-icon name="lucideLoader2" class="animate-spin" />
            Salvando...
          } @else {
            <ng-icon name="lucideCheck" class="!size-[15px]" />
            Concluir inspeção
          }
        </button>
      </footer>
    </form>

    <t-confirmation
      title="Concluir inspeção"
      description="Escolha o resultado desta inspeção."
      confirmLabel="Confirmar"
      cancelLabel="Cancelar"
      [isActive]="confirming()"
      [loading]="loading()"
      [disabled]="result() === null"
      (closed)="confirming.set(false)"
      (confirmed)="confirm()"
    >
      <div class="flex flex-col gap-3 py-2">
        <p class="text-sm text-muted-foreground" data-slot="counts">
          Respostas "Não conforme": {{ counts().nonConforming }} · Respostas "Não": {{ counts().no }}
        </p>
        <div class="grid grid-cols-2 gap-2" role="group" aria-label="Resultado">
          @for (choice of results; track choice.value) {
            <button
              type="button"
              [class]="resultClass(result() === choice.value)"
              [attr.aria-pressed]="result() === choice.value"
              (click)="result.set(choice.value)"
            >
              {{ choice.label }}
            </button>
          }
        </div>
      </div>
    </t-confirmation>
  `,
})
export class InspectionChecklist {
  items = input.required<InspectionAssignmentItem[]>();
  loading = input(false);

  submitted = output<CompleteInspectionRequest>();

  private readonly questions = viewChildren<ElementRef<HTMLElement>>('question');

  protected readonly scores = Array.from({ length: 11 }, (_, score) => score);
  protected readonly textareaClass = textarea;
  protected readonly noteClass = note;
  protected readonly optionClass = option;
  protected readonly resultClass = resultOption;
  protected readonly numberOf = number;
  protected readonly results: { value: InspectionResult; label: string }[] = [
    { value: 'APPROVED', label: 'Aprovada' },
    { value: 'REPROVED', label: 'Reprovada' },
  ];

  model = signal<{ answers: Answer[] }>({ answers: [] });
  protected readonly submittedOnce = signal(false);
  protected readonly confirming = signal(false);
  protected readonly result = signal<InspectionResult | null>(null);

  /** How many questions are answered now; "Não se aplica" counts. */
  readonly answered = computed(() => this.model().answers.filter((answer) => !unanswered(answer)).length);

  /** The label of the first unanswered question, once "Concluir inspeção" was used. */
  protected readonly missing = computed(() => {
    if (!this.submittedOnce()) return null;
    const index = this.model().answers.findIndex(unanswered);
    return index === -1 ? null : (this.items()[index]?.label ?? null);
  });

  checklistForm = form(this.model, (path) => {
    applyEach(path.answers, (answer) => {
      validate(answer, ({ value }) =>
        unanswered(value()) ? { kind: 'required', message: 'Responda esta pergunta' } : undefined,
      );
      validate(answer, ({ value }) =>
        !value().notApplicable && value().type === 'TEXT' && value().text.trim().length > TEXT_MAX_LENGTH
          ? { kind: 'maxLength', message: `A resposta deve ter no máximo ${TEXT_MAX_LENGTH} caracteres` }
          : undefined,
      );
      validate(answer, ({ value }) =>
        value().note.trim().length > NOTE_MAX_LENGTH
          ? { kind: 'maxLength', message: `A observação deve ter no máximo ${NOTE_MAX_LENGTH} caracteres` }
          : undefined,
      );
    });
  });

  protected readonly counts = computed(() => {
    const answers = this.model().answers.filter((answer) => !answer.notApplicable);
    return {
      nonConforming: answers.filter((answer) => answer.type === 'CONFORMITY' && answer.choice === false).length,
      no: answers.filter((answer) => answer.type === 'YES_NO' && answer.choice === false).length,
    };
  });

  constructor() {
    effect(() => {
      this.model.set({ answers: this.items().map((item) => blank(item.type)) });
    });
  }

  /** The length errors of a question, once "Concluir inspeção" was used; "unanswered" reads in the alert. */
  protected lengthErrors(index: number): string[] {
    if (!this.submittedOnce()) return [];
    return this.checklistForm.answers[index]()
      .errors()
      .filter((error) => error.kind === 'maxLength')
      .map((error) => error.message ?? '');
  }

  protected choicesOf(type: QuestionType) {
    return type === 'YES_NO'
      ? [
          { value: true, label: 'Sim' },
          { value: false, label: 'Não' },
        ]
      : [
          { value: true, label: 'Conforme' },
          { value: false, label: 'Não conforme' },
        ];
  }

  private patch(index: number, change: Partial<Answer>) {
    this.model.update((model) => ({
      answers: model.answers.map((answer, position) => (position === index ? { ...answer, ...change } : answer)),
    }));
  }

  protected setChoice(index: number, choice: boolean) {
    this.patch(index, { choice, notApplicable: false });
  }

  protected setScore(index: number, score: number) {
    this.patch(index, { score, notApplicable: false });
  }

  protected toggleNotApplicable(index: number) {
    this.patch(index, { notApplicable: !this.model().answers[index].notApplicable });
  }

  conclude(event: Event) {
    event.preventDefault();
    this.submittedOnce.set(true);

    const first = this.model().answers.findIndex(unanswered);
    if (first !== -1) {
      this.questions()[first]?.nativeElement.focus();
      return;
    }
    if (this.checklistForm().invalid()) return;

    this.result.set(null);
    this.confirming.set(true);
  }

  confirm() {
    const result = this.result();
    if (!result) return;

    const items = this.items();
    this.submitted.emit({
      result,
      answers: this.model().answers.map((answer, index) => {
        const note = answer.note.trim();
        const base = { itemId: items[index].id, ...(answer.type !== 'TEXT' && note ? { note } : {}) };
        if (answer.notApplicable) return { ...base, notApplicable: true };
        const value =
          answer.type === 'TEXT' ? answer.text.trim() : answer.type === 'SCORE' ? answer.score! : answer.choice!;
        return { ...base, value };
      }),
    });
  }

  /** Closes the result question, as a failed complete keeps the answers on the page. */
  closeConfirmation() {
    this.confirming.set(false);
  }
}
