import { Component, computed, effect, input, output, signal } from '@angular/core';
import { applyEach, form, FormField, validate } from '@angular/forms/signals';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideLoader2, lucideX } from '@ng-icons/lucide';

import { Button } from '../../../shared/components/ui/button';
import { Confirmation } from '../../../shared/components/ui/confirmation';
import { cn } from '../../../shared/components/lib/cn';
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
  'min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs outline-none md:text-sm dark:bg-input/30 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50';

// Answer controls are at least 40 px tall, for a finger on a phone.
const option = (selected: boolean) =>
  cn(
    'h-10 min-w-10 rounded-md border px-3 text-sm font-medium transition-colors',
    selected ? 'border-primary bg-primary text-primary-foreground' : 'border-input bg-transparent hover:bg-accent',
  );

@Component({
  selector: 'inspection-checklist-ui',
  imports: [NgIcon, FormField, Button, Confirmation],
  viewProviders: [provideIcons({ lucideCheck, lucideLoader2, lucideX })],
  template: `
    <form class="flex flex-col gap-6" novalidate (submit)="conclude($event)">
      <ol class="flex flex-col gap-5">
        @for (item of items(); track item.id; let index = $index) {
          <li class="flex flex-col gap-3 rounded-lg border p-3" data-slot="question">
            <p class="text-sm font-medium break-words">
              <span class="tabular-nums text-muted-foreground">{{ index + 1 }}.</span> {{ item.label }}
            </p>

            @switch (item.type) {
              @case ('TEXT') {
                <textarea
                  [class]="textareaClass"
                  [id]="'answer-' + index"
                  aria-label="Resposta"
                  [formField]="checklistForm.answers[index].text"
                ></textarea>
              }
              @case ('SCORE') {
                <div class="flex flex-wrap gap-2" role="group" aria-label="Nota">
                  @for (score of scores; track score) {
                    <button
                      type="button"
                      [class]="optionClass(model().answers[index].score === score && !model().answers[index].notApplicable)"
                      [attr.aria-pressed]="model().answers[index].score === score"
                      (click)="setScore(index, score)"
                    >
                      {{ score }}
                    </button>
                  }
                </div>
              }
              @default {
                <div class="flex flex-wrap gap-2" role="group">
                  @for (choice of choicesOf(item.type); track choice.label) {
                    <button
                      type="button"
                      [class]="optionClass(model().answers[index].choice === choice.value && !model().answers[index].notApplicable)"
                      [attr.aria-pressed]="model().answers[index].choice === choice.value"
                      (click)="setChoice(index, choice.value)"
                    >
                      {{ choice.label }}
                    </button>
                  }
                </div>
              }
            }

            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                [class]="optionClass(model().answers[index].notApplicable)"
                [attr.aria-pressed]="model().answers[index].notApplicable"
                (click)="toggleNotApplicable(index)"
              >
                Não se aplica
              </button>
            </div>

            @if (item.type !== 'TEXT') {
              <label class="flex flex-col gap-1 text-sm">
                <span class="text-muted-foreground">Observação (opcional)</span>
                <textarea
                  [class]="textareaClass"
                  [id]="'note-' + index"
                  [formField]="checklistForm.answers[index].note"
                ></textarea>
              </label>
            }

            @if (submittedOnce()) {
              @for (error of checklistForm.answers[index]().errors(); track $index) {
                <p class="text-sm font-medium text-destructive" data-slot="error">{{ error.message }}</p>
              }
            }
          </li>
        }
      </ol>

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
            Concluir
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
              [class]="optionClass(result() === choice.value)"
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
  closed = output<void>();

  protected readonly scores = Array.from({ length: 11 }, (_, score) => score);
  protected readonly textareaClass = textarea;
  protected readonly optionClass = option;
  protected readonly results: { value: InspectionResult; label: string }[] = [
    { value: 'APPROVED', label: 'Aprovada' },
    { value: 'REPROVED', label: 'Reprovada' },
  ];

  model = signal<{ answers: Answer[] }>({ answers: [] });
  protected readonly submittedOnce = signal(false);
  protected readonly confirming = signal(false);
  protected readonly result = signal<InspectionResult | null>(null);


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

    if (this.checklistForm().invalid()) {
      return;
    }

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

  close() {
    this.confirming.set(false);
  }
}
